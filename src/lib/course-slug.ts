import { prisma } from "@/lib/prisma"
import { generateSlug } from "@/lib/slug"

const FALLBACK_SLUG = "cours"

/**
 * Generate a globally unique course slug from a title (ADR 006).
 * Falls back to "cours" when the title yields an empty slug,
 * and appends -2, -3, ... on collision.
 */
export async function generateUniqueSlug(title: string): Promise<string> {
  const base = generateSlug(title) || FALLBACK_SLUG
  let candidate = base
  let suffix = 2

  while (await prisma.course.findUnique({ where: { slug: candidate } })) {
    candidate = `${base}-${suffix}`
    suffix++
  }

  return candidate
}
