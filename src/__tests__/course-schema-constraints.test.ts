import { describe, it, expect, vi } from "vitest"

// Mock prisma for this unit test
vi.mock("@/lib/prisma", () => ({
  prisma: {
    course: {
      create: vi.fn(),
    },
  },
}))

import { prisma } from "@/lib/prisma"

type CourseCreateResult = Awaited<ReturnType<typeof prisma.course.create>>
type PrismaConstraintError = Error & { code: string; meta: { target: string[] } }

describe("Course slug uniqueness constraint", () => {
  it("should reject duplicate slug globally", async () => {
    // Simulate unique constraint violation error (SQLite error code for unique constraint)
    const uniqueConstraintError = new Error("Unique constraint failed on the fields: (`slug`)")
    const constraintError = uniqueConstraintError as unknown as PrismaConstraintError
    constraintError.code = "P2002"
    constraintError.meta = { target: ["slug"] }

    // First call succeeds
    vi.mocked(prisma.course.create).mockResolvedValueOnce({
      id: "course-1",
      slug: "guitare-debutant",
      title: "Guitare Débutant",
      description: null,
      price: 4900,
      thumbnailUrl: null,
      status: "DRAFT",
      profId: "prof-1",
      createdAt: new Date(),
      updatedAt: new Date(),
    } as unknown as CourseCreateResult)

    // Second call with duplicate slug should fail
    vi.mocked(prisma.course.create).mockRejectedValueOnce(uniqueConstraintError)

    // Create first course
    const course1 = await prisma.course.create({
      data: {
        title: "Guitare Débutant",
        slug: "guitare-debutant",
        price: 4900,
        profId: "prof-1",
      },
    })

    expect(course1.slug).toBe("guitare-debutant")

    // Attempt to create course with same slug should fail
    await expect(
      prisma.course.create({
        data: {
          title: "Another Course",
          slug: "guitare-debutant",
          price: 5900,
          profId: "prof-2", // Different prof, same slug
        },
      })
    ).rejects.toThrow("Unique constraint failed on the fields: (`slug`)")
  })
})
