import { describe, it, expect, vi, beforeEach } from "vitest"
import { getCourseBySlug } from "@/lib/queries/course"

// Mock prisma
vi.mock("@/lib/prisma", () => ({
  prisma: {
    course: {
      findFirst: vi.fn(),
    },
  },
}))

import { prisma } from "@/lib/prisma"

describe("getCourseBySlug", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("should return published course with modules and prof name", async () => {
    const mockCourse = {
      id: "course-1",
      slug: "guitare-debutant",
      title: "Guitare Débutant",
      description: "Apprenez les bases de la guitare",
      price: 4900,
      thumbnailUrl: "https://example.com/thumb.jpg",
      status: "PUBLISHED",
      profId: "prof-1",
      createdAt: new Date(),
      updatedAt: new Date(),
      prof: {
        name: "Jean Dupont",
      },
      modules: [
        {
          id: "module-1",
          title: "Introduction",
          order: 1,
          courseId: "course-1",
        },
        {
          id: "module-2",
          title: "Accords de base",
          order: 2,
          courseId: "course-1",
        },
      ],
    }

    vi.mocked(prisma.course.findFirst).mockResolvedValueOnce(mockCourse as any)

    const result = await getCourseBySlug("guitare-debutant")

    expect(result).toEqual(mockCourse)
    expect(prisma.course.findFirst).toHaveBeenCalledWith({
      where: {
        slug: "guitare-debutant",
        status: "PUBLISHED",
      },
      select: {
        id: true,
        slug: true,
        title: true,
        description: true,
        price: true,
        thumbnailUrl: true,
        modules: {
          select: { id: true, title: true, order: true },
          orderBy: {
            order: "asc",
          },
        },
        prof: {
          select: {
            name: true,
          },
        },
      },
    })
  })

  it("should only select public fields (no lessons, videoUrl, profId or prof email)", async () => {
    vi.mocked(prisma.course.findFirst).mockResolvedValueOnce(null)

    await getCourseBySlug("any-course")

    const args = vi.mocked(prisma.course.findFirst).mock.calls.at(-1)![0] as any
    expect(args.include).toBeUndefined()
    expect(args.select).not.toHaveProperty("profId")
    expect(args.select.modules.select).not.toHaveProperty("lessons")
    expect(JSON.stringify(args.select)).not.toMatch(/videoUrl|lessons|email/)
    expect(args.select.prof.select).toEqual({ name: true })
  })

  it("should return null for non-existent course", async () => {
    vi.mocked(prisma.course.findFirst).mockResolvedValueOnce(null)

    const result = await getCourseBySlug("non-existent-course")

    expect(result).toBeNull()
  })

  it("should return null for draft course (not accessible publicly)", async () => {
    vi.mocked(prisma.course.findFirst).mockResolvedValueOnce(null)

    const result = await getCourseBySlug("draft-course")

    expect(result).toBeNull()
    expect(prisma.course.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          status: "PUBLISHED",
        }),
      })
    )
  })

  it("should order modules by order field ascending", async () => {
    const mockCourse = {
      id: "course-1",
      slug: "test-course",
      title: "Test Course",
      description: null,
      price: 0,
      thumbnailUrl: null,
      status: "PUBLISHED",
      profId: "prof-1",
      createdAt: new Date(),
      updatedAt: new Date(),
      prof: {
        name: "Test Prof",
      },
      modules: [
        { id: "m1", title: "Module 1", order: 1, courseId: "course-1" },
        { id: "m2", title: "Module 2", order: 2, courseId: "course-1" },
        { id: "m3", title: "Module 3", order: 3, courseId: "course-1" },
      ],
    }

    vi.mocked(prisma.course.findFirst).mockResolvedValueOnce(mockCourse as any)

    await getCourseBySlug("test-course")

    expect(prisma.course.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        select: expect.objectContaining({
          modules: expect.objectContaining({
            orderBy: {
              order: "asc",
            },
          }),
        }),
      })
    )
  })
})
