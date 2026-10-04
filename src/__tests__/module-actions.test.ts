import { describe, it, expect, vi, beforeEach } from "vitest"

vi.mock("@/lib/auth", () => ({ auth: vi.fn() }))

// Like Next.js, redirect() throws to interrupt the action
vi.mock("next/navigation", () => ({
  redirect: vi.fn((url: string) => {
    throw new Error(`NEXT_REDIRECT:${url}`)
  }),
}))

vi.mock("@/lib/prisma", () => ({
  prisma: {
    module: {
      update: vi.fn(),
      findUnique: vi.fn(),
    },
    $transaction: vi.fn((ops: Promise<unknown>[]) => Promise.all(ops)),
  },
}))

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { updateModule, reorderModule } from "@/app/(dashboard)/dashboard/courses/actions"

const prof = { user: { id: "prof-1", role: "PROF" } }

function form(fields: Record<string, string>) {
  const fd = new FormData()
  for (const [k, v] of Object.entries(fields)) fd.set(k, v)
  return fd
}

const ownedModule = {
  id: "m1",
  order: 1,
  courseId: "c1",
  course: {
    profId: "prof-1",
    modules: [
      { id: "m1", order: 1 },
      { id: "m2", order: 2 },
    ],
  },
}

describe("module actions", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(auth).mockResolvedValue(prof as any)
  })

  describe("updateModule", () => {
    it("persists the trimmed title", async () => {
      vi.mocked(prisma.module.findUnique).mockResolvedValue(ownedModule as any)
      vi.mocked(prisma.module.update).mockResolvedValue({} as any)

      await expect(
        updateModule(form({ id: "m1", title: "  Introduction  " }))
      ).rejects.toThrow("NEXT_REDIRECT:/dashboard/courses/c1")

      expect(prisma.module.update).toHaveBeenCalledWith({
        where: { id: "m1" },
        data: { title: "Introduction" },
      })
    })

    it("rejects a whitespace-only title", async () => {
      const result = await updateModule(form({ id: "m1", title: "   " }))

      expect(result).toEqual({ error: "Le titre est requis" })
      expect(prisma.module.update).not.toHaveBeenCalled()
    })
  })

  describe("reorderModule", () => {
    it("rejects an invalid direction before touching the database", async () => {
      const result = await reorderModule(form({ id: "m1", direction: "sideways" }))

      expect(result).toEqual({ error: "Direction invalide" })
      expect(prisma.module.findUnique).not.toHaveBeenCalled()
    })

    it("swaps both orders in a single transaction", async () => {
      vi.mocked(prisma.module.findUnique).mockResolvedValue(ownedModule as any)
      vi.mocked(prisma.module.update).mockResolvedValue({} as any)

      await expect(
        reorderModule(form({ id: "m1", direction: "down" }))
      ).rejects.toThrow("NEXT_REDIRECT:/dashboard/courses/c1")

      expect(prisma.$transaction).toHaveBeenCalledTimes(1)
      expect(prisma.module.update).toHaveBeenCalledWith({
        where: { id: "m1" },
        data: { order: 2 },
      })
      expect(prisma.module.update).toHaveBeenCalledWith({
        where: { id: "m2" },
        data: { order: 1 },
      })
    })

    it("returns an error when the transaction fails", async () => {
      vi.mocked(prisma.module.findUnique).mockResolvedValue(ownedModule as any)
      vi.mocked(prisma.module.update).mockResolvedValue({} as any)
      vi.mocked(prisma.$transaction).mockRejectedValueOnce(new Error("db"))

      const result = await reorderModule(form({ id: "m1", direction: "down" }))

      expect(result).toEqual({ error: "Erreur lors du réordonnancement du module" })
    })
  })
})
