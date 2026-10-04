import { describe, it, expect, vi, beforeEach } from "vitest"

// Mock prisma
vi.mock("@/lib/prisma", () => ({
  prisma: {
    course: {
      findUnique: vi.fn(),
    },
  },
}))

import { prisma } from "@/lib/prisma"
import { getCourseById } from "@/lib/queries/course"

type CourseResult = Awaited<ReturnType<typeof prisma.course.findUnique>>

describe("getCourseById", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("should return course with required fields when found", async () => {
    const mockCourse = {
      id: "course-1",
      title: "Test Course",
      slug: "test-course",
      price: 5000,
      status: "PUBLISHED" as const,
      profId: "prof-1",
      description: "A test course",
      thumbnailUrl: "https://example.com/image.jpg",
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    vi.mocked(prisma.course.findUnique).mockResolvedValue(mockCourse as unknown as CourseResult)

    const result = await getCourseById("course-1")

    expect(result).toBeDefined()
    expect(result?.id).toBe("course-1")
    expect(result?.title).toBe("Test Course")
    expect(result?.slug).toBe("test-course")
    expect(result?.price).toBe(5000)
    expect(result?.status).toBe("PUBLISHED")
    expect(result?.profId).toBe("prof-1")
  })

  it("should return null when course not found", async () => {
    vi.mocked(prisma.course.findUnique).mockResolvedValue(null)

    const result = await getCourseById("non-existent-id")

    expect(result).toBeNull()
    expect(prisma.course.findUnique).toHaveBeenCalledWith({
      where: { id: "non-existent-id" },
      select: {
        id: true,
        title: true,
        slug: true,
        price: true,
        status: true,
        profId: true,
      },
    })
  })

  it("should query with correct fields selection", async () => {
    const mockCourse = {
      id: "course-1",
      title: "Test Course",
      slug: "test-course",
      price: 5000,
      status: "DRAFT" as const,
      profId: "prof-1",
    }

    vi.mocked(prisma.course.findUnique).mockResolvedValue(mockCourse as unknown as CourseResult)

    await getCourseById("course-1")

    expect(prisma.course.findUnique).toHaveBeenCalledWith({
      where: { id: "course-1" },
      select: {
        id: true,
        title: true,
        slug: true,
        price: true,
        status: true,
        profId: true,
      },
    })
  })

  it("should work with DRAFT courses", async () => {
    const mockCourse = {
      id: "course-1",
      title: "Draft Course",
      slug: "draft-course",
      price: 3000,
      status: "DRAFT" as const,
      profId: "prof-1",
    }

    vi.mocked(prisma.course.findUnique).mockResolvedValue(mockCourse as unknown as CourseResult)

    const result = await getCourseById("course-1")

    expect(result).toBeDefined()
    expect(result?.status).toBe("DRAFT")
  })
})
