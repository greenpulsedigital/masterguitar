import { prisma } from "@/lib/prisma"

/**
 * Limitation de débit à fenêtre fixe, stockée en base pour rester valable
 * quand plusieurs instances de l'application tournent.
 */

export interface RateLimitOptions {
  max: number
  windowSeconds: number
}

export interface RateLimitResult {
  allowed: boolean
  remaining: number
}

/** Tentatives de connexion d'un compte Stripe (s19) : valeurs de départ, à ajuster. */
export const CONNECT_USER_LIMIT: RateLimitOptions = { max: 5, windowSeconds: 15 * 60 }
export const CONNECT_IP_LIMIT: RateLimitOptions = { max: 20, windowSeconds: 60 * 60 }

const RETENTION_MS = 24 * 60 * 60 * 1000

export async function checkRateLimit(
  key: string,
  { max, windowSeconds }: RateLimitOptions
): Promise<RateLimitResult> {
  const windowMs = windowSeconds * 1000
  const now = Date.now()
  const windowStart = new Date(Math.floor(now / windowMs) * windowMs)

  const row = await prisma.rateLimit.upsert({
    where: { key_windowStart: { key, windowStart } },
    create: { key, windowStart, count: 1 },
    update: { count: { increment: 1 } },
  })

  // Nettoyage opportuniste : à la création d'une fenêtre, on supprime les anciennes
  if (row.count === 1) {
    await prisma.rateLimit.deleteMany({
      where: { windowStart: { lt: new Date(now - RETENTION_MS) } },
    })
  }

  return { allowed: row.count <= max, remaining: Math.max(0, max - row.count) }
}

/**
 * Contrôle combiné par utilisateur et par adresse IP. Les deux compteurs sont
 * incrémentés à chaque tentative ; il suffit qu'un seul dépasse pour refuser.
 * La connexion et la déconnexion ont chacune leurs compteurs (`scope`).
 */
export async function checkConnectRateLimit(params: {
  userId: string
  ip: string
  scope?: "connect" | "disconnect"
}): Promise<RateLimitResult> {
  const scope = params.scope ?? "connect"
  const [byUser, byIp] = await Promise.all([
    checkRateLimit(`${scope}:user:${params.userId}`, CONNECT_USER_LIMIT),
    checkRateLimit(`${scope}:ip:${params.ip}`, CONNECT_IP_LIMIT),
  ])
  return {
    allowed: byUser.allowed && byIp.allowed,
    remaining: Math.min(byUser.remaining, byIp.remaining),
  }
}

/**
 * Adresse du client d'après `x-forwarded-for` (premier élément).
 * À n'utiliser que derrière un proxy de confiance : l'en-tête est sinon falsifiable.
 * Sans valeur exploitable, tous les clients partagent le seau « unknown ».
 */
export function getClientIp(headers: Headers): string {
  const first = headers.get("x-forwarded-for")?.split(",")[0]?.trim()
  return first ? first.slice(0, 64) : "unknown"
}
