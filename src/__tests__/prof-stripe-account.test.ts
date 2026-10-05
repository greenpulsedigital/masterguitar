import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { randomBytes } from "node:crypto"

const db = vi.hoisted(() => ({ rows: new Map<string, Record<string, unknown>>(), failWrite: null as null | Error }))

vi.mock("@/lib/prisma", () => {
  const rows = db.rows
  const find = (where: Record<string, unknown>) => {
    if (typeof where.profId === "string") return rows.get(where.profId) ?? null
    const compound = where.stripeAccountId_mode as { stripeAccountId: string; mode: string } | undefined
    if (compound) {
      return (
        [...rows.values()].find(
          (r) => r.stripeAccountId === compound.stripeAccountId && r.mode === compound.mode
        ) ?? null
      )
    }
    return null
  }
  return {
    prisma: {
      profStripeAccount: {
        findUnique: vi.fn(async ({ where }) => find(where)),
        findMany: vi.fn(async ({ where }) =>
          [...rows.values()].filter(
            (r) =>
              r.status === where.status &&
              (r.reconcileUntil as Date) <= (where.reconcileUntil as { lte: Date }).lte
          )
        ),
        upsert: vi.fn(async ({ where, create, update }) => {
          if (db.failWrite) throw db.failWrite
          const existing = rows.get(where.profId)
          const row = existing ? { ...existing, ...update } : { ...create }
          rows.set(where.profId, row)
          return row
        }),
        update: vi.fn(async ({ where, data }) => {
          const existing = rows.get(where.profId)
          if (!existing) throw new Error("not found")
          const row = { ...existing, ...data }
          rows.set(where.profId, row)
          return row
        }),
        updateMany: vi.fn(async ({ where, data }) => {
          const existing = rows.get(where.profId)
          if (!existing || (where.status && existing.status !== where.status)) return { count: 0 }
          rows.set(where.profId, { ...existing, ...data })
          return { count: 1 }
        }),
        delete: vi.fn(async ({ where }) => {
          rows.delete(where.profId)
          return {}
        }),
      },
    },
  }
})

import {
  parseRestrictedKey,
  connectAccount,
  getProfStripeStatus,
  markAccountInvalid,
  startDisconnect,
  purgeExpiredDisconnections,
  DISCONNECT_RECONCILIATION_HOURS,
  WEBHOOK_EVENTS,
} from "@/lib/prof-stripe-account"
import { decryptSecret } from "@/lib/stripe-keys"
import type { StripeClientFactory, StripeClientLike } from "@/lib/prof-stripe-account"

// Les fausses clés « live » sont assemblées à l'exécution : un littéral de cette forme
// déclenche la détection de secrets de GitHub (le dépôt est public).
const fakeKey = (kind: "sk" | "rk", mode: "live" | "test") =>
  [kind, mode, "FAKEKEYFAKEKEYFAKEKEY1234"].join("_")

const RAW_KEY = "rk_test_FAKEKEYFAKEKEYFAKEKEY1234"
const WEBHOOK_SECRET = "whsec_FAKESECRETFAKESECRET99"

function fakeStripe(overrides: Partial<{
  retrieve: ReturnType<typeof vi.fn>
  create: ReturnType<typeof vi.fn>
  del: ReturnType<typeof vi.fn>
  list: ReturnType<typeof vi.fn>
}> = {}) {
  const retrieve = overrides.retrieve ?? vi.fn().mockResolvedValue({ id: "acct_FAKE0001" })
  const create =
    overrides.create ?? vi.fn().mockResolvedValue({ id: "we_FAKE0001", secret: WEBHOOK_SECRET })
  const del = overrides.del ?? vi.fn().mockResolvedValue({ deleted: true })
  const list = overrides.list ?? vi.fn().mockResolvedValue({ data: [] })
  const client = {
    accounts: { retrieve },
    webhookEndpoints: { create, del, list },
  } as unknown as StripeClientLike
  const createClient = vi.fn<StripeClientFactory>(() => client)
  return { client, retrieve, create, del, list, createClient }
}

describe("parseRestrictedKey", () => {
  it("accepts a test restricted key outside production", () => {
    expect(parseRestrictedKey(RAW_KEY, "development")).toEqual({
      key: RAW_KEY,
      mode: "TEST",
      last4: "1234",
    })
  })

  it("trims surrounding whitespace", () => {
    expect(parseRestrictedKey(`  ${RAW_KEY}\n`, "test")?.key).toBe(RAW_KEY)
  })

  it.each([
    ["a full secret key", "sk_test_FAKEKEYFAKEKEYFAKEKEY1234"],
    ["a live full secret key", fakeKey("sk", "live")],
    ["a publishable key", "pk_test_FAKEKEYFAKEKEYFAKEKEY1234"],
    ["an empty string", ""],
    ["whitespace only", "   "],
    ["a key with inner spaces", "rk_test_FAKE KEY"],
    ["a key with forbidden characters", "rk_test_FAKE$KEY%"],
    ["an unknown prefix", "xx_test_FAKEKEYFAKEKEY1234"],
    ["a key that is too long", `rk_test_${"A".repeat(400)}`],
    ["a key without body", "rk_test_"],
  ])("rejects %s", (_label, raw) => {
    expect(parseRestrictedKey(raw, "development")).toBeNull()
  })

  it("rejects a live key outside production", () => {
    expect(parseRestrictedKey(fakeKey("rk", "live"), "development")).toBeNull()
  })

  it("rejects a test key in production", () => {
    expect(parseRestrictedKey(RAW_KEY, "production")).toBeNull()
  })

  it("accepts a live key in production", () => {
    expect(parseRestrictedKey(fakeKey("rk", "live"), "production")).toMatchObject({
      mode: "LIVE",
    })
  })
})

describe("prof stripe account service", () => {
  const original = { ...process.env }
  let consoleSpies: ReturnType<typeof vi.spyOn>[]

  beforeEach(() => {
    db.rows.clear()
    db.failWrite = null
    process.env.STRIPE_KEYS_ENCRYPTION_KEY = randomBytes(32).toString("base64")
    process.env.NEXT_PUBLIC_APP_URL = "http://localhost:3000"
    consoleSpies = (["log", "warn", "error", "info"] as const).map((m) =>
      vi.spyOn(console, m).mockImplementation(() => {})
    )
  })

  afterEach(() => {
    process.env = { ...original }
    vi.restoreAllMocks()
  })

  function loggedText() {
    return JSON.stringify(consoleSpies.flatMap((spy) => spy.mock.calls))
  }

  describe("connectAccount", () => {
    it("connects a valid key and returns only non-secret data", async () => {
      const stripe = fakeStripe()

      const result = await connectAccount(
        { profId: "prof-1", rawKey: RAW_KEY },
        { createClient: stripe.createClient }
      )

      expect(result).toEqual({ ok: true, mode: "TEST", keyLast4: "1234" })
      expect(stripe.createClient).toHaveBeenCalledWith(RAW_KEY)
    })

    it("creates the webhook endpoint with the expected parameters", async () => {
      const stripe = fakeStripe()

      await connectAccount({ profId: "prof-1", rawKey: RAW_KEY }, { createClient: stripe.createClient })

      expect(stripe.create).toHaveBeenCalledTimes(1)
      const [params, options] = stripe.create.mock.calls[0]
      expect(params.url).toBe("http://localhost:3000/api/webhooks/stripe/prof-1")
      expect(params.enabled_events).toEqual([...WEBHOOK_EVENTS])
      expect(options.idempotencyKey).toMatch(/^webhook:prof-1:TEST:acct_FAKE0001:[0-9a-f-]{36}$/)
    })

    it("uses a fresh idempotency key on each attempt", async () => {
      // Une clé stable ferait renvoyer par Stripe, pendant 24 h, un endpoint déjà supprimé
      const stripe = fakeStripe()
      db.failWrite = new Error("db down")
      await connectAccount({ profId: "prof-1", rawKey: RAW_KEY }, { createClient: stripe.createClient })
      db.failWrite = null
      await connectAccount({ profId: "prof-1", rawKey: RAW_KEY }, { createClient: stripe.createClient })

      const [first, second] = stripe.create.mock.calls.map(([, options]) => options.idempotencyKey)
      expect(first).not.toBe(second)
    })

    it("removes leftover endpoints with the same URL before creating a new one", async () => {
      // Le secret n'est donné qu'à la création : un endpoint existant ne peut pas être réutilisé
      const url = "http://localhost:3000/api/webhooks/stripe/prof-1"
      const stripe = fakeStripe({
        list: vi.fn().mockResolvedValue({
          data: [
            { id: "we_OLD0001", url },
            { id: "we_OTHER01", url: "https://shop.example.com/hooks" },
            { id: "we_OLD0002", url },
          ],
        }),
      })

      const result = await connectAccount(
        { profId: "prof-1", rawKey: RAW_KEY },
        { createClient: stripe.createClient }
      )

      expect(result.ok).toBe(true)
      expect(stripe.list).toHaveBeenCalledWith({ limit: 100 })
      expect(stripe.del.mock.calls.map(([id]) => id)).toEqual(["we_OLD0001", "we_OLD0002"])
      expect(stripe.del.mock.invocationCallOrder[1]).toBeLessThan(stripe.create.mock.invocationCallOrder[0])
      expect(db.rows.get("prof-1")!.webhookEndpointId).toBe("we_FAKE0001")
    })

    it("still connects when a leftover endpoint cannot be removed", async () => {
      const stripe = fakeStripe({
        list: vi.fn().mockResolvedValue({
          data: [{ id: "we_OLD0001", url: "http://localhost:3000/api/webhooks/stripe/prof-1" }],
        }),
        del: vi.fn().mockRejectedValue(new Error("cannot delete")),
      })

      const result = await connectAccount(
        { profId: "prof-1", rawKey: RAW_KEY },
        { createClient: stripe.createClient }
      )

      expect(result.ok).toBe(true)
    })

    it("refuses the key and creates nothing when the endpoints cannot be listed", async () => {
      const stripe = fakeStripe({ list: vi.fn().mockRejectedValue(new Error("permission")) })

      const result = await connectAccount(
        { profId: "prof-1", rawKey: RAW_KEY },
        { createClient: stripe.createClient }
      )

      expect(result).toEqual({ ok: false, reason: "REFUSED" })
      expect(stripe.create).not.toHaveBeenCalled()
      expect(db.rows.size).toBe(0)
    })

    it("stores the account with encrypted secrets only", async () => {
      const stripe = fakeStripe()

      await connectAccount({ profId: "prof-1", rawKey: RAW_KEY }, { createClient: stripe.createClient })

      const row = db.rows.get("prof-1")!
      expect(row).toMatchObject({
        profId: "prof-1",
        stripeAccountId: "acct_FAKE0001",
        mode: "TEST",
        status: "ACTIVE",
        keyLast4: "1234",
        webhookEndpointId: "we_FAKE0001",
        encryptionKeyVersion: 1,
      })
      const stored = JSON.stringify(row)
      expect(stored).not.toContain("FAKEKEYFAKEKEY")
      expect(stored).not.toContain("FAKESECRETFAKESECRET")
      expect(
        decryptSecret(row.encryptedSecretKey as string, {
          profId: "prof-1",
          mode: "TEST",
          usage: "secret-key",
        })
      ).toBe(RAW_KEY)
      expect(
        decryptSecret(row.encryptedWebhookSecret as string, {
          profId: "prof-1",
          mode: "TEST",
          usage: "webhook-secret",
        })
      ).toBe(WEBHOOK_SECRET)
    })

    it("refuses a malformed key without calling Stripe", async () => {
      const stripe = fakeStripe()

      const result = await connectAccount(
        { profId: "prof-1", rawKey: "sk_test_FAKEKEYFAKEKEY1234" },
        { createClient: stripe.createClient }
      )

      expect(result).toEqual({ ok: false, reason: "REFUSED" })
      expect(stripe.createClient).not.toHaveBeenCalled()
    })

    it.each([
      ["401", { statusCode: 401, type: "StripeAuthenticationError" }],
      ["403", { statusCode: 403, type: "StripePermissionError" }],
      ["429", { statusCode: 429, type: "StripeRateLimitError" }],
      ["network", new Error("socket hang up")],
    ])("returns the same refusal when reading the account fails (%s)", async (_label, failure) => {
      const stripe = fakeStripe({ retrieve: vi.fn().mockRejectedValue(failure) })

      const result = await connectAccount(
        { profId: "prof-1", rawKey: RAW_KEY },
        { createClient: stripe.createClient }
      )

      expect(result).toEqual({ ok: false, reason: "REFUSED" })
      expect(stripe.create).not.toHaveBeenCalled()
      expect(db.rows.size).toBe(0)
    })

    it("refuses an account response without a valid account id", async () => {
      const stripe = fakeStripe({ retrieve: vi.fn().mockResolvedValue({ id: "garbage" }) })

      const result = await connectAccount(
        { profId: "prof-1", rawKey: RAW_KEY },
        { createClient: stripe.createClient }
      )

      expect(result).toEqual({ ok: false, reason: "REFUSED" })
      expect(stripe.create).not.toHaveBeenCalled()
    })

    it("refuses a Stripe account already linked to another prof, without creating an endpoint", async () => {
      db.rows.set("prof-2", {
        profId: "prof-2",
        stripeAccountId: "acct_FAKE0001",
        mode: "TEST",
        status: "ACTIVE",
        reconcileUntil: null,
      })
      const stripe = fakeStripe()

      const result = await connectAccount(
        { profId: "prof-1", rawKey: RAW_KEY },
        { createClient: stripe.createClient }
      )

      expect(result).toEqual({ ok: false, reason: "REFUSED" })
      expect(stripe.create).not.toHaveBeenCalled()
      expect(db.rows.has("prof-1")).toBe(false)
    })

    it.each(["ACTIVE", "DISCONNECTING"] as const)(
      "is blocked when the prof already has an account in status %s",
      async (status) => {
        db.rows.set("prof-1", {
          profId: "prof-1",
          stripeAccountId: "acct_OLD",
          mode: "TEST",
          status,
          reconcileUntil: null,
        })
        const stripe = fakeStripe()

        const result = await connectAccount(
          { profId: "prof-1", rawKey: RAW_KEY },
          { createClient: stripe.createClient }
        )

        expect(result).toEqual({ ok: false, reason: "BLOCKED" })
        expect(stripe.createClient).not.toHaveBeenCalled()
      }
    )

    it("replaces the key of an INVALID account and tries to remove the old endpoint", async () => {
      // Ancien compte invalide, avec son secret et son endpoint chiffrés réellement
      const first = fakeStripe()
      await connectAccount({ profId: "prof-1", rawKey: RAW_KEY }, { createClient: first.createClient })
      await markAccountInvalid("prof-1")
      expect(db.rows.get("prof-1")!.status).toBe("INVALID")

      const newKey = "rk_test_NEWKEYNEWKEYNEWKEY5678"
      const second = fakeStripe({
        retrieve: vi.fn().mockResolvedValue({ id: "acct_FAKE0002" }),
        create: vi.fn().mockResolvedValue({ id: "we_FAKE0002", secret: "whsec_NEWSECRETNEWSECRET" }),
        del: vi.fn().mockRejectedValue(new Error("revoked")),
      })
      const clients: Record<string, ReturnType<typeof fakeStripe>["client"]> = {
        [RAW_KEY]: first.client,
        [newKey]: second.client,
      }
      const oldDel = first.del

      const result = await connectAccount(
        { profId: "prof-1", rawKey: newKey },
        { createClient: (key: string) => clients[key] as never }
      )

      expect(result).toMatchObject({ ok: true, keyLast4: "5678" })
      const row = db.rows.get("prof-1")!
      expect(row).toMatchObject({ status: "ACTIVE", stripeAccountId: "acct_FAKE0002", webhookEndpointId: "we_FAKE0002" })
      // L'ancien endpoint est supprimé avec l'ANCIENNE clé, et un échec n'empêche pas le remplacement
      expect(oldDel).toHaveBeenCalledWith("we_FAKE0001")
    })

    it("does not store anything when the endpoint creation fails", async () => {
      const stripe = fakeStripe({ create: vi.fn().mockRejectedValue(new Error("boom")) })

      const result = await connectAccount(
        { profId: "prof-1", rawKey: RAW_KEY },
        { createClient: stripe.createClient }
      )

      expect(result.ok).toBe(false)
      expect(db.rows.size).toBe(0)
    })

    it("treats an endpoint response without secret as a failure and removes the endpoint", async () => {
      const stripe = fakeStripe({ create: vi.fn().mockResolvedValue({ id: "we_FAKE0009" }) })

      const result = await connectAccount(
        { profId: "prof-1", rawKey: RAW_KEY },
        { createClient: stripe.createClient }
      )

      expect(result.ok).toBe(false)
      expect(stripe.del).toHaveBeenCalledWith("we_FAKE0009")
      expect(db.rows.size).toBe(0)
    })

    it("removes the created endpoint when the database write fails", async () => {
      db.failWrite = new Error("db down")
      const stripe = fakeStripe()

      const result = await connectAccount(
        { profId: "prof-1", rawKey: RAW_KEY },
        { createClient: stripe.createClient }
      )

      expect(result).toEqual({ ok: false, reason: "ERROR" })
      expect(stripe.del).toHaveBeenCalledWith("we_FAKE0001")
    })

    it("answers REFUSED and cleans up on a unique violation at write time", async () => {
      db.failWrite = Object.assign(new Error("unique"), { code: "P2002" })
      const stripe = fakeStripe()

      const result = await connectAccount(
        { profId: "prof-1", rawKey: RAW_KEY },
        { createClient: stripe.createClient }
      )

      expect(result).toEqual({ ok: false, reason: "REFUSED" })
      expect(stripe.del).toHaveBeenCalledWith("we_FAKE0001")
    })

    it("still fails cleanly when the cleanup itself fails", async () => {
      db.failWrite = new Error("db down")
      const stripe = fakeStripe({ del: vi.fn().mockRejectedValue(new Error("cannot delete")) })

      const result = await connectAccount(
        { profId: "prof-1", rawKey: RAW_KEY },
        { createClient: stripe.createClient }
      )

      expect(result).toEqual({ ok: false, reason: "ERROR" })
    })

    it("never writes the key or the webhook secret to the console", async () => {
      const failing = fakeStripe({ retrieve: vi.fn().mockRejectedValue(new Error(`bad key ${RAW_KEY}`)) })
      await connectAccount({ profId: "prof-1", rawKey: RAW_KEY }, { createClient: failing.createClient })

      db.failWrite = new Error(`db ${WEBHOOK_SECRET} ${RAW_KEY}`)
      const ok = fakeStripe()
      await connectAccount({ profId: "prof-1", rawKey: RAW_KEY }, { createClient: ok.createClient })

      const text = loggedText()
      expect(text).not.toContain("FAKEKEYFAKEKEY")
      expect(text).not.toContain("FAKESECRETFAKESECRET")
    })
  })

  describe("status helpers", () => {
    it("reports NOT_CONFIGURED without an account", async () => {
      expect(await getProfStripeStatus("prof-1")).toEqual({ status: "NOT_CONFIGURED" })
    })

    it("reports the status, mode and last digits, and never the encrypted fields", async () => {
      const stripe = fakeStripe()
      await connectAccount({ profId: "prof-1", rawKey: RAW_KEY }, { createClient: stripe.createClient })

      const status = await getProfStripeStatus("prof-1")

      expect(status).toEqual({ status: "ACTIVE", mode: "TEST", keyLast4: "1234", reconcileUntil: null })
      expect(JSON.stringify(status)).not.toContain("encrypted")
    })

    it("marks an ACTIVE account INVALID, and only that", async () => {
      db.rows.set("prof-1", { profId: "prof-1", status: "ACTIVE", reconcileUntil: null })
      db.rows.set("prof-2", { profId: "prof-2", status: "DISCONNECTING", reconcileUntil: new Date() })

      await markAccountInvalid("prof-1")
      await markAccountInvalid("prof-2")

      expect(db.rows.get("prof-1")!.status).toBe("INVALID")
      expect(db.rows.get("prof-2")!.status).toBe("DISCONNECTING")
    })
  })

  describe("disconnect and purge", () => {
    const now = new Date("2026-10-04T12:00:00Z")

    it("moves the account to DISCONNECTING with a reconciliation deadline", async () => {
      const stripe = fakeStripe()
      await connectAccount({ profId: "prof-1", rawKey: RAW_KEY }, { createClient: stripe.createClient })

      const result = await startDisconnect("prof-1", { now: () => now })

      const deadline = new Date(now.getTime() + DISCONNECT_RECONCILIATION_HOURS * 3600 * 1000)
      expect(result).toEqual({ ok: true, reconcileUntil: deadline })
      expect(db.rows.get("prof-1")).toMatchObject({ status: "DISCONNECTING", reconcileUntil: deadline })
    })

    it("keeps the endpoint and the secrets during the window", async () => {
      const stripe = fakeStripe()
      await connectAccount({ profId: "prof-1", rawKey: RAW_KEY }, { createClient: stripe.createClient })

      await startDisconnect("prof-1", { now: () => now })

      const row = db.rows.get("prof-1")!
      expect(row.encryptedSecretKey).toBeTruthy()
      expect(row.encryptedWebhookSecret).toBeTruthy()
      expect(stripe.del).not.toHaveBeenCalled()
    })

    it("is idempotent and keeps the first deadline", async () => {
      const stripe = fakeStripe()
      await connectAccount({ profId: "prof-1", rawKey: RAW_KEY }, { createClient: stripe.createClient })
      const first = await startDisconnect("prof-1", { now: () => now })

      const later = new Date(now.getTime() + 3600 * 1000)
      const second = await startDisconnect("prof-1", { now: () => later })

      expect(second).toEqual(first)
    })

    it("can disconnect an INVALID account", async () => {
      db.rows.set("prof-1", { profId: "prof-1", status: "INVALID", reconcileUntil: null })

      const result = await startDisconnect("prof-1", { now: () => now })

      expect(result.ok).toBe(true)
    })

    it("fails when there is nothing to disconnect", async () => {
      expect(await startDisconnect("prof-1", { now: () => now })).toEqual({ ok: false })
    })

    it("does not purge before the deadline", async () => {
      const stripe = fakeStripe()
      await connectAccount({ profId: "prof-1", rawKey: RAW_KEY }, { createClient: stripe.createClient })
      await startDisconnect("prof-1", { now: () => now })

      const purged = await purgeExpiredDisconnections({
        now: () => new Date(now.getTime() + 3600 * 1000),
        createClient: stripe.createClient,
      })

      expect(purged).toBe(0)
      expect(db.rows.has("prof-1")).toBe(true)
      expect(stripe.del).not.toHaveBeenCalled()
    })

    it("after the deadline, removes the endpoint with the prof's key, then the secrets and the row", async () => {
      const stripe = fakeStripe()
      await connectAccount({ profId: "prof-1", rawKey: RAW_KEY }, { createClient: stripe.createClient })
      await startDisconnect("prof-1", { now: () => now })
      stripe.createClient.mockClear()

      const purged = await purgeExpiredDisconnections({
        now: () => new Date(now.getTime() + (DISCONNECT_RECONCILIATION_HOURS + 1) * 3600 * 1000),
        createClient: stripe.createClient,
      })

      expect(purged).toBe(1)
      expect(stripe.createClient).toHaveBeenCalledWith(RAW_KEY)
      expect(stripe.del).toHaveBeenCalledWith("we_FAKE0001")
      expect(db.rows.has("prof-1")).toBe(false)
    })

    it("still deletes the row when the endpoint cannot be removed, without logging secrets", async () => {
      const stripe = fakeStripe({ del: vi.fn().mockRejectedValue(new Error(`denied for ${RAW_KEY}`)) })
      await connectAccount({ profId: "prof-1", rawKey: RAW_KEY }, { createClient: stripe.createClient })
      await startDisconnect("prof-1", { now: () => now })

      const purged = await purgeExpiredDisconnections({
        now: () => new Date(now.getTime() + 100 * 3600 * 1000),
        createClient: stripe.createClient,
      })

      expect(purged).toBe(1)
      expect(db.rows.has("prof-1")).toBe(false)
      expect(loggedText()).not.toContain("FAKEKEYFAKEKEY")
    })

    it("deletes the row even when the stored key cannot be decrypted", async () => {
      const stripe = fakeStripe()
      await connectAccount({ profId: "prof-1", rawKey: RAW_KEY }, { createClient: stripe.createClient })
      await startDisconnect("prof-1", { now: () => now })
      process.env.STRIPE_KEYS_ENCRYPTION_KEY = randomBytes(32).toString("base64") // clé perdue

      const purged = await purgeExpiredDisconnections({
        now: () => new Date(now.getTime() + 100 * 3600 * 1000),
        createClient: stripe.createClient,
      })

      expect(purged).toBe(1)
      expect(db.rows.has("prof-1")).toBe(false)
    })

    it("leaves ACTIVE accounts alone", async () => {
      db.rows.set("prof-1", { profId: "prof-1", status: "ACTIVE", reconcileUntil: null })

      const purged = await purgeExpiredDisconnections({ now: () => new Date("2030-01-01") })

      expect(purged).toBe(0)
      expect(db.rows.has("prof-1")).toBe(true)
    })
  })
})
