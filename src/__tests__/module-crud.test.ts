import { describe, it, expect, vi, beforeEach } from "vitest"

// Mock auth
vi.mock("@/lib/auth", () => ({
  auth: vi.fn(() => Promise.resolve(null)),
}))

// Mock next/navigation
vi.mock("next/navigation", () => ({
  redirect: vi.fn(),
}))

// Mock prisma
vi.mock("@/lib/prisma", () => ({
  prisma: {
    course: {
      findUnique: vi.fn(),
    },
    module: {
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      findUnique: vi.fn(),
      findMany: vi.fn(),
    },
    $transaction: vi.fn((ops: Promise<unknown>[]) => Promise.all(ops)),
  },
}))

import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"

describe("Module CRUD operations", () => {
  const mockProfSession = {
    user: {
      id: "prof-test-id",
      email: "prof@test.com",
      role: "PROF",
    },
  }

  const mockStudentSession = {
    user: {
      id: "student-test-id",
      email: "student@test.com",
      role: "STUDENT",
    },
  }

  const mockCourse = {
    id: "course-1",
    slug: "test-course",
    title: "Test Course",
    description: null,
    price: 1000,
    thumbnailUrl: null,
    status: "DRAFT" as const,
    profId: "prof-test-id",
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe("createModule", () => {
    it("should create module with correct order", async () => {
      vi.mocked(auth).mockResolvedValue(mockProfSession as any)

      const existingModules = [
        { id: "mod-1", title: "Module 1", order: 1, courseId: "course-1" },
        { id: "mod-2", title: "Module 2", order: 2, courseId: "course-1" },
      ]

      vi.mocked(prisma.course.findUnique).mockResolvedValue({
        ...mockCourse,
        modules: existingModules,
      } as any)

      const newModule = {
        id: "mod-3",
        title: "Nouveau module",
        order: 3,
        courseId: "course-1",
      }

      vi.mocked(prisma.module.create).mockResolvedValue(newModule as any)

      const formData = new FormData()
      formData.set("courseId", "course-1")

      const { createModule } = await import("@/app/(dashboard)/dashboard/courses/actions")

      await createModule(formData)

      expect(prisma.module.create).toHaveBeenCalledWith({
        data: {
          title: "Nouveau module",
          order: 3,
          courseId: "course-1",
        },
      })
    })

    it("should require authentication", async () => {
      vi.mocked(auth).mockResolvedValue(null as any)

      // Mock course.findUnique to prevent null access error
      vi.mocked(prisma.course.findUnique).mockResolvedValue(null as any)

      const formData = new FormData()
      formData.set("courseId", "course-1")

      const { createModule } = await import("@/app/(dashboard)/dashboard/courses/actions")

      await createModule(formData)

      expect(redirect).toHaveBeenCalledWith("/login")
    })

    it("should require PROF role", async () => {
      vi.mocked(auth).mockResolvedValue(mockStudentSession as any)

      const formData = new FormData()
      formData.set("courseId", "course-1")

      const { createModule } = await import("@/app/(dashboard)/dashboard/courses/actions")

      await createModule(formData)

      expect(redirect).toHaveBeenCalledWith("/login")
    })

    it("should require ownership", async () => {
      vi.mocked(auth).mockResolvedValue(mockProfSession as any)

      vi.mocked(prisma.course.findUnique).mockResolvedValue({
        ...mockCourse,
        profId: "different-prof-id",
        modules: [],
      } as any)

      const formData = new FormData()
      formData.set("courseId", "course-1")

      const { createModule } = await import("@/app/(dashboard)/dashboard/courses/actions")

      const result = await createModule(formData)

      expect(result).toBeDefined()
      expect(result?.error).toContain("autorisé")
      expect(prisma.module.create).not.toHaveBeenCalled()
    })
  })

  describe("updateModule", () => {
    it("should update module title", async () => {
      vi.mocked(auth).mockResolvedValue(mockProfSession as any)

      const existingModule = {
        id: "mod-1",
        title: "Old Title",
        order: 1,
        courseId: "course-1",
        course: mockCourse,
      }

      vi.mocked(prisma.module.findUnique).mockResolvedValue(existingModule as any)
      vi.mocked(prisma.module.update).mockResolvedValue({
        ...existingModule,
        title: "New Title",
      } as any)

      const formData = new FormData()
      formData.set("id", "mod-1")
      formData.set("title", "New Title")

      const { updateModule } = await import("@/app/(dashboard)/dashboard/courses/actions")

      await updateModule(formData)

      expect(prisma.module.update).toHaveBeenCalledWith({
        where: { id: "mod-1" },
        data: { title: "New Title" },
      })
    })

    it("should require authentication", async () => {
      vi.mocked(auth).mockResolvedValue(null as any)

      // Mock module.findUnique to prevent null access error
      vi.mocked(prisma.module.findUnique).mockResolvedValue(null as any)

      const formData = new FormData()
      formData.set("id", "mod-1")
      formData.set("title", "New Title")

      const { updateModule } = await import("@/app/(dashboard)/dashboard/courses/actions")

      await updateModule(formData)

      expect(redirect).toHaveBeenCalledWith("/login")
    })

    it("should require ownership", async () => {
      vi.mocked(auth).mockResolvedValue(mockProfSession as any)

      const existingModule = {
        id: "mod-1",
        title: "Old Title",
        order: 1,
        courseId: "course-1",
        course: {
          ...mockCourse,
          profId: "different-prof-id",
        },
      }

      vi.mocked(prisma.module.findUnique).mockResolvedValue(existingModule as any)

      const formData = new FormData()
      formData.set("id", "mod-1")
      formData.set("title", "New Title")

      const { updateModule } = await import("@/app/(dashboard)/dashboard/courses/actions")

      const result = await updateModule(formData)

      expect(result).toBeDefined()
      expect(result?.error).toContain("autorisé")
      expect(prisma.module.update).not.toHaveBeenCalled()
    })
  })

  describe("deleteModule", () => {
    it("should delete module when user is owner", async () => {
      vi.mocked(auth).mockResolvedValue(mockProfSession as any)

      const existingModule = {
        id: "mod-1",
        title: "Module to Delete",
        order: 1,
        courseId: "course-1",
        course: mockCourse,
      }

      vi.mocked(prisma.module.findUnique).mockResolvedValue(existingModule as any)
      vi.mocked(prisma.module.delete).mockResolvedValue(existingModule as any)

      const formData = new FormData()
      formData.set("id", "mod-1")

      const { deleteModule } = await import("@/app/(dashboard)/dashboard/courses/actions")

      await deleteModule(formData)

      expect(prisma.module.delete).toHaveBeenCalledWith({
        where: { id: "mod-1" },
      })
    })

    it("should require authentication", async () => {
      vi.mocked(auth).mockResolvedValue(null as any)

      // Mock module.findUnique to prevent null access error
      vi.mocked(prisma.module.findUnique).mockResolvedValue(null as any)

      const formData = new FormData()
      formData.set("id", "mod-1")

      const { deleteModule } = await import("@/app/(dashboard)/dashboard/courses/actions")

      await deleteModule(formData)

      expect(redirect).toHaveBeenCalledWith("/login")
    })

    it("should require ownership", async () => {
      vi.mocked(auth).mockResolvedValue(mockProfSession as any)

      const existingModule = {
        id: "mod-1",
        title: "Module to Delete",
        order: 1,
        courseId: "course-1",
        course: {
          ...mockCourse,
          profId: "different-prof-id",
        },
      }

      vi.mocked(prisma.module.findUnique).mockResolvedValue(existingModule as any)

      const formData = new FormData()
      formData.set("id", "mod-1")

      const { deleteModule } = await import("@/app/(dashboard)/dashboard/courses/actions")

      const result = await deleteModule(formData)

      expect(result).toBeDefined()
      expect(result?.error).toContain("autorisé")
      expect(prisma.module.delete).not.toHaveBeenCalled()
    })
  })

  describe("reorderModule", () => {
    it("should swap order when moving up", async () => {
      vi.mocked(auth).mockResolvedValue(mockProfSession as any)

      const modules = [
        { id: "mod-1", title: "Module 1", order: 1, courseId: "course-1" },
        { id: "mod-2", title: "Module 2", order: 2, courseId: "course-1" },
        { id: "mod-3", title: "Module 3", order: 3, courseId: "course-1" },
      ]

      const currentModule = {
        ...modules[1],
        course: { ...mockCourse, modules },
      }

      vi.mocked(prisma.module.findUnique).mockResolvedValue(currentModule as any)
      vi.mocked(prisma.module.update).mockResolvedValue(currentModule as any)

      const formData = new FormData()
      formData.set("id", "mod-2")
      formData.set("direction", "up")

      const { reorderModule } = await import("@/app/(dashboard)/dashboard/courses/actions")

      await reorderModule(formData)

      // Should swap order with module above (mod-1)
      expect(prisma.module.update).toHaveBeenCalledWith({
        where: { id: "mod-1" },
        data: { order: 2 },
      })
      expect(prisma.module.update).toHaveBeenCalledWith({
        where: { id: "mod-2" },
        data: { order: 1 },
      })
    })

    it("should swap order when moving down", async () => {
      vi.mocked(auth).mockResolvedValue(mockProfSession as any)

      const modules = [
        { id: "mod-1", title: "Module 1", order: 1, courseId: "course-1" },
        { id: "mod-2", title: "Module 2", order: 2, courseId: "course-1" },
        { id: "mod-3", title: "Module 3", order: 3, courseId: "course-1" },
      ]

      const currentModule = {
        ...modules[1],
        course: { ...mockCourse, modules },
      }

      vi.mocked(prisma.module.findUnique).mockResolvedValue(currentModule as any)
      vi.mocked(prisma.module.update).mockResolvedValue(currentModule as any)

      const formData = new FormData()
      formData.set("id", "mod-2")
      formData.set("direction", "down")

      const { reorderModule } = await import("@/app/(dashboard)/dashboard/courses/actions")

      await reorderModule(formData)

      // Should swap order with module below (mod-3)
      expect(prisma.module.update).toHaveBeenCalledWith({
        where: { id: "mod-2" },
        data: { order: 3 },
      })
      expect(prisma.module.update).toHaveBeenCalledWith({
        where: { id: "mod-3" },
        data: { order: 2 },
      })
    })

    it("should not move beyond first position", async () => {
      vi.mocked(auth).mockResolvedValue(mockProfSession as any)

      const modules = [
        { id: "mod-1", title: "Module 1", order: 1, courseId: "course-1" },
        { id: "mod-2", title: "Module 2", order: 2, courseId: "course-1" },
      ]

      const currentModule = {
        ...modules[0],
        course: { ...mockCourse, modules },
      }

      vi.mocked(prisma.module.findUnique).mockResolvedValue(currentModule as any)

      const formData = new FormData()
      formData.set("id", "mod-1")
      formData.set("direction", "up")

      const { reorderModule } = await import("@/app/(dashboard)/dashboard/courses/actions")

      const result = await reorderModule(formData)

      expect(result).toBeDefined()
      expect(result?.error).toBeDefined()
      expect(prisma.module.update).not.toHaveBeenCalled()
    })

    it("should not move beyond last position", async () => {
      vi.mocked(auth).mockResolvedValue(mockProfSession as any)

      const modules = [
        { id: "mod-1", title: "Module 1", order: 1, courseId: "course-1" },
        { id: "mod-2", title: "Module 2", order: 2, courseId: "course-1" },
      ]

      const currentModule = {
        ...modules[1],
        course: { ...mockCourse, modules },
      }

      vi.mocked(prisma.module.findUnique).mockResolvedValue(currentModule as any)

      const formData = new FormData()
      formData.set("id", "mod-2")
      formData.set("direction", "down")

      const { reorderModule } = await import("@/app/(dashboard)/dashboard/courses/actions")

      const result = await reorderModule(formData)

      expect(result).toBeDefined()
      expect(result?.error).toBeDefined()
      expect(prisma.module.update).not.toHaveBeenCalled()
    })

    it("should require authentication", async () => {
      vi.mocked(auth).mockResolvedValue(null as any)

      // Mock module.findUnique to prevent null access error
      vi.mocked(prisma.module.findUnique).mockResolvedValue(null as any)

      const formData = new FormData()
      formData.set("id", "mod-1")
      formData.set("direction", "up")

      const { reorderModule } = await import("@/app/(dashboard)/dashboard/courses/actions")

      await reorderModule(formData)

      expect(redirect).toHaveBeenCalledWith("/login")
    })

    it("should require ownership", async () => {
      vi.mocked(auth).mockResolvedValue(mockProfSession as any)

      const modules = [
        { id: "mod-1", title: "Module 1", order: 1, courseId: "course-1" },
        { id: "mod-2", title: "Module 2", order: 2, courseId: "course-1" },
      ]

      const currentModule = {
        ...modules[0],
        course: {
          ...mockCourse,
          profId: "different-prof-id",
          modules,
        },
      }

      vi.mocked(prisma.module.findUnique).mockResolvedValue(currentModule as any)

      const formData = new FormData()
      formData.set("id", "mod-1")
      formData.set("direction", "up")

      const { reorderModule } = await import("@/app/(dashboard)/dashboard/courses/actions")

      const result = await reorderModule(formData)

      expect(result).toBeDefined()
      expect(result?.error).toContain("autorisé")
      expect(prisma.module.update).not.toHaveBeenCalled()
    })
  })
})
