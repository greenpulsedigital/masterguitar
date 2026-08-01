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
