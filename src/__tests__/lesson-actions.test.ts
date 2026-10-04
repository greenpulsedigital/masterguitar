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
    module: { findUnique: vi.fn() },
    lesson: {
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      findUnique: vi.fn(),
    },
    $transaction: vi.fn((ops: Promise<unknown>[]) => Promise.all(ops)),
  },
}))

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import {
  createLesson,
  updateLesson,
  deleteLesson,
  reorderLesson,
} from "@/app/(dashboard)/dashboard/courses/actions"

const prof = { user: { id: "prof-1", role: "PROF" } }

function form(fields: Record<string, string>) {
  const fd = new FormData()
  for (const [k, v] of Object.entries(fields)) fd.set(k, v)
  return fd
}

const ownedLesson = {
  id: "l1",
  order: 1,
  module: {
    courseId: "c1",
    course: { profId: "prof-1" },
    lessons: [
      { id: "l1", order: 1 },
      { id: "l2", order: 2 },
    ],
  },
}

describe("lesson actions", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(auth).mockResolvedValue(prof as any)
  })

  describe("redirect after success", () => {
    it("createLesson", async () => {
      vi.mocked(prisma.module.findUnique).mockResolvedValue({
        id: "m1",
        courseId: "c1",
        course: { profId: "prof-1" },
        lessons: [],
      } as any)
      vi.mocked(prisma.lesson.create).mockResolvedValue({} as any)

      await expect(
        createLesson(form({ moduleId: "m1", title: "Intro" }))
      ).rejects.toThrow("NEXT_REDIRECT:/dashboard/courses/c1")
    })

    it("updateLesson", async () => {
      vi.mocked(prisma.lesson.findUnique).mockResolvedValue(ownedLesson as any)
      vi.mocked(prisma.lesson.update).mockResolvedValue({} as any)

      await expect(
        updateLesson(form({ id: "l1", title: "Titre" }))
      ).rejects.toThrow("NEXT_REDIRECT:/dashboard/courses/c1")
    })

    it("deleteLesson", async () => {
      vi.mocked(prisma.lesson.findUnique).mockResolvedValue(ownedLesson as any)
      vi.mocked(prisma.lesson.delete).mockResolvedValue({} as any)

      await expect(deleteLesson(form({ id: "l1" }))).rejects.toThrow(
        "NEXT_REDIRECT:/dashboard/courses/c1"
      )
    })

    it("reorderLesson", async () => {
      vi.mocked(prisma.lesson.findUnique).mockResolvedValue(ownedLesson as any)
      vi.mocked(prisma.lesson.update).mockResolvedValue({} as any)

      await expect(
        reorderLesson(form({ id: "l1", direction: "down" }))
      ).rejects.toThrow("NEXT_REDIRECT:/dashboard/courses/c1")
    })
  })

  describe("video URL validation", () => {
    it.each(["javascript:alert(1)", "data:text/html,<script>alert(1)</script>", "http://example.com/v"])(
      "rejects %s",
      async (videoUrl) => {
        const result = await createLesson(
          form({ moduleId: "m1", title: "Intro", videoUrl })
        )
        expect(result?.error).toBeDefined()
        expect(prisma.module.findUnique).not.toHaveBeenCalled()
      }
    )

    it("accepts an https URL", async () => {
      vi.mocked(prisma.module.findUnique).mockResolvedValue({
        id: "m1",
        courseId: "c1",
        course: { profId: "prof-1" },
        lessons: [],
      } as any)
      vi.mocked(prisma.lesson.create).mockResolvedValue({} as any)

      await expect(
        createLesson(
          form({ moduleId: "m1", title: "Intro", videoUrl: "https://www.youtube.com/embed/abc" })
        )
      ).rejects.toThrow("NEXT_REDIRECT")
    })
  })

  describe("reorderLesson", () => {
    it("rejects an invalid direction", async () => {
      const result = await reorderLesson(form({ id: "l1", direction: "sideways" }))

      expect(result).toEqual({ error: "Direction invalide" })
      expect(prisma.lesson.findUnique).not.toHaveBeenCalled()
    })

    it("swaps both orders in a single transaction", async () => {
      vi.mocked(prisma.lesson.findUnique).mockResolvedValue(ownedLesson as any)
      vi.mocked(prisma.lesson.update).mockResolvedValue({} as any)

      await expect(
        reorderLesson(form({ id: "l1", direction: "down" }))
      ).rejects.toThrow("NEXT_REDIRECT")

      expect(prisma.$transaction).toHaveBeenCalledTimes(1)
      expect(prisma.lesson.update).toHaveBeenCalledWith({
        where: { id: "l1" },
        data: { order: 2 },
      })
      expect(prisma.lesson.update).toHaveBeenCalledWith({
        where: { id: "l2" },
        data: { order: 1 },
      })
    })
  })
})
