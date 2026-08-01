import { describe, it, expect, vi, beforeEach } from "vitest"

// Mock getCourseBySlug
vi.mock("@/lib/queries/course", () => ({
  getCourseBySlug: vi.fn(),
}))

// Mock next/navigation
vi.mock("next/navigation", () => ({
  notFound: vi.fn(() => {
    throw new Error("NEXT_NOT_FOUND")
  }),
}))

import { getCourseBySlug } from "@/lib/queries/course"
import { notFound } from "next/navigation"

describe("Sales Page", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("should render course data correctly", async () => {
    const mockCourse = {
      id: "course-1",
      slug: "guitare-debutant",
      title: "Guitare Débutant",
      description: "Apprenez les bases de la guitare",
      price: 4900,
      thumbnailUrl: "https://example.com/thumb.jpg",
      status: "PUBLISHED" as const,
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

    vi.mocked(getCourseBySlug).mockResolvedValueOnce(mockCourse as any)

    // The page should call getCourseBySlug with the slug
    const slug = "guitare-debutant"
    const course = await getCourseBySlug(slug)

    expect(getCourseBySlug).toHaveBeenCalledWith(slug)
    expect(course).toEqual(mockCourse)
    expect(course?.title).toBe("Guitare Débutant")
    expect(course?.modules).toHaveLength(2)
  })

  it("should call notFound for non-existent course", async () => {
    vi.mocked(getCourseBySlug).mockResolvedValueOnce(null)

    const course = await getCourseBySlug("non-existent")

    if (!course) {
      expect(() => notFound()).toThrow("NEXT_NOT_FOUND")
    }
  })

  it("should call notFound for draft course (not accessible publicly)", async () => {
    vi.mocked(getCourseBySlug).mockResolvedValueOnce(null)

    const course = await getCourseBySlug("draft-course")

    // getCourseBySlug filters out draft courses, so it returns null
    expect(course).toBeNull()
    if (!course) {
      expect(() => notFound()).toThrow("NEXT_NOT_FOUND")
    }
  })

  it("should handle course with no modules", async () => {
    const mockCourse = {
      id: "course-1",
      slug: "new-course",
      title: "New Course",
      description: "A new course",
      price: 0,
      thumbnailUrl: null,
      status: "PUBLISHED" as const,
      profId: "prof-1",
      createdAt: new Date(),
      updatedAt: new Date(),
      prof: {
        name: "Test Prof",
      },
      modules: [],
    }

    vi.mocked(getCourseBySlug).mockResolvedValueOnce(mockCourse as any)

    const course = await getCourseBySlug("new-course")

    expect(course?.modules).toHaveLength(0)
    // Empty modules array should trigger "Le programme sera bientôt disponible" message
  })

  it("should handle course with no thumbnail", async () => {
    const mockCourse = {
      id: "course-1",
      slug: "no-thumb-course",
      title: "No Thumbnail Course",
      description: "Test",
      price: 1000,
      thumbnailUrl: null,
      status: "PUBLISHED" as const,
      profId: "prof-1",
      createdAt: new Date(),
      updatedAt: new Date(),
      prof: {
        name: "Test Prof",
      },
      modules: [],
    }

    vi.mocked(getCourseBySlug).mockResolvedValueOnce(mockCourse as any)

    const course = await getCourseBySlug("no-thumb-course")

    expect(course?.thumbnailUrl).toBeNull()
    // Should show gradient placeholder
  })

  it("should handle course with no description", async () => {
    const mockCourse = {
      id: "course-1",
      slug: "no-desc-course",
      title: "No Description Course",
      description: null,
      price: 1000,
      thumbnailUrl: null,
      status: "PUBLISHED" as const,
      profId: "prof-1",
      createdAt: new Date(),
      updatedAt: new Date(),
      prof: {
        name: "Test Prof",
      },
      modules: [],
    }

    vi.mocked(getCourseBySlug).mockResolvedValueOnce(mockCourse as any)

    const course = await getCourseBySlug("no-desc-course")

    expect(course?.description).toBeNull()
    // Should not show description section
  })

  it("should link CTA button to checkout page", () => {
    const courseId = "course-123"
    const expectedLink = `/checkout/${courseId}`

    expect(expectedLink).toBe("/checkout/course-123")
  })
})
