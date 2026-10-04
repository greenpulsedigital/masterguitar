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
    course: {
      create: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    purchase: { count: vi.fn() },
  },
}))

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import {
  createCourse,
  updateCourse,
  deleteCourse,
} from "@/app/(dashboard)/dashboard/courses/actions"

const prof = { user: { id: "prof-1", role: "PROF" } }

function form(fields: Record<string, string>) {
  const fd = new FormData()
  for (const [k, v] of Object.entries(fields)) fd.set(k, v)
  return fd
}

describe("course actions", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(auth).mockResolvedValue(prof as unknown as Awaited<ReturnType<typeof auth>>)
  })

  describe("createCourse", () => {
    it("lets the redirect propagate after a successful creation", async () => {
      vi.mocked(prisma.course.findUnique).mockResolvedValue(null)
      vi.mocked(prisma.course.create).mockResolvedValue({ id: "c1" } as unknown as Awaited<ReturnType<typeof prisma.course.create>>)

      await expect(
        createCourse(form({ title: "Débuter la guitare", price: "10" }))
      ).rejects.toThrow("NEXT_REDIRECT:/dashboard/courses/c1")
    })

    it("appends a suffix when the slug already exists", async () => {
      vi.mocked(prisma.course.findUnique)
        .mockResolvedValueOnce({ id: "other" } as unknown as Awaited<ReturnType<typeof prisma.course.findUnique>>)
        .mockResolvedValueOnce(null)
      vi.mocked(prisma.course.create).mockResolvedValue({ id: "c1" } as unknown as Awaited<ReturnType<typeof prisma.course.create>>)

      await expect(
        createCourse(form({ title: "Guitare", price: "10" }))
      ).rejects.toThrow("NEXT_REDIRECT")

      expect(prisma.course.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ slug: "guitare-2" }),
        })
      )
    })

    it("falls back to a default slug when the title has no usable characters", async () => {
      vi.mocked(prisma.course.findUnique).mockResolvedValue(null)
      vi.mocked(prisma.course.create).mockResolvedValue({ id: "c1" } as unknown as Awaited<ReturnType<typeof prisma.course.create>>)

      await expect(
        createCourse(form({ title: "!!!", price: "10" }))
      ).rejects.toThrow("NEXT_REDIRECT")

      expect(prisma.course.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ slug: "cours" }),
        })
      )
    })

    it("returns an error when creation fails", async () => {
      vi.mocked(prisma.course.findUnique).mockResolvedValue(null)
      vi.mocked(prisma.course.create).mockRejectedValue(new Error("db"))

      const result = await createCourse(form({ title: "Guitare", price: "10" }))
      expect(result).toEqual({ error: "Erreur lors de la création du cours" })
    })
  })

  describe("updateCourse", () => {
    it("keeps the slug stable when the title changes", async () => {
      vi.mocked(prisma.course.findUnique).mockResolvedValue({
        id: "c1",
        profId: "prof-1",
      } as unknown as Awaited<ReturnType<typeof prisma.course.findUnique>>)
      vi.mocked(prisma.course.update).mockResolvedValue({} as unknown as Awaited<ReturnType<typeof prisma.course.update>>)

      await expect(
        updateCourse(form({ id: "c1", title: "Nouveau titre", price: "10" }))
      ).rejects.toThrow("NEXT_REDIRECT:/dashboard/courses")

      const call = vi.mocked(prisma.course.update).mock.calls[0][0] as { data: Record<string, unknown> }
      expect(call.data).not.toHaveProperty("slug")
    })
  })

  describe("deleteCourse", () => {
    beforeEach(() => {
      vi.mocked(prisma.course.findUnique).mockResolvedValue({
        id: "c1",
        profId: "prof-1",
      } as unknown as Awaited<ReturnType<typeof prisma.course.findUnique>>)
    })

    it("refuses to delete a course that has purchases", async () => {
      vi.mocked(prisma.purchase.count).mockResolvedValue(2)

      const result = await deleteCourse(form({ id: "c1" }))

      expect(result?.error).toMatch(/déjà été acheté/)
      expect(prisma.course.delete).not.toHaveBeenCalled()
    })

    it("lets the redirect propagate after a successful deletion", async () => {
      vi.mocked(prisma.purchase.count).mockResolvedValue(0)
      vi.mocked(prisma.course.delete).mockResolvedValue({} as unknown as Awaited<ReturnType<typeof prisma.course.delete>>)

      await expect(deleteCourse(form({ id: "c1" }))).rejects.toThrow(
        "NEXT_REDIRECT:/dashboard/courses"
      )
    })
  })
})
