import { prisma } from "@/lib/prisma"

/**
 * Get a published course by slug with modules and prof name
 * @param slug - Course slug
 * @returns Course with modules and prof, or null if not found or not published
 */
export async function getCourseBySlug(slug: string) {
  return prisma.course.findFirst({
    where: {
      slug,
      status: "PUBLISHED",
    },
    include: {
      modules: {
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
}

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
