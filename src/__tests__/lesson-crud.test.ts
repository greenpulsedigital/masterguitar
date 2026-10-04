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
    $transaction: vi.fn((ops: Promise<unknown>[]) => Promise.all(ops)),
  },
}))

import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"

type AuthResult = Awaited<ReturnType<typeof auth>>
type ModuleResult = Awaited<ReturnType<typeof prisma.module.findUnique>>
type LessonResult = Awaited<ReturnType<typeof prisma.lesson.findUnique>>
type LessonCreateResult = Awaited<ReturnType<typeof prisma.lesson.create>>
type LessonUpdateResult = Awaited<ReturnType<typeof prisma.lesson.update>>
type LessonDeleteResult = Awaited<ReturnType<typeof prisma.lesson.delete>>

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
    id: "mod-1",
    title: "Module 1",
    order: 1,
    courseId: "course-1",
    course: mockCourse,
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe("createLesson", () => {
    it("should create lesson with correct order", async () => {
      vi.mocked(auth).mockResolvedValue(mockProfSession as unknown as AuthResult)

      const existingLessons = [
        { id: "les-1", title: "Lesson 1", order: 1, moduleId: "mod-1" },
        { id: "les-2", title: "Lesson 2", order: 2, moduleId: "mod-1" },
      ]

      vi.mocked(prisma.module.findUnique).mockResolvedValue({
        ...mockModule,
        lessons: existingLessons,
      } as unknown as ModuleResult)

      const newLesson = {
        id: "les-3",
        title: "Nouvelle leçon",
        description: null,
        videoUrl: null,
        order: 3,
        moduleId: "mod-1",
      }

      vi.mocked(prisma.lesson.create).mockResolvedValue(newLesson as unknown as LessonCreateResult)

      const formData = new FormData()
      formData.set("moduleId", "mod-1")
      formData.set("title", "Nouvelle leçon")

      const { createLesson } = await import("@/app/(dashboard)/dashboard/courses/actions")

      await createLesson(formData)

      expect(prisma.lesson.create).toHaveBeenCalledWith({
        data: {
          title: "Nouvelle leçon",
          description: null,
          videoUrl: null,
          order: 3,
          moduleId: "mod-1",
        },
      })
    })

    it("should require authentication", async () => {
      vi.mocked(auth).mockResolvedValue(null as unknown as AuthResult)
      vi.mocked(prisma.module.findUnique).mockResolvedValue(null)

      const formData = new FormData()
      formData.set("moduleId", "mod-1")
      formData.set("title", "Nouvelle leçon")

      const { createLesson } = await import("@/app/(dashboard)/dashboard/courses/actions")

      await createLesson(formData)

      expect(redirect).toHaveBeenCalledWith("/login")
    })

    it("should require PROF role", async () => {
      vi.mocked(auth).mockResolvedValue(mockStudentSession as unknown as AuthResult)

      const formData = new FormData()
      formData.set("moduleId", "mod-1")
      formData.set("title", "Nouvelle leçon")

      const { createLesson } = await import("@/app/(dashboard)/dashboard/courses/actions")

      await createLesson(formData)

      expect(redirect).toHaveBeenCalledWith("/login")
    })

    it("should require ownership", async () => {
      vi.mocked(auth).mockResolvedValue(mockProfSession as unknown as AuthResult)

      vi.mocked(prisma.module.findUnique).mockResolvedValue({
        ...mockModule,
        course: { ...mockCourse, profId: "different-prof-id" },
        lessons: [],
      } as unknown as ModuleResult)

      const formData = new FormData()
      formData.set("moduleId", "mod-1")
      formData.set("title", "Nouvelle leçon")

      const { createLesson } = await import("@/app/(dashboard)/dashboard/courses/actions")

      const result = await createLesson(formData)

      expect(result).toBeDefined()
      expect(result?.error).toContain("autorisé")
      expect(prisma.lesson.create).not.toHaveBeenCalled()
    })
  })

  describe("updateLesson", () => {
    it("should update lesson fields", async () => {
      vi.mocked(auth).mockResolvedValue(mockProfSession as unknown as AuthResult)

      const existingLesson = {
        id: "les-1",
        title: "Old Title",
        description: "Old description",
        videoUrl: null,
        order: 1,
        moduleId: "mod-1",
        module: mockModule,
      }

      vi.mocked(prisma.lesson.findUnique).mockResolvedValue(existingLesson as unknown as LessonResult)
      vi.mocked(prisma.lesson.update).mockResolvedValue({
        ...existingLesson,
        title: "New Title",
      } as unknown as LessonUpdateResult)

      const formData = new FormData()
      formData.set("id", "les-1")
      formData.set("title", "New Title")
      formData.set("description", "New description")
      formData.set("videoUrl", "https://example.com/embed/abc")

      const { updateLesson } = await import("@/app/(dashboard)/dashboard/courses/actions")

      await updateLesson(formData)

      expect(prisma.lesson.update).toHaveBeenCalledWith({
        where: { id: "les-1" },
        data: {
          title: "New Title",
          description: "New description",
          videoUrl: "https://example.com/embed/abc",
        },
      })
    })

    it("should require authentication", async () => {
      vi.mocked(auth).mockResolvedValue(null as unknown as AuthResult)
      vi.mocked(prisma.lesson.findUnique).mockResolvedValue(null)

      const formData = new FormData()
      formData.set("id", "les-1")
      formData.set("title", "New Title")

      const { updateLesson } = await import("@/app/(dashboard)/dashboard/courses/actions")

      await updateLesson(formData)

      expect(redirect).toHaveBeenCalledWith("/login")
    })

    it("should require ownership", async () => {
      vi.mocked(auth).mockResolvedValue(mockProfSession as unknown as AuthResult)

      const existingLesson = {
        id: "les-1",
        title: "Old Title",
        description: null,
        videoUrl: null,
        order: 1,
        moduleId: "mod-1",
        module: {
          ...mockModule,
          course: { ...mockCourse, profId: "different-prof-id" },
        },
      }

      vi.mocked(prisma.lesson.findUnique).mockResolvedValue(existingLesson as unknown as LessonResult)

      const formData = new FormData()
      formData.set("id", "les-1")
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
      vi.mocked(auth).mockResolvedValue(mockProfSession as unknown as AuthResult)

      const existingLesson = {
        id: "les-1",
        title: "Lesson to Delete",
        description: null,
        videoUrl: null,
        order: 1,
        moduleId: "mod-1",
        module: mockModule,
      }

      vi.mocked(prisma.lesson.findUnique).mockResolvedValue(existingLesson as unknown as LessonResult)
      vi.mocked(prisma.lesson.delete).mockResolvedValue(existingLesson as unknown as LessonDeleteResult)

      const formData = new FormData()
      formData.set("id", "les-1")

      const { deleteLesson } = await import("@/app/(dashboard)/dashboard/courses/actions")

      await deleteLesson(formData)

      expect(prisma.lesson.delete).toHaveBeenCalledWith({
        where: { id: "les-1" },
      })
    })

    it("should require authentication", async () => {
      vi.mocked(auth).mockResolvedValue(null as unknown as AuthResult)
      vi.mocked(prisma.lesson.findUnique).mockResolvedValue(null)

      const formData = new FormData()
      formData.set("id", "les-1")

      const { deleteLesson } = await import("@/app/(dashboard)/dashboard/courses/actions")

      await deleteLesson(formData)

      expect(redirect).toHaveBeenCalledWith("/login")
    })

    it("should require ownership", async () => {
      vi.mocked(auth).mockResolvedValue(mockProfSession as unknown as AuthResult)

      const existingLesson = {
        id: "les-1",
        title: "Lesson to Delete",
        description: null,
        videoUrl: null,
        order: 1,
        moduleId: "mod-1",
        module: {
          ...mockModule,
          course: { ...mockCourse, profId: "different-prof-id" },
        },
      }

      vi.mocked(prisma.lesson.findUnique).mockResolvedValue(existingLesson as unknown as LessonResult)

      const formData = new FormData()
      formData.set("id", "les-1")

      const { deleteLesson } = await import("@/app/(dashboard)/dashboard/courses/actions")

      const result = await deleteLesson(formData)

      expect(result).toBeDefined()
      expect(result?.error).toContain("autorisé")
      expect(prisma.lesson.delete).not.toHaveBeenCalled()
    })
  })

  describe("reorderLesson", () => {
    it("should swap order when moving up", async () => {
      vi.mocked(auth).mockResolvedValue(mockProfSession as unknown as AuthResult)

      const lessons = [
        { id: "les-1", title: "Lesson 1", order: 1, moduleId: "mod-1" },
        { id: "les-2", title: "Lesson 2", order: 2, moduleId: "mod-1" },
        { id: "les-3", title: "Lesson 3", order: 3, moduleId: "mod-1" },
      ]

      const currentLesson = {
        ...lessons[1],
        module: { ...mockModule, lessons },
      }

      vi.mocked(prisma.lesson.findUnique).mockResolvedValue(currentLesson as unknown as LessonResult)
      vi.mocked(prisma.lesson.update).mockResolvedValue(currentLesson as unknown as LessonUpdateResult)

      const formData = new FormData()
      formData.set("id", "les-2")
      formData.set("direction", "up")

      const { reorderLesson } = await import("@/app/(dashboard)/dashboard/courses/actions")

      await reorderLesson(formData)

      expect(prisma.lesson.update).toHaveBeenCalledWith({
        where: { id: "les-1" },
        data: { order: 2 },
      })
      expect(prisma.lesson.update).toHaveBeenCalledWith({
        where: { id: "les-2" },
        data: { order: 1 },
      })
    })

    it("should swap order when moving down", async () => {
      vi.mocked(auth).mockResolvedValue(mockProfSession as unknown as AuthResult)

      const lessons = [
        { id: "les-1", title: "Lesson 1", order: 1, moduleId: "mod-1" },
        { id: "les-2", title: "Lesson 2", order: 2, moduleId: "mod-1" },
        { id: "les-3", title: "Lesson 3", order: 3, moduleId: "mod-1" },
      ]

      const currentLesson = {
        ...lessons[1],
        module: { ...mockModule, lessons },
      }

      vi.mocked(prisma.lesson.findUnique).mockResolvedValue(currentLesson as unknown as LessonResult)
      vi.mocked(prisma.lesson.update).mockResolvedValue(currentLesson as unknown as LessonUpdateResult)

      const formData = new FormData()
      formData.set("id", "les-2")
      formData.set("direction", "down")

      const { reorderLesson } = await import("@/app/(dashboard)/dashboard/courses/actions")

      await reorderLesson(formData)

      expect(prisma.lesson.update).toHaveBeenCalledWith({
        where: { id: "les-2" },
        data: { order: 3 },
      })
      expect(prisma.lesson.update).toHaveBeenCalledWith({
        where: { id: "les-3" },
        data: { order: 2 },
      })
    })

    it("should not move beyond first position", async () => {
      vi.mocked(auth).mockResolvedValue(mockProfSession as unknown as AuthResult)

      const lessons = [
        { id: "les-1", title: "Lesson 1", order: 1, moduleId: "mod-1" },
        { id: "les-2", title: "Lesson 2", order: 2, moduleId: "mod-1" },
      ]

      const currentLesson = {
        ...lessons[0],
        module: { ...mockModule, lessons },
      }

      vi.mocked(prisma.lesson.findUnique).mockResolvedValue(currentLesson as unknown as LessonResult)

      const formData = new FormData()
      formData.set("id", "les-1")
      formData.set("direction", "up")

      const { reorderLesson } = await import("@/app/(dashboard)/dashboard/courses/actions")

      const result = await reorderLesson(formData)

      expect(result).toBeDefined()
      expect(result?.error).toBeDefined()
      expect(prisma.lesson.update).not.toHaveBeenCalled()
    })

    it("should not move beyond last position", async () => {
      vi.mocked(auth).mockResolvedValue(mockProfSession as unknown as AuthResult)

      const lessons = [
        { id: "les-1", title: "Lesson 1", order: 1, moduleId: "mod-1" },
        { id: "les-2", title: "Lesson 2", order: 2, moduleId: "mod-1" },
      ]

      const currentLesson = {
        ...lessons[1],
        module: { ...mockModule, lessons },
      }

      vi.mocked(prisma.lesson.findUnique).mockResolvedValue(currentLesson as unknown as LessonResult)

      const formData = new FormData()
      formData.set("id", "les-2")
      formData.set("direction", "down")

      const { reorderLesson } = await import("@/app/(dashboard)/dashboard/courses/actions")

      const result = await reorderLesson(formData)

      expect(result).toBeDefined()
      expect(result?.error).toBeDefined()
      expect(prisma.lesson.update).not.toHaveBeenCalled()
    })

    it("should require authentication", async () => {
      vi.mocked(auth).mockResolvedValue(null as unknown as AuthResult)
      vi.mocked(prisma.lesson.findUnique).mockResolvedValue(null)

      const formData = new FormData()
      formData.set("id", "les-1")
      formData.set("direction", "up")

      const { reorderLesson } = await import("@/app/(dashboard)/dashboard/courses/actions")

      await reorderLesson(formData)

      expect(redirect).toHaveBeenCalledWith("/login")
    })

    it("should require ownership", async () => {
      vi.mocked(auth).mockResolvedValue(mockProfSession as unknown as AuthResult)

      const lessons = [
        { id: "les-1", title: "Lesson 1", order: 1, moduleId: "mod-1" },
        { id: "les-2", title: "Lesson 2", order: 2, moduleId: "mod-1" },
      ]

      const currentLesson = {
        ...lessons[0],
        module: {
          ...mockModule,
          course: { ...mockCourse, profId: "different-prof-id" },
          lessons,
        },
      }

      vi.mocked(prisma.lesson.findUnique).mockResolvedValue(currentLesson as unknown as LessonResult)

      const formData = new FormData()
      formData.set("id", "les-1")
      formData.set("direction", "up")

      const { reorderLesson } = await import("@/app/(dashboard)/dashboard/courses/actions")

      const result = await reorderLesson(formData)

      expect(result).toBeDefined()
      expect(result?.error).toContain("autorisé")
      expect(prisma.lesson.update).not.toHaveBeenCalled()
    })
  })
})
