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
      findUnique: vi.fn(),
    },
    lesson: {
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      findUnique: vi.fn(),
      findMany: vi.fn(),
    },
  },
}))

import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"

describe("Lesson CRUD operations", () => {
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

  const mockModule = {
    id: "module-1",
    title: "Test Module",
    order: 1,
    courseId: "course-1",
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe("createLesson", () => {
    it("should create lesson with correct order", async () => {
      vi.mocked(auth).mockResolvedValue(mockProfSession as any)

      const existingLessons = [
        { id: "lesson-1", title: "Lesson 1", description: null, videoUrl: null, order: 1, moduleId: "module-1" },
        { id: "lesson-2", title: "Lesson 2", description: null, videoUrl: null, order: 2, moduleId: "module-1" },
      ]

      vi.mocked(prisma.module.findUnique).mockResolvedValue({
        ...mockModule,
        course: mockCourse,
        lessons: existingLessons,
      } as any)

      const newLesson = {
        id: "lesson-3",
        title: "Nouvelle leçon",
        description: null,
        videoUrl: null,
        order: 3,
        moduleId: "module-1",
      }

      vi.mocked(prisma.lesson.create).mockResolvedValue(newLesson as any)

      const formData = new FormData()
      formData.set("moduleId", "module-1")

      const { createLesson } = await import("@/app/(dashboard)/dashboard/courses/actions")

      await createLesson(formData)

      expect(prisma.lesson.create).toHaveBeenCalledWith({
        data: {
          title: "Nouvelle leçon",
          order: 3,
          moduleId: "module-1",
        },
      })
    })

    it("should require authentication", async () => {
      vi.mocked(auth).mockResolvedValue(null as any)

      vi.mocked(prisma.module.findUnique).mockResolvedValue(null as any)

      const formData = new FormData()
      formData.set("moduleId", "module-1")

      const { createLesson } = await import("@/app/(dashboard)/dashboard/courses/actions")

      await createLesson(formData)

      expect(redirect).toHaveBeenCalledWith("/login")
    })

    it("should require PROF role", async () => {
      vi.mocked(auth).mockResolvedValue(mockStudentSession as any)

      const formData = new FormData()
      formData.set("moduleId", "module-1")

      const { createLesson } = await import("@/app/(dashboard)/dashboard/courses/actions")

      await createLesson(formData)

      expect(redirect).toHaveBeenCalledWith("/login")
    })

    it("should require ownership", async () => {
      vi.mocked(auth).mockResolvedValue(mockProfSession as any)

      vi.mocked(prisma.module.findUnique).mockResolvedValue({
        ...mockModule,
        course: {
          ...mockCourse,
          profId: "different-prof-id",
        },
        lessons: [],
      } as any)

      const formData = new FormData()
      formData.set("moduleId", "module-1")

      const { createLesson } = await import("@/app/(dashboard)/dashboard/courses/actions")

      const result = await createLesson(formData)

      expect(result).toBeDefined()
      expect(result?.error).toContain("autorisé")
      expect(prisma.lesson.create).not.toHaveBeenCalled()
    })
  })

  describe("updateLesson", () => {
    it("should update all fields", async () => {
      vi.mocked(auth).mockResolvedValue(mockProfSession as any)

      const existingLesson = {
        id: "lesson-1",
        title: "Old Title",
        description: "Old description",
        videoUrl: "https://old-url.com",
        order: 1,
        moduleId: "module-1",
        module: {
          ...mockModule,
          course: mockCourse,
        },
      }

      vi.mocked(prisma.lesson.findUnique).mockResolvedValue(existingLesson as any)
      vi.mocked(prisma.lesson.update).mockResolvedValue({
        ...existingLesson,
        title: "New Title",
        description: "New description",
        videoUrl: "https://new-url.com",
      } as any)

      const formData = new FormData()
      formData.set("id", "lesson-1")
      formData.set("title", "New Title")
      formData.set("description", "New description")
      formData.set("videoUrl", "https://new-url.com")

      const { updateLesson } = await import("@/app/(dashboard)/dashboard/courses/actions")

      await updateLesson(formData)

      expect(prisma.lesson.update).toHaveBeenCalledWith({
        where: { id: "lesson-1" },
        data: {
          title: "New Title",
          description: "New description",
          videoUrl: "https://new-url.com",
        },
      })
    })

    it("should require authentication", async () => {
      vi.mocked(auth).mockResolvedValue(null as any)

      vi.mocked(prisma.lesson.findUnique).mockResolvedValue(null as any)

      const formData = new FormData()
      formData.set("id", "lesson-1")
      formData.set("title", "New Title")

      const { updateLesson } = await import("@/app/(dashboard)/dashboard/courses/actions")

      await updateLesson(formData)

      expect(redirect).toHaveBeenCalledWith("/login")
    })

    it("should require ownership", async () => {
      vi.mocked(auth).mockResolvedValue(mockProfSession as any)

      const existingLesson = {
        id: "lesson-1",
        title: "Old Title",
        description: null,
        videoUrl: null,
        order: 1,
        moduleId: "module-1",
        module: {
          ...mockModule,
          course: {
            ...mockCourse,
            profId: "different-prof-id",
          },
        },
      }

      vi.mocked(prisma.lesson.findUnique).mockResolvedValue(existingLesson as any)

      const formData = new FormData()
      formData.set("id", "lesson-1")
      formData.set("title", "New Title")

      const { updateLesson } = await import("@/app/(dashboard)/dashboard/courses/actions")

      const result = await updateLesson(formData)

      expect(result).toBeDefined()
      expect(result?.error).toContain("autorisé")
      expect(prisma.lesson.update).not.toHaveBeenCalled()
    })
  })

  describe("deleteLesson", () => {
    it("should delete lesson when user is owner", async () => {
      vi.mocked(auth).mockResolvedValue(mockProfSession as any)

      const existingLesson = {
        id: "lesson-1",
        title: "Lesson to Delete",
        description: null,
        videoUrl: null,
        order: 1,
        moduleId: "module-1",
        module: {
          ...mockModule,
          course: mockCourse,
        },
      }

      vi.mocked(prisma.lesson.findUnique).mockResolvedValue(existingLesson as any)
      vi.mocked(prisma.lesson.delete).mockResolvedValue(existingLesson as any)

      const formData = new FormData()
      formData.set("id", "lesson-1")

      const { deleteLesson } = await import("@/app/(dashboard)/dashboard/courses/actions")

      await deleteLesson(formData)

      expect(prisma.lesson.delete).toHaveBeenCalledWith({
        where: { id: "lesson-1" },
      })
    })

    it("should require authentication", async () => {
      vi.mocked(auth).mockResolvedValue(null as any)

      vi.mocked(prisma.lesson.findUnique).mockResolvedValue(null as any)

      const formData = new FormData()
      formData.set("id", "lesson-1")

      const { deleteLesson } = await import("@/app/(dashboard)/dashboard/courses/actions")

      await deleteLesson(formData)

      expect(redirect).toHaveBeenCalledWith("/login")
    })

    it("should require ownership", async () => {
      vi.mocked(auth).mockResolvedValue(mockProfSession as any)

      const existingLesson = {
        id: "lesson-1",
        title: "Lesson to Delete",
        description: null,
        videoUrl: null,
        order: 1,
        moduleId: "module-1",
        module: {
          ...mockModule,
          course: {
            ...mockCourse,
            profId: "different-prof-id",
          },
        },
      }

      vi.mocked(prisma.lesson.findUnique).mockResolvedValue(existingLesson as any)

      const formData = new FormData()
      formData.set("id", "lesson-1")

      const { deleteLesson } = await import("@/app/(dashboard)/dashboard/courses/actions")

      const result = await deleteLesson(formData)

      expect(result).toBeDefined()
      expect(result?.error).toContain("autorisé")
      expect(prisma.lesson.delete).not.toHaveBeenCalled()
    })
  })

  describe("reorderLesson", () => {
    it("should swap order when moving up", async () => {
      vi.mocked(auth).mockResolvedValue(mockProfSession as any)

      const lessons = [
        { id: "lesson-1", title: "Lesson 1", description: null, videoUrl: null, order: 1, moduleId: "module-1" },
        { id: "lesson-2", title: "Lesson 2", description: null, videoUrl: null, order: 2, moduleId: "module-1" },
        { id: "lesson-3", title: "Lesson 3", description: null, videoUrl: null, order: 3, moduleId: "module-1" },
      ]

      const currentLesson = {
        ...lessons[1],
        module: {
          ...mockModule,
          course: mockCourse,
          lessons,
        },
      }

      vi.mocked(prisma.lesson.findUnique).mockResolvedValue(currentLesson as any)
      vi.mocked(prisma.lesson.update).mockResolvedValue(currentLesson as any)

      const formData = new FormData()
      formData.set("id", "lesson-2")
      formData.set("direction", "up")

      const { reorderLesson } = await import("@/app/(dashboard)/dashboard/courses/actions")

      await reorderLesson(formData)

      // Should swap order with lesson above (lesson-1)
      expect(prisma.lesson.update).toHaveBeenCalledWith({
        where: { id: "lesson-1" },
        data: { order: 2 },
      })
      expect(prisma.lesson.update).toHaveBeenCalledWith({
        where: { id: "lesson-2" },
        data: { order: 1 },
      })
    })

    it("should swap order when moving down", async () => {
      vi.mocked(auth).mockResolvedValue(mockProfSession as any)

      const lessons = [
        { id: "lesson-1", title: "Lesson 1", description: null, videoUrl: null, order: 1, moduleId: "module-1" },
        { id: "lesson-2", title: "Lesson 2", description: null, videoUrl: null, order: 2, moduleId: "module-1" },
        { id: "lesson-3", title: "Lesson 3", description: null, videoUrl: null, order: 3, moduleId: "module-1" },
      ]

      const currentLesson = {
        ...lessons[1],
        module: {
          ...mockModule,
          course: mockCourse,
          lessons,
        },
      }

      vi.mocked(prisma.lesson.findUnique).mockResolvedValue(currentLesson as any)
      vi.mocked(prisma.lesson.update).mockResolvedValue(currentLesson as any)

      const formData = new FormData()
      formData.set("id", "lesson-2")
      formData.set("direction", "down")

      const { reorderLesson } = await import("@/app/(dashboard)/dashboard/courses/actions")

      await reorderLesson(formData)

      // Should swap order with lesson below (lesson-3)
      expect(prisma.lesson.update).toHaveBeenCalledWith({
        where: { id: "lesson-2" },
        data: { order: 3 },
      })
      expect(prisma.lesson.update).toHaveBeenCalledWith({
        where: { id: "lesson-3" },
        data: { order: 2 },
      })
    })

    it("should not move beyond first position", async () => {
      vi.mocked(auth).mockResolvedValue(mockProfSession as any)

      const lessons = [
        { id: "lesson-1", title: "Lesson 1", description: null, videoUrl: null, order: 1, moduleId: "module-1" },
        { id: "lesson-2", title: "Lesson 2", description: null, videoUrl: null, order: 2, moduleId: "module-1" },
      ]

      const currentLesson = {
        ...lessons[0],
        module: {
          ...mockModule,
          course: mockCourse,
          lessons,
        },
      }

      vi.mocked(prisma.lesson.findUnique).mockResolvedValue(currentLesson as any)

      const formData = new FormData()
      formData.set("id", "lesson-1")
      formData.set("direction", "up")

      const { reorderLesson } = await import("@/app/(dashboard)/dashboard/courses/actions")

      const result = await reorderLesson(formData)

      expect(result).toBeDefined()
      expect(result?.error).toBeDefined()
      expect(prisma.lesson.update).not.toHaveBeenCalled()
    })

    it("should not move beyond last position", async () => {
      vi.mocked(auth).mockResolvedValue(mockProfSession as any)

      const lessons = [
        { id: "lesson-1", title: "Lesson 1", description: null, videoUrl: null, order: 1, moduleId: "module-1" },
        { id: "lesson-2", title: "Lesson 2", description: null, videoUrl: null, order: 2, moduleId: "module-1" },
      ]

      const currentLesson = {
        ...lessons[1],
        module: {
          ...mockModule,
          course: mockCourse,
          lessons,
        },
      }

      vi.mocked(prisma.lesson.findUnique).mockResolvedValue(currentLesson as any)

      const formData = new FormData()
      formData.set("id", "lesson-2")
      formData.set("direction", "down")

      const { reorderLesson } = await import("@/app/(dashboard)/dashboard/courses/actions")

      const result = await reorderLesson(formData)

      expect(result).toBeDefined()
      expect(result?.error).toBeDefined()
      expect(prisma.lesson.update).not.toHaveBeenCalled()
    })

    it("should require authentication", async () => {
      vi.mocked(auth).mockResolvedValue(null as any)

      vi.mocked(prisma.lesson.findUnique).mockResolvedValue(null as any)

      const formData = new FormData()
      formData.set("id", "lesson-1")
      formData.set("direction", "up")

      const { reorderLesson } = await import("@/app/(dashboard)/dashboard/courses/actions")

      await reorderLesson(formData)

      expect(redirect).toHaveBeenCalledWith("/login")
    })

    it("should require ownership", async () => {
      vi.mocked(auth).mockResolvedValue(mockProfSession as any)

      const lessons = [
        { id: "lesson-1", title: "Lesson 1", description: null, videoUrl: null, order: 1, moduleId: "module-1" },
        { id: "lesson-2", title: "Lesson 2", description: null, videoUrl: null, order: 2, moduleId: "module-1" },
      ]

      const currentLesson = {
        ...lessons[0],
        module: {
          ...mockModule,
          course: {
            ...mockCourse,
            profId: "different-prof-id",
          },
          lessons,
        },
      }

      vi.mocked(prisma.lesson.findUnique).mockResolvedValue(currentLesson as any)

      const formData = new FormData()
      formData.set("id", "lesson-1")
      formData.set("direction", "up")

      const { reorderLesson } = await import("@/app/(dashboard)/dashboard/courses/actions")

      const result = await reorderLesson(formData)

      expect(result).toBeDefined()
      expect(result?.error).toContain("autorisé")
      expect(prisma.lesson.update).not.toHaveBeenCalled()
    })
  })
})
