import { describe, it, expect, beforeEach, afterEach } from "vitest"
import { randomBytes } from "node:crypto"
import {
  encryptSecret,
  decryptSecret,
  CURRENT_ENCRYPTION_KEY_VERSION,
} from "@/lib/stripe-keys"

const ctx = { profId: "prof-1", mode: "TEST" as const, usage: "secret-key" as const }
const SECRET = "rk_test_FAKEFAKEFAKEFAKE1234"

describe("stripe-keys", () => {
  const original = { ...process.env }

  beforeEach(() => {
    process.env.STRIPE_KEYS_ENCRYPTION_KEY = randomBytes(32).toString("base64")
    delete process.env.STRIPE_KEYS_ENCRYPTION_KEY_V2
  })

  afterEach(() => {
    process.env = { ...original }
  })

  it("decrypts what it encrypted", () => {
    const blob = encryptSecret(SECRET, ctx)
    expect(decryptSecret(blob, ctx)).toBe(SECRET)
  })

  it("uses the versioned format v<version>:iv:tag:ciphertext", () => {
    const blob = encryptSecret(SECRET, ctx)
    const parts = blob.split(":")
    expect(parts).toHaveLength(4)
    expect(parts[0]).toBe(`v${CURRENT_ENCRYPTION_KEY_VERSION}`)
    expect(Buffer.from(parts[1], "base64")).toHaveLength(12)
    expect(Buffer.from(parts[2], "base64")).toHaveLength(16)
  })

  it("never stores the plaintext in the blob", () => {
    expect(encryptSecret(SECRET, ctx)).not.toContain("FAKEFAKE")
  })

  it("produces a different blob for the same plaintext (unique IV)", () => {
    const a = encryptSecret(SECRET, ctx)
    const b = encryptSecret(SECRET, ctx)
    expect(a).not.toBe(b)
    expect(a.split(":")[1]).not.toBe(b.split(":")[1])
  })

  it.each([
    ["another prof", { ...ctx, profId: "prof-2" }],
    ["another mode", { ...ctx, mode: "LIVE" as const }],
    ["another usage", { ...ctx, usage: "webhook-secret" as const }],
  ])("fails closed when decrypted for %s", (_label, other) => {
    const blob = encryptSecret(SECRET, ctx)
    expect(() => decryptSecret(blob, other)).toThrow()
  })

  it("fails when the ciphertext is altered", () => {
    const parts = encryptSecret(SECRET, ctx).split(":")
    const data = Buffer.from(parts[3], "base64")
    data[0] ^= 0xff
    parts[3] = data.toString("base64")
    expect(() => decryptSecret(parts.join(":"), ctx)).toThrow()
  })

  it("fails when the auth tag is altered", () => {
    const parts = encryptSecret(SECRET, ctx).split(":")
    const tag = Buffer.from(parts[2], "base64")
    tag[0] ^= 0xff
    parts[2] = tag.toString("base64")
    expect(() => decryptSecret(parts.join(":"), ctx)).toThrow()
  })

  it("fails when the version label is rewritten (version is part of the AAD)", () => {
    const parts = encryptSecret(SECRET, ctx).split(":")
    process.env.STRIPE_KEYS_ENCRYPTION_KEY_V2 = process.env.STRIPE_KEYS_ENCRYPTION_KEY
    parts[0] = "v2"
    expect(() => decryptSecret(parts.join(":"), ctx)).toThrow()
  })

  it("rejects malformed blobs", () => {
    expect(() => decryptSecret("not-a-blob", ctx)).toThrow()
    expect(() => decryptSecret("v1:a:b", ctx)).toThrow()
    expect(() => decryptSecret("", ctx)).toThrow()
  })

  it("fails when the encryption key is missing", () => {
    delete process.env.STRIPE_KEYS_ENCRYPTION_KEY
    expect(() => encryptSecret(SECRET, ctx)).toThrow()
  })

  it("fails when the encryption key is not 32 bytes", () => {
    process.env.STRIPE_KEYS_ENCRYPTION_KEY = randomBytes(16).toString("base64")
    expect(() => encryptSecret(SECRET, ctx)).toThrow()
  })

  it("fails when the key used for decryption differs", () => {
    const blob = encryptSecret(SECRET, ctx)
    process.env.STRIPE_KEYS_ENCRYPTION_KEY = randomBytes(32).toString("base64")
    expect(() => decryptSecret(blob, ctx)).toThrow()
  })

  it("never leaks the plaintext in error messages", () => {
    const blob = encryptSecret(SECRET, ctx)
    try {
      decryptSecret(blob, { ...ctx, profId: "other" })
    } catch (error) {
      expect(String((error as Error).message)).not.toContain("FAKEFAKE")
      expect(String((error as Error).message)).not.toContain(blob)
    }
    expect.assertions(2)
  })

  it("decrypts a blob written with a previous key version", () => {
    const keyV1 = randomBytes(32).toString("base64")
    process.env.STRIPE_KEYS_ENCRYPTION_KEY = keyV1
    const blob = encryptSecret(SECRET, ctx)
    // Rotation: the current key moves to a new variable, the old one keeps its version label
    process.env.STRIPE_KEYS_ENCRYPTION_KEY_V1 = keyV1
    process.env.STRIPE_KEYS_ENCRYPTION_KEY = randomBytes(32).toString("base64")
    expect(decryptSecret(blob, ctx)).toBe(SECRET)
  })
})
