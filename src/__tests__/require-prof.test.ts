import { describe, it, expect, vi, beforeEach } from "vitest"

vi.mock("@/lib/auth", () => ({ auth: vi.fn() }))
vi.mock("@/lib/prisma", () => ({
  prisma: { user: { findUnique: vi.fn() } },
}))

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { requireProf } from "@/lib/require-prof"

describe("requireProf", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("returns null without a session", async () => {
    vi.mocked(auth).mockResolvedValue(null as never)

    expect(await requireProf()).toBeNull()
    expect(prisma.user.findUnique).not.toHaveBeenCalled()
  })

  it("returns null when the session has no user id", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { role: "PROF" } } as never)

    expect(await requireProf()).toBeNull()
  })

  it("returns the user id when the database confirms the PROF role", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "prof-1", role: "PROF" } } as never)
    vi.mocked(prisma.user.findUnique).mockResolvedValue({ id: "prof-1", role: "PROF" } as never)

    expect(await requireProf()).toEqual({ userId: "prof-1" })
    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { id: "prof-1" },
      select: { id: true, role: true },
    })
  })

  it("trusts the database over a stale JWT role", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "u1", role: "PROF" } } as never)
    vi.mocked(prisma.user.findUnique).mockResolvedValue({ id: "u1", role: "STUDENT" } as never)

    expect(await requireProf()).toBeNull()
  })

  it("returns null when the user no longer exists", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "gone", role: "PROF" } } as never)
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null)

    expect(await requireProf()).toBeNull()
  })

  it("ignores the JWT role when the JWT says STUDENT but the database says PROF", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "u2", role: "STUDENT" } } as never)
    vi.mocked(prisma.user.findUnique).mockResolvedValue({ id: "u2", role: "PROF" } as never)

    expect(await requireProf()).toEqual({ userId: "u2" })
  })
})
