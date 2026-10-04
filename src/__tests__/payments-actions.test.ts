import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"

vi.mock("@/lib/require-prof", () => ({ requireProf: vi.fn() }))
vi.mock("@/lib/rate-limit", () => ({
  checkConnectRateLimit: vi.fn(),
  getClientIp: vi.fn(() => "203.0.113.7"),
}))
vi.mock("@/lib/prof-stripe-account", () => ({
  connectAccount: vi.fn(),
  startDisconnect: vi.fn(),
  purgeExpiredDisconnections: vi.fn(),
}))
vi.mock("next/headers", () => ({ headers: vi.fn(async () => new Headers()) }))
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }))
// Comme Next.js, redirect() lève une exception pour interrompre l'action
vi.mock("next/navigation", () => ({
  redirect: vi.fn((url: string) => {
    throw new Error(`NEXT_REDIRECT:${url}`)
  }),
}))

import { requireProf } from "@/lib/require-prof"
import { checkConnectRateLimit } from "@/lib/rate-limit"
import { connectAccount, startDisconnect, purgeExpiredDisconnections } from "@/lib/prof-stripe-account"
import { revalidatePath } from "next/cache"
import {
  connectStripeAccount,
  disconnectStripeAccount,
} from "@/app/(dashboard)/dashboard/settings/payments/actions"
import { CONNECT_ERRORS } from "@/lib/payments-messages"

const KEY = ["rk", "test", "FAKEKEYFAKEKEY1234"].join("_")

function form(key: string | null) {
  const fd = new FormData()
  if (key !== null) fd.set("restrictedKey", key)
  return fd
}

describe("payments actions", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(requireProf).mockResolvedValue({ userId: "prof-1" })
    vi.mocked(checkConnectRateLimit).mockResolvedValue({ allowed: true, remaining: 4 })
    vi.mocked(purgeExpiredDisconnections).mockResolvedValue(0)
    vi.spyOn(console, "error").mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe("connectStripeAccount", () => {
    it("redirects to the login page when the caller is not a prof", async () => {
      vi.mocked(requireProf).mockResolvedValue(null)

      await expect(connectStripeAccount(form(KEY))).rejects.toThrow("NEXT_REDIRECT:/login")
      expect(connectAccount).not.toHaveBeenCalled()
      expect(checkConnectRateLimit).not.toHaveBeenCalled()
    })

    it("uses the id of the session, never one coming from the form", async () => {
      vi.mocked(connectAccount).mockResolvedValue({ ok: true, mode: "TEST", keyLast4: "1234" })
      const fd = form(KEY)
      fd.set("profId", "someone-else")

      await expect(connectStripeAccount(fd)).rejects.toThrow("NEXT_REDIRECT")
      expect(connectAccount).toHaveBeenCalledWith({ profId: "prof-1", rawKey: KEY })
    })

    it("redirects to the settings page after a successful connection", async () => {
      vi.mocked(connectAccount).mockResolvedValue({ ok: true, mode: "TEST", keyLast4: "1234" })

      await expect(connectStripeAccount(form(KEY))).rejects.toThrow(
        "NEXT_REDIRECT:/dashboard/settings/payments"
      )
      expect(revalidatePath).toHaveBeenCalledWith("/dashboard")
      expect(revalidatePath).toHaveBeenCalledWith("/dashboard/settings/payments")
    })

    it("limits the rate per user and per IP, and stops before touching the key", async () => {
      vi.mocked(checkConnectRateLimit).mockResolvedValue({ allowed: false, remaining: 0 })

      const result = await connectStripeAccount(form(KEY))

      expect(result).toEqual({ error: CONNECT_ERRORS.rateLimited })
      expect(checkConnectRateLimit).toHaveBeenCalledWith({
        userId: "prof-1",
        ip: "203.0.113.7",
        scope: "connect",
      })
      expect(connectAccount).not.toHaveBeenCalled()
    })

    it("answers with the same generic message for every refused key", async () => {
      vi.mocked(connectAccount).mockResolvedValue({ ok: false, reason: "REFUSED" })
      const refused = await connectStripeAccount(form(KEY))

      const missing = await connectStripeAccount(form(null))

      expect(refused).toEqual({ error: CONNECT_ERRORS.refused })
      expect(missing).toEqual({ error: CONNECT_ERRORS.refused })
    })

    it("tells the prof when an account is already connected", async () => {
      vi.mocked(connectAccount).mockResolvedValue({ ok: false, reason: "BLOCKED" })

      expect(await connectStripeAccount(form(KEY))).toEqual({ error: CONNECT_ERRORS.alreadyConnected })
    })

    it("returns a generic error on an internal failure", async () => {
      vi.mocked(connectAccount).mockResolvedValue({ ok: false, reason: "ERROR" })

      expect(await connectStripeAccount(form(KEY))).toEqual({ error: CONNECT_ERRORS.unexpected })
    })

    it("catches unexpected exceptions and never leaks their message or the key", async () => {
      vi.mocked(connectAccount).mockRejectedValue(new Error(`boom ${KEY}`))

      const result = await connectStripeAccount(form(KEY))

      expect(result).toEqual({ error: CONNECT_ERRORS.unexpected })
      expect(JSON.stringify(result)).not.toContain("FAKEKEY")
      expect(JSON.stringify(vi.mocked(console.error).mock.calls)).not.toContain("FAKEKEY")
    })

    it("purges expired disconnections before connecting", async () => {
      vi.mocked(connectAccount).mockResolvedValue({ ok: true, mode: "TEST", keyLast4: "1234" })

      await expect(connectStripeAccount(form(KEY))).rejects.toThrow("NEXT_REDIRECT")
      const purgeOrder = vi.mocked(purgeExpiredDisconnections).mock.invocationCallOrder[0]
      const connectOrder = vi.mocked(connectAccount).mock.invocationCallOrder[0]
      expect(purgeOrder).toBeLessThan(connectOrder)
    })

    it("never returns the submitted key in its result", async () => {
      vi.mocked(connectAccount).mockResolvedValue({ ok: false, reason: "REFUSED" })

      const result = await connectStripeAccount(form(KEY))

      expect(JSON.stringify(result)).not.toContain(KEY)
    })
  })

  describe("disconnectStripeAccount", () => {
    it("redirects to the login page when the caller is not a prof", async () => {
      vi.mocked(requireProf).mockResolvedValue(null)

      await expect(disconnectStripeAccount()).rejects.toThrow("NEXT_REDIRECT:/login")
      expect(startDisconnect).not.toHaveBeenCalled()
    })

    it("only disconnects the account of the session", async () => {
      vi.mocked(startDisconnect).mockResolvedValue({ ok: true, reconcileUntil: new Date() })

      await expect(disconnectStripeAccount()).rejects.toThrow(
        "NEXT_REDIRECT:/dashboard/settings/payments"
      )
      expect(startDisconnect).toHaveBeenCalledWith("prof-1")
    })

    it("is rate limited with its own counters", async () => {
      vi.mocked(checkConnectRateLimit).mockResolvedValue({ allowed: false, remaining: 0 })

      expect(await disconnectStripeAccount()).toEqual({ error: CONNECT_ERRORS.rateLimited })
      expect(checkConnectRateLimit).toHaveBeenCalledWith(
        expect.objectContaining({ scope: "disconnect" })
      )
      expect(startDisconnect).not.toHaveBeenCalled()
    })

    it("returns a generic error when there is nothing to disconnect", async () => {
      vi.mocked(startDisconnect).mockResolvedValue({ ok: false })

      expect(await disconnectStripeAccount()).toEqual({ error: CONNECT_ERRORS.unexpected })
    })

    it("returns a generic error on an unexpected failure", async () => {
      vi.mocked(startDisconnect).mockRejectedValue(new Error("db down"))

      expect(await disconnectStripeAccount()).toEqual({ error: CONNECT_ERRORS.unexpected })
    })
  })
})
