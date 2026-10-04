import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"

// Faux compteur en mémoire avec la même sémantique d'upsert que Prisma
const store = new Map<string, { key: string; windowStart: Date; count: number }>()

vi.mock("@/lib/prisma", () => ({
  prisma: {
    rateLimit: {
      upsert: vi.fn(async ({ where, create, update }) => {
        const { key, windowStart } = where.key_windowStart
        const id = `${key}|${windowStart.toISOString()}`
        const existing = store.get(id)
        if (existing) {
          existing.count += update.count.increment
          return existing
        }
        const row = { key: create.key, windowStart: create.windowStart, count: create.count }
        store.set(id, row)
        return row
      }),
      deleteMany: vi.fn(async ({ where }) => {
        let n = 0
        for (const [id, row] of store) {
          if (row.windowStart < where.windowStart.lt) {
            store.delete(id)
            n++
          }
        }
        return { count: n }
      }),
    },
  },
}))

import {
  checkRateLimit,
  checkConnectRateLimit,
  getClientIp,
  CONNECT_USER_LIMIT,
  CONNECT_IP_LIMIT,
} from "@/lib/rate-limit"

describe("rate-limit", () => {
  beforeEach(() => {
    store.clear()
    vi.useFakeTimers()
    vi.setSystemTime(new Date("2026-10-04T12:00:00Z"))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it("allows attempts under the limit", async () => {
    for (let i = 0; i < 3; i++) {
      const result = await checkRateLimit("k", { max: 3, windowSeconds: 60 })
      expect(result.allowed).toBe(true)
    }
  })

  it("refuses attempts above the limit", async () => {
    for (let i = 0; i < 3; i++) await checkRateLimit("k", { max: 3, windowSeconds: 60 })
    const result = await checkRateLimit("k", { max: 3, windowSeconds: 60 })
    expect(result.allowed).toBe(false)
    expect(result.remaining).toBe(0)
  })

  it("reports the remaining attempts", async () => {
    const first = await checkRateLimit("k", { max: 3, windowSeconds: 60 })
    expect(first.remaining).toBe(2)
  })

  it("starts a new window once the previous one is over", async () => {
    for (let i = 0; i < 4; i++) await checkRateLimit("k", { max: 3, windowSeconds: 60 })
    vi.setSystemTime(new Date("2026-10-04T12:01:30Z"))
    const result = await checkRateLimit("k", { max: 3, windowSeconds: 60 })
    expect(result.allowed).toBe(true)
  })

  it("keeps keys independent", async () => {
    for (let i = 0; i < 4; i++) await checkRateLimit("a", { max: 3, windowSeconds: 60 })
    const other = await checkRateLimit("b", { max: 3, windowSeconds: 60 })
    expect(other.allowed).toBe(true)
  })

  it("purges counters from old windows", async () => {
    await checkRateLimit("old", { max: 3, windowSeconds: 60 })
    vi.setSystemTime(new Date("2026-10-06T12:00:00Z")) // 2 jours plus tard
    await checkRateLimit("new", { max: 3, windowSeconds: 60 })
    expect([...store.values()].some((row) => row.key === "old")).toBe(false)
  })

  describe("checkConnectRateLimit", () => {
    it("refuses once the per-user limit is exceeded", async () => {
      for (let i = 0; i < CONNECT_USER_LIMIT.max; i++) {
        expect((await checkConnectRateLimit({ userId: "u1", ip: `1.1.1.${i}` })).allowed).toBe(true)
      }
      expect((await checkConnectRateLimit({ userId: "u1", ip: "9.9.9.9" })).allowed).toBe(false)
    })

    it("refuses once the per-IP limit is exceeded, whatever the user", async () => {
      for (let i = 0; i < CONNECT_IP_LIMIT.max; i++) {
        expect((await checkConnectRateLimit({ userId: `u${i}`, ip: "2.2.2.2" })).allowed).toBe(true)
      }
      expect((await checkConnectRateLimit({ userId: "someone-new", ip: "2.2.2.2" })).allowed).toBe(false)
    })

    it("counts connect and disconnect attempts separately", async () => {
      for (let i = 0; i < CONNECT_USER_LIMIT.max + 1; i++) {
        await checkConnectRateLimit({ userId: "u1", ip: "5.5.5.5" })
      }
      const disconnect = await checkConnectRateLimit({ userId: "u1", ip: "5.5.5.5", scope: "disconnect" })
      expect(disconnect.allowed).toBe(true)
    })

    it("does not let another user and IP be affected", async () => {
      for (let i = 0; i < CONNECT_USER_LIMIT.max + 1; i++) {
        await checkConnectRateLimit({ userId: "u1", ip: "3.3.3.3" })
      }
      expect((await checkConnectRateLimit({ userId: "u2", ip: "4.4.4.4" })).allowed).toBe(true)
    })
  })

  describe("getClientIp", () => {
    it("takes the first address of x-forwarded-for", () => {
      const headers = new Headers({ "x-forwarded-for": "203.0.113.7, 10.0.0.1" })
      expect(getClientIp(headers)).toBe("203.0.113.7")
    })

    it("falls back to a shared bucket when the header is missing or empty", () => {
      expect(getClientIp(new Headers())).toBe("unknown")
      expect(getClientIp(new Headers({ "x-forwarded-for": "  " }))).toBe("unknown")
    })

    it("truncates absurdly long values", () => {
      const long = "a".repeat(500)
      expect(getClientIp(new Headers({ "x-forwarded-for": long })).length).toBeLessThanOrEqual(64)
    })
  })
})
