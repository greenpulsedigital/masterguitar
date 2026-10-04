import { describe, it, expect, vi, beforeEach } from "vitest"
import { generateSlug } from "@/lib/slug"

// Mock auth - type as function returning Promise<Session | null>
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
      create: vi.fn(),
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    purchase: {
      count: vi.fn(() => Promise.resolve(0)),
    },
  },
}))

import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"

type AuthResult = Awaited<ReturnType<typeof auth>>
type CourseResult = Awaited<ReturnType<typeof prisma.course.findUnique>>
type CourseCreateResult = Awaited<ReturnType<typeof prisma.course.create>>
type CourseUpdateResult = Awaited<ReturnType<typeof prisma.course.update>>
type CourseDeleteResult = Awaited<ReturnType<typeof prisma.course.delete>>

describe("Course CRUD operations", () => {
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

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe("Create Course", () => {
    it("should create course with valid data", async () => {
      vi.mocked(auth).mockResolvedValue(mockProfSession as unknown as AuthResult)

      const mockCourse = {
        id: "course-1",
        slug: generateSlug("Débuter la guitare"),
        title: "Débuter la guitare",
        description: "Un cours pour débutants",
        price: 4999,
        thumbnailUrl: "https://example.com/image.jpg",
        status: "DRAFT" as const,
        profId: "prof-test-id",
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      vi.mocked(prisma.course.create).mockResolvedValue(mockCourse as unknown as CourseCreateResult)

      const formData = new FormData()
      formData.set("title", "Débuter la guitare")
      formData.set("description", "Un cours pour débutants")
      formData.set("price", "49.99")
      formData.set("thumbnailUrl", "https://example.com/image.jpg")

      // Import after mocks are set up
      const { createCourse } = await import("@/app/(dashboard)/dashboard/courses/actions")

      await createCourse(formData)

      // Verify course.create was called with correct data
      expect(prisma.course.create).toHaveBeenCalledWith({
        data: {
          title: "Débuter la guitare",
          slug: generateSlug("Débuter la guitare"),
          description: "Un cours pour débutants",
          price: 4999,
          thumbnailUrl: "https://example.com/image.jpg",
          status: "DRAFT",
          profId: "prof-test-id",
        },
      })

      // Verify redirect was called
      expect(redirect).toHaveBeenCalledWith("/dashboard/courses/course-1")
    })

    it("should return error when title is missing", async () => {
      vi.mocked(auth).mockResolvedValue(mockProfSession as unknown as AuthResult)

      const formData = new FormData()
      formData.set("title", "")
      formData.set("price", "49.99")

      const { createCourse } = await import("@/app/(dashboard)/dashboard/courses/actions")

      const result = await createCourse(formData)

      expect(result).toBeDefined()
      expect(result?.error).toContain("titre")
    })

    it("should return error when price is negative", async () => {
      vi.mocked(auth).mockResolvedValue(mockProfSession as unknown as AuthResult)

      const formData = new FormData()
      formData.set("title", "Test Course")
      formData.set("price", "-10")

      const { createCourse } = await import("@/app/(dashboard)/dashboard/courses/actions")

      const result = await createCourse(formData)

      expect(result).toBeDefined()
      expect(result?.error).toContain("positif")
    })

    it("should redirect to login if not authenticated", async () => {
      vi.mocked(auth).mockResolvedValue(null as unknown as AuthResult)

      const formData = new FormData()
      formData.set("title", "Test Course")
      formData.set("price", "49.99")

      const { createCourse } = await import("@/app/(dashboard)/dashboard/courses/actions")

      await createCourse(formData)

      expect(redirect).toHaveBeenCalledWith("/login")
    })

    it("should redirect to login if user is not PROF", async () => {
      vi.mocked(auth).mockResolvedValue(mockStudentSession as unknown as AuthResult)

      const formData = new FormData()
      formData.set("title", "Test Course")
      formData.set("price", "49.99")

      const { createCourse } = await import("@/app/(dashboard)/dashboard/courses/actions")

      await createCourse(formData)

      expect(redirect).toHaveBeenCalledWith("/login")
    })
  })

  describe("Update Course", () => {
    it("should update course with valid data", async () => {
      vi.mocked(auth).mockResolvedValue(mockProfSession as unknown as AuthResult)

      const existingCourse = {
        id: "course-1",
        slug: "original-title",
        title: "Original Title",
        description: null,
        price: 1000,
        thumbnailUrl: null,
        status: "DRAFT" as const,
        profId: "prof-test-id",
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      vi.mocked(prisma.course.findUnique).mockResolvedValue(existingCourse as unknown as CourseResult)
      vi.mocked(prisma.course.update).mockResolvedValue({
        ...existingCourse,
        title: "Updated Title",
        slug: generateSlug("Updated Title"),
        price: 9999,
      } as unknown as CourseUpdateResult)

      const formData = new FormData()
      formData.set("id", "course-1")
      formData.set("title", "Updated Title")
      formData.set("description", "Updated description")
      formData.set("price", "99.99")

      const { updateCourse } = await import("@/app/(dashboard)/dashboard/courses/actions")

      await updateCourse(formData)

      expect(prisma.course.update).toHaveBeenCalledWith({
        where: { id: "course-1" },
        data: {
          title: "Updated Title",
          description: "Updated description",
          price: 9999,
          thumbnailUrl: null,
        },
      })

      expect(redirect).toHaveBeenCalledWith("/dashboard/courses")
    })

    it("should return error when user is not the owner", async () => {
      vi.mocked(auth).mockResolvedValue(mockProfSession as unknown as AuthResult)

      const existingCourse = {
        id: "course-1",
        profId: "different-prof-id",
        slug: "someone-elses-course",
        title: "Someone Else's Course",
        description: null,
        price: 1000,
        thumbnailUrl: null,
        status: "DRAFT" as const,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      vi.mocked(prisma.course.findUnique).mockResolvedValue(existingCourse as unknown as CourseResult)

      const formData = new FormData()
      formData.set("id", "course-1")
      formData.set("title", "Hacked Title")
      formData.set("price", "0")

      const { updateCourse } = await import("@/app/(dashboard)/dashboard/courses/actions")

      const result = await updateCourse(formData)

      expect(result).toBeDefined()
      expect(result?.error).toContain("autorisé")
      expect(prisma.course.update).not.toHaveBeenCalled()
    })
  })

  describe("Delete Course", () => {
    it("should delete course when user is owner", async () => {
      vi.mocked(auth).mockResolvedValue(mockProfSession as unknown as AuthResult)

      const existingCourse = {
        id: "course-1",
        profId: "prof-test-id",
        slug: "course-to-delete",
        title: "Course to Delete",
        description: null,
        price: 1000,
        thumbnailUrl: null,
        status: "DRAFT" as const,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      vi.mocked(prisma.course.findUnique).mockResolvedValue(existingCourse as unknown as CourseResult)
      vi.mocked(prisma.course.delete).mockResolvedValue(existingCourse as unknown as CourseDeleteResult)

      const formData = new FormData()
      formData.set("id", "course-1")

      const { deleteCourse } = await import("@/app/(dashboard)/dashboard/courses/actions")

      await deleteCourse(formData)

      expect(prisma.course.delete).toHaveBeenCalledWith({
        where: { id: "course-1" },
      })

      expect(redirect).toHaveBeenCalledWith("/dashboard/courses")
    })

    it("should return error when user is not the owner", async () => {
      vi.mocked(auth).mockResolvedValue(mockProfSession as unknown as AuthResult)

      const existingCourse = {
        id: "course-1",
        profId: "different-prof-id",
        slug: "someone-elses-course",
        title: "Someone Else's Course",
        description: null,
        price: 1000,
        thumbnailUrl: null,
        status: "DRAFT" as const,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      vi.mocked(prisma.course.findUnique).mockResolvedValue(existingCourse as unknown as CourseResult)

      const formData = new FormData()
      formData.set("id", "course-1")

      const { deleteCourse } = await import("@/app/(dashboard)/dashboard/courses/actions")

      const result = await deleteCourse(formData)

      expect(result).toBeDefined()
      expect(result?.error).toContain("autorisé")
      expect(prisma.course.delete).not.toHaveBeenCalled()
    })
  })

  describe("Toggle Course Status", () => {
    it("should toggle course from DRAFT to PUBLISHED", async () => {
      vi.mocked(auth).mockResolvedValue(mockProfSession as unknown as AuthResult)

      const draftCourse = {
        id: "course-1",
        profId: "prof-test-id",
        slug: "test-course",
        title: "Test Course",
        description: null,
        price: 1000,
        thumbnailUrl: null,
        status: "DRAFT" as const,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      vi.mocked(prisma.course.findUnique).mockResolvedValue(draftCourse as unknown as CourseResult)
      vi.mocked(prisma.course.update).mockResolvedValue({
        ...draftCourse,
        status: "PUBLISHED",
      } as unknown as CourseUpdateResult)

      const formData = new FormData()
      formData.set("id", "course-1")

      const { toggleCourseStatus } = await import("@/app/(dashboard)/dashboard/courses/actions")

      await toggleCourseStatus(formData)

      expect(prisma.course.update).toHaveBeenCalledWith({
        where: { id: "course-1" },
        data: { status: "PUBLISHED" },
      })
    })

    it("should toggle course from PUBLISHED to DRAFT", async () => {
      vi.mocked(auth).mockResolvedValue(mockProfSession as unknown as AuthResult)

      const publishedCourse = {
        id: "course-1",
        profId: "prof-test-id",
        slug: "test-course",
        title: "Test Course",
        description: null,
        price: 1000,
        thumbnailUrl: null,
        status: "PUBLISHED" as const,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      vi.mocked(prisma.course.findUnique).mockResolvedValue(publishedCourse as unknown as CourseResult)
      vi.mocked(prisma.course.update).mockResolvedValue({
        ...publishedCourse,
        status: "DRAFT",
      } as unknown as CourseUpdateResult)

      const formData = new FormData()
      formData.set("id", "course-1")

      const { toggleCourseStatus } = await import("@/app/(dashboard)/dashboard/courses/actions")

      await toggleCourseStatus(formData)

      expect(prisma.course.update).toHaveBeenCalledWith({
        where: { id: "course-1" },
        data: { status: "DRAFT" },
      })
    })

    it("should return error when user is not authenticated", async () => {
      vi.mocked(auth).mockResolvedValue(null as unknown as AuthResult)

      const formData = new FormData()
      formData.set("id", "course-1")

      const { toggleCourseStatus } = await import("@/app/(dashboard)/dashboard/courses/actions")

      await expect(toggleCourseStatus(formData)).rejects.toThrow()
    })

    it("should return error when user is not the owner", async () => {
      vi.mocked(auth).mockResolvedValue(mockProfSession as unknown as AuthResult)

      const existingCourse = {
        id: "course-1",
        profId: "different-prof-id",
        slug: "someone-elses-course",
        title: "Someone Else's Course",
        description: null,
        price: 1000,
        thumbnailUrl: null,
        status: "DRAFT" as const,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      vi.mocked(prisma.course.findUnique).mockResolvedValue(existingCourse as unknown as CourseResult)

      const formData = new FormData()
      formData.set("id", "course-1")

      const { toggleCourseStatus } = await import("@/app/(dashboard)/dashboard/courses/actions")

      const result = await toggleCourseStatus(formData)

      expect(result).toBeDefined()
      expect(result?.error).toContain("autorisé")
      expect(prisma.course.update).not.toHaveBeenCalled()
    })

    it("should return error when course is not found", async () => {
      vi.mocked(auth).mockResolvedValue(mockProfSession as unknown as AuthResult)
      vi.mocked(prisma.course.findUnique).mockResolvedValue(null)

      const formData = new FormData()
      formData.set("id", "non-existent-course")

      const { toggleCourseStatus } = await import("@/app/(dashboard)/dashboard/courses/actions")

      const result = await toggleCourseStatus(formData)

      expect(result).toBeDefined()
      expect(result?.error).toContain("introuvable")
      expect(prisma.course.update).not.toHaveBeenCalled()
    })
  })
})
