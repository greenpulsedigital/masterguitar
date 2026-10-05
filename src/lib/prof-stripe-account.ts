import { randomUUID } from "node:crypto"
import Stripe from "stripe"
import { prisma } from "@/lib/prisma"
import { getBaseUrl } from "@/lib/app-url"
import {
  CURRENT_ENCRYPTION_KEY_VERSION,
  decryptSecret,
  encryptSecret,
  type StripeSecretMode,
} from "@/lib/stripe-keys"

/**
 * Compte Stripe d'un prof (ADR 004 : un compte Stripe par prof, sans Connect).
 *
 * Règles de ce module :
 * - la clé et le secret de webhook ne sont qu'ici en clair, le temps d'un appel, puis chiffrés ;
 * - aucun message d'erreur de Stripe ni aucune valeur secrète n'est journalisé ou renvoyé ;
 * - toute clé refusée, quelle que soit la cause, donne le même résultat (`REFUSED`).
 */

export const DISCONNECT_RECONCILIATION_HOURS = 72

export const WEBHOOK_EVENTS = [
  "checkout.session.completed",
  "checkout.session.async_payment_succeeded",
] as const

const STRIPE_API_VERSION = "2026-07-29.dahlia"
const MAX_KEY_LENGTH = 300
const KEY_PATTERN = /^rk_(test|live)_[A-Za-z0-9]+$/
const ACCOUNT_ID_PATTERN = /^acct_[A-Za-z0-9]+$/

/** Sous-ensemble du client Stripe utilisé ici ; permet d'injecter un faux client dans les tests. */
export interface StripeClientLike {
  accounts: { retrieve(): Promise<{ id: string }> }
  webhookEndpoints: {
    create(
      params: { url: string; enabled_events: string[] },
      options?: { idempotencyKey?: string }
    ): Promise<{ id: string; secret?: string | null }>
    del(id: string): Promise<unknown>
    list(params: { limit: number }): Promise<{ data: { id: string; url: string }[] }>
  }
}

export type StripeClientFactory = (key: string) => StripeClientLike

const defaultCreateClient: StripeClientFactory = (key) =>
  new Stripe(key, {
    apiVersion: STRIPE_API_VERSION,
    typescript: true,
  }) as unknown as StripeClientLike

export interface ServiceDeps {
  createClient?: StripeClientFactory
  now?: () => Date
}

export type ConnectResult =
  | { ok: true; mode: StripeSecretMode; keyLast4: string }
  | { ok: false; reason: "REFUSED" | "BLOCKED" | "ERROR" }

export type ProfStripeStatus =
  | { status: "NOT_CONFIGURED" }
  | {
      status: "ACTIVE" | "INVALID" | "DISCONNECTING"
      mode: StripeSecretMode
      keyLast4: string
      reconcileUntil: Date | null
    }

/** Journalise une erreur sans jamais écrire son message (il peut contenir une clé). */
function safeLog(label: string, error: unknown) {
  const e = (error ?? {}) as { type?: unknown; code?: unknown; statusCode?: unknown }
  console.error(label, {
    type: typeof e.type === "string" ? e.type : undefined,
    code: typeof e.code === "string" ? e.code : undefined,
    statusCode: typeof e.statusCode === "number" ? e.statusCode : undefined,
  })
}

/**
 * Contrôle local d'une clé saisie : clé restreinte uniquement (les clés `sk_` sont refusées),
 * mode déduit du préfixe (l'objet compte de Stripe n'a pas de champ `livemode`).
 * Production : clés live uniquement ; hors production : clés de test uniquement.
 */
export function parseRestrictedKey(
  raw: string,
  nodeEnv: string | undefined = process.env.NODE_ENV
): { key: string; mode: StripeSecretMode; last4: string } | null {
  const key = typeof raw === "string" ? raw.trim() : ""
  if (key.length === 0 || key.length > MAX_KEY_LENGTH) return null

  const match = KEY_PATTERN.exec(key)
  if (!match) return null

  const mode: StripeSecretMode = match[1] === "live" ? "LIVE" : "TEST"
  const isProduction = nodeEnv === "production"
  if (isProduction && mode !== "LIVE") return null
  if (!isProduction && mode !== "TEST") return null

  return { key, mode, last4: key.slice(-4) }
}

async function bestEffortDeleteEndpoint(stripe: StripeClientLike, endpointId: string) {
  try {
    await stripe.webhookEndpoints.del(endpointId)
  } catch (error) {
    safeLog("stripe webhook endpoint cleanup failed", error)
  }
}

export async function connectAccount(
  input: { profId: string; rawKey: string },
  deps: ServiceDeps = {}
): Promise<ConnectResult> {
  const createClient = deps.createClient ?? defaultCreateClient
  const { profId } = input

  const parsed = parseRestrictedKey(input.rawKey)
  if (!parsed) return { ok: false, reason: "REFUSED" }

  // Un prof n'a qu'un compte : on ne remplace que la clé d'un compte invalide
  const existing = await prisma.profStripeAccount.findUnique({ where: { profId } })
  if (existing && existing.status !== "INVALID") return { ok: false, reason: "BLOCKED" }

  const stripe = createClient(parsed.key)

  let stripeAccountId: string
  try {
    stripeAccountId = (await stripe.accounts.retrieve()).id
  } catch (error) {
    safeLog("stripe account verification failed", error)
    return { ok: false, reason: "REFUSED" }
  }
  if (!ACCOUNT_ID_PATTERN.test(stripeAccountId)) return { ok: false, reason: "REFUSED" }

  // Un compte Stripe ne peut être lié qu'à un prof par mode (même refus générique)
  const linked = await prisma.profStripeAccount.findUnique({
    where: { stripeAccountId_mode: { stripeAccountId, mode: parsed.mode } },
  })
  if (linked && linked.profId !== profId) return { ok: false, reason: "REFUSED" }

  let url: string
  try {
    url = `${getBaseUrl()}/api/webhooks/stripe/${profId}`
  } catch (error) {
    safeLog("app url is not configured", error)
    return { ok: false, reason: "ERROR" }
  }

  // Un endpoint déjà présent à cette URL (essai précédent, ancienne clé du même compte) ne peut
  // pas être réutilisé : Stripe ne renvoie son secret de signature qu'à la création. On le supprime
  // (au mieux) avant d'en créer un neuf. Stripe limite un compte à 16 endpoints : une page suffit.
  let leftovers: string[]
  try {
    const { data } = await stripe.webhookEndpoints.list({ limit: 100 })
    leftovers = data.filter((existingEndpoint) => existingEndpoint.url === url).map(({ id }) => id)
  } catch (error) {
    safeLog("stripe webhook endpoint listing failed", error)
    return { ok: false, reason: "REFUSED" }
  }
  for (const id of leftovers) await bestEffortDeleteEndpoint(stripe, id)

  // Clé d'idempotence propre à chaque essai : une clé stable ferait renvoyer par Stripe, pendant
  // 24 h, la réponse mise en cache d'un endpoint supprimé entre-temps (échec d'enregistrement).
  // Les doublons d'un essai interrompu sont supprimés par le nettoyage ci-dessus.
  let endpoint: { id: string; secret?: string | null }
  try {
    endpoint = await stripe.webhookEndpoints.create(
      { url, enabled_events: [...WEBHOOK_EVENTS] },
      { idempotencyKey: `webhook:${profId}:${parsed.mode}:${stripeAccountId}:${randomUUID()}` }
    )
  } catch (error) {
    safeLog("stripe webhook endpoint creation failed", error)
    return { ok: false, reason: "REFUSED" }
  }

  // Le secret de signature n'est renvoyé qu'à la création : sans lui, l'endpoint est inutilisable
  if (!endpoint.secret) {
    await bestEffortDeleteEndpoint(stripe, endpoint.id)
    return { ok: false, reason: "ERROR" }
  }

  try {
    const data = {
      stripeAccountId,
      mode: parsed.mode,
      status: "ACTIVE" as const,
      keyLast4: parsed.last4,
      encryptedSecretKey: encryptSecret(parsed.key, {
        profId,
        mode: parsed.mode,
        usage: "secret-key",
      }),
      webhookEndpointId: endpoint.id,
      encryptedWebhookSecret: encryptSecret(endpoint.secret, {
        profId,
        mode: parsed.mode,
        usage: "webhook-secret",
      }),
      encryptionKeyVersion: CURRENT_ENCRYPTION_KEY_VERSION,
      reconcileUntil: null,
    }
    await prisma.profStripeAccount.upsert({
      where: { profId },
      create: { profId, ...data },
      update: data,
    })
  } catch (error) {
    safeLog("prof stripe account persistence failed", error)
    await bestEffortDeleteEndpoint(stripe, endpoint.id)
    const code = (error as { code?: unknown })?.code
    return { ok: false, reason: code === "P2002" ? "REFUSED" : "ERROR" }
  }

  // Remplacement : l'ancien endpoint est supprimé avec l'ancienne clé (probablement révoquée : au mieux)
  if (existing?.webhookEndpointId) {
    try {
      const oldKey = decryptSecret(existing.encryptedSecretKey, {
        profId,
        mode: existing.mode,
        usage: "secret-key",
      })
      await bestEffortDeleteEndpoint(createClient(oldKey), existing.webhookEndpointId)
    } catch (error) {
      safeLog("previous stripe webhook endpoint cleanup skipped", error)
    }
  }

  return { ok: true, mode: parsed.mode, keyLast4: parsed.last4 }
}

/** Statut affiché dans l'interface. Ne renvoie jamais de champ chiffré. */
export async function getProfStripeStatus(profId: string): Promise<ProfStripeStatus> {
  const account = await prisma.profStripeAccount.findUnique({ where: { profId } })
  if (!account) return { status: "NOT_CONFIGURED" }
  return {
    status: account.status,
    mode: account.mode,
    keyLast4: account.keyLast4,
    reconcileUntil: account.reconcileUntil ?? null,
  }
}

/** Appelé quand Stripe refuse la clé enregistrée (utilisé par s20). Ne touche qu'un compte actif. */
export async function markAccountInvalid(profId: string): Promise<void> {
  await prisma.profStripeAccount.updateMany({
    where: { profId, status: "ACTIVE" },
    data: { status: "INVALID" },
  })
}

/**
 * Début de déconnexion : les nouveaux paiements et publications sont bloqués tout de suite,
 * mais l'endpoint, la clé et le secret sont conservés pendant la fenêtre de réconciliation
 * pour traiter les événements en vol. Idempotent : la première échéance est conservée.
 */
export async function startDisconnect(
  profId: string,
  deps: Pick<ServiceDeps, "now"> = {}
): Promise<{ ok: true; reconcileUntil: Date } | { ok: false }> {
  const now = (deps.now ?? (() => new Date()))()
  const account = await prisma.profStripeAccount.findUnique({ where: { profId } })
  if (!account) return { ok: false }

  if (account.status === "DISCONNECTING" && account.reconcileUntil) {
    return { ok: true, reconcileUntil: account.reconcileUntil }
  }

  const reconcileUntil = new Date(now.getTime() + DISCONNECT_RECONCILIATION_HOURS * 3600 * 1000)
  await prisma.profStripeAccount.update({
    where: { profId },
    data: { status: "DISCONNECTING", reconcileUntil },
  })
  return { ok: true, reconcileUntil }
}

/**
 * Fin de déconnexion : supprime l'endpoint chez Stripe (au mieux), puis les secrets et la ligne.
 * La ligne est supprimée même si le nettoyage Stripe échoue, pour ne pas garder de secret indéfiniment.
 * Exécuté paresseusement (page de réglages, connexion) en attendant un déclencheur périodique.
 */
export async function purgeExpiredDisconnections(deps: ServiceDeps = {}): Promise<number> {
  const createClient = deps.createClient ?? defaultCreateClient
  const now = (deps.now ?? (() => new Date()))()

  const expired = await prisma.profStripeAccount.findMany({
    where: { status: "DISCONNECTING", reconcileUntil: { lte: now } },
  })

  for (const account of expired) {
    if (account.webhookEndpointId) {
      try {
        const key = decryptSecret(account.encryptedSecretKey, {
          profId: account.profId,
          mode: account.mode,
          usage: "secret-key",
        })
        await bestEffortDeleteEndpoint(createClient(key), account.webhookEndpointId)
      } catch (error) {
        safeLog("stripe webhook endpoint cleanup skipped at purge", error)
      }
    }
    await prisma.profStripeAccount.delete({ where: { profId: account.profId } })
  }

  return expired.length
}
