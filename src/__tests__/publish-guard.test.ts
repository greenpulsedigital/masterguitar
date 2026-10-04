import { describe, it, expect, vi, beforeEach } from "vitest"

vi.mock("@/lib/auth", () => ({ auth: vi.fn() }))
vi.mock("next/navigation", () => ({
  redirect: vi.fn((url: string) => {
    throw new Error(`NEXT_REDIRECT:${url}`)
  }),
}))
vi.mock("@/lib/prisma", () => ({
  prisma: {
    course: { findUnique: vi.fn(), update: vi.fn(), updateMany: vi.fn() },
  },
}))

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { toggleCourseStatus } from "@/app/(dashboard)/dashboard/courses/actions"
import { PUBLISH_BLOCKED_MESSAGE } from "@/lib/payments-messages"

const prof = { user: { id: "prof-1", role: "PROF" } }

function form() {
  const fd = new FormData()
  fd.set("id", "course-1")
  return fd
}

describe("publication guard (toggleCourseStatus)", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(auth).mockResolvedValue(prof as never)
  })

  describe("publishing a draft", () => {
    beforeEach(() => {
      vi.mocked(prisma.course.findUnique).mockResolvedValue({
        id: "course-1",
        profId: "prof-1",
        status: "DRAFT",
      } as never)
    })

    it("is refused with an explicit message when the prof has no ACTIVE Stripe account", async () => {
      vi.mocked(prisma.course.updateMany).mockResolvedValue({ count: 0 })

      const result = await toggleCourseStatus(form())

      expect(result).toEqual({ error: PUBLISH_BLOCKED_MESSAGE })
    })

    it("checks the account in the same statement as the update, and never publishes otherwise", async () => {
      vi.mocked(prisma.course.updateMany).mockResolvedValue({ count: 0 })

      await toggleCourseStatus(form())

      const args = vi.mocked(prisma.course.updateMany).mock.calls[0][0] as {
        where: { prof: { stripeAccount: { is: { status: string } } }; profId: string }
      }
      expect(args.where.prof.stripeAccount.is.status).toBe("ACTIVE")
      expect(args.where.profId).toBe("prof-1")
      expect(prisma.course.update).not.toHaveBeenCalled()
    })

    it("publishes and redirects when the account is ACTIVE", async () => {
      vi.mocked(prisma.course.updateMany).mockResolvedValue({ count: 1 })

      await expect(toggleCourseStatus(form())).rejects.toThrow(
        "NEXT_REDIRECT:/dashboard/courses/course-1"
      )
    })

    it("returns the generic error when the update fails", async () => {
      vi.mocked(prisma.course.updateMany).mockRejectedValue(new Error("db down"))

      const result = await toggleCourseStatus(form())

      expect(result).toEqual({ error: "Erreur lors du changement de statut du cours" })
    })
  })

  describe("unpublishing", () => {
    it("is always allowed, without looking at the Stripe account", async () => {
      vi.mocked(prisma.course.findUnique).mockResolvedValue({
        id: "course-1",
        profId: "prof-1",
        status: "PUBLISHED",
      } as never)
      vi.mocked(prisma.course.update).mockResolvedValue({} as never)

      await expect(toggleCourseStatus(form())).rejects.toThrow("NEXT_REDIRECT")

      expect(prisma.course.update).toHaveBeenCalledWith({
        where: { id: "course-1" },
        data: { status: "DRAFT" },
      })
      expect(prisma.course.updateMany).not.toHaveBeenCalled()
    })
  })

  it("still refuses a course owned by another prof", async () => {
    vi.mocked(prisma.course.findUnique).mockResolvedValue({
      id: "course-1",
      profId: "someone-else",
      status: "DRAFT",
    } as never)

    const result = await toggleCourseStatus(form())

    expect(result?.error).toMatch(/autorisé/)
    expect(prisma.course.updateMany).not.toHaveBeenCalled()
  })
})
