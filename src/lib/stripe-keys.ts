import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto"

/**
 * Chiffrement des secrets Stripe des profs (clé API restreinte, secret de webhook).
 *
 * Format : `v<version>:<iv>:<tag>:<ciphertext>` (base64), AES-256-GCM, IV de 12 octets tiré
 * au hasard à chaque chiffrement. Les données associées (AAD) lient le blob à son prof, au mode,
 * à l'usage et à la version de clé : un blob copié ailleurs ne se déchiffre pas.
 *
 * La clé maître (32 octets, base64) vient de l'environnement, jamais de la base ni du dépôt :
 * - version courante : STRIPE_KEYS_ENCRYPTION_KEY
 * - versions précédentes (rotation) : STRIPE_KEYS_ENCRYPTION_KEY_V<n>, prioritaire pour la version n
 *
 * Ce module est le seul à manipuler ces secrets en clair. Les erreurs sont volontairement
 * génériques : jamais de clair, de blob ni de clé dans un message.
 */

export const CURRENT_ENCRYPTION_KEY_VERSION = 1

const IV_BYTES = 12
const TAG_BYTES = 16
const KEY_BYTES = 32

export type StripeSecretMode = "TEST" | "LIVE"
export type StripeSecretUsage = "secret-key" | "webhook-secret"

export interface SecretContext {
  profId: string
  mode: StripeSecretMode
  usage: StripeSecretUsage
}

function failure(): Error {
  return new Error("Stripe secret encryption failure")
}

function loadKey(version: number): Buffer {
  const specific = process.env[`STRIPE_KEYS_ENCRYPTION_KEY_V${version}`]
  const raw =
    specific ??
    (version === CURRENT_ENCRYPTION_KEY_VERSION
      ? process.env.STRIPE_KEYS_ENCRYPTION_KEY
      : undefined)
  if (!raw) throw failure()
  const key = Buffer.from(raw, "base64")
  if (key.length !== KEY_BYTES) throw failure()
  return key
}

function aad(ctx: SecretContext, version: number): Buffer {
  return Buffer.from(`${ctx.profId}|${ctx.mode}|${ctx.usage}|${version}`, "utf8")
}

export function encryptSecret(plain: string, ctx: SecretContext): string {
  const version = CURRENT_ENCRYPTION_KEY_VERSION
  const key = loadKey(version)
  const iv = randomBytes(IV_BYTES)
  const cipher = createCipheriv("aes-256-gcm", key, iv)
  cipher.setAAD(aad(ctx, version))
  const data = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()])
  const tag = cipher.getAuthTag()
  return [
    `v${version}`,
    iv.toString("base64"),
    tag.toString("base64"),
    data.toString("base64"),
  ].join(":")
}

export function decryptSecret(blob: string, ctx: SecretContext): string {
  try {
    const parts = blob.split(":")
    if (parts.length !== 4) throw failure()
    const match = /^v(\d+)$/.exec(parts[0])
    if (!match) throw failure()
    const version = Number(match[1])
    const iv = Buffer.from(parts[1], "base64")
    const tag = Buffer.from(parts[2], "base64")
    const data = Buffer.from(parts[3], "base64")
    if (iv.length !== IV_BYTES || tag.length !== TAG_BYTES) throw failure()

    const decipher = createDecipheriv("aes-256-gcm", loadKey(version), iv)
    decipher.setAAD(aad(ctx, version))
    decipher.setAuthTag(tag)
    return Buffer.concat([decipher.update(data), decipher.final()]).toString("utf8")
  } catch {
    // Toute cause (format, version, clé, tag, AAD) donne la même erreur : pas d'oracle
    throw failure()
  }
}
