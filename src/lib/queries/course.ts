import { cache } from "react"
import { prisma } from "@/lib/prisma"

/**
 * Get a published course by slug with modules and prof name.
 * Public page: only whitelisted fields are selected (no profId, no lessons/videoUrl).
 * Memoized per request so generateMetadata and the page share a single query.
 * @param slug - Course slug
 * @returns Course with modules and prof, or null if not found or not published
 */
export const getCourseBySlug = cache(async (slug: string) => {
  return prisma.course.findFirst({
    where: {
      slug,
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
        select: {
          id: true,
          title: true,
          order: true,
        },
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

/**
 * Get a course by ID (for checkout validation)
 * @param id - Course ID
 * @returns Course with basic info, or null if not found
 */
export async function getCourseById(id: string) {
  return prisma.course.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      slug: true,
      price: true,
      status: true,
      profId: true,
    },
  })
}
