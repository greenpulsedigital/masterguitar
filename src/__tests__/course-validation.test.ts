import { describe, it, expect } from "vitest"
import { z } from "zod"

// Schema that will be used in actions.ts
const courseSchema = z.object({
  title: z.string().min(1, "Le titre est requis"),
  description: z.string().optional(),
  price: z.number().min(0, "Le prix doit être positif ou nul"),
  thumbnailUrl: z.string().url().optional().or(z.literal("")),
})

describe("Course validation schema", () => {
  it("should validate valid course data", () => {
    const validData = {
      title: "Débuter la guitare",
      description: "Un cours pour débutants",
      price: 4999,
      thumbnailUrl: "https://example.com/image.jpg",
    }

    const result = courseSchema.safeParse(validData)
    expect(result.success).toBe(true)
  })

  it("should reject course without title", () => {
    const invalidData = {
      title: "",
      price: 4999,
    }

    const result = courseSchema.safeParse(invalidData)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("Le titre est requis")
    }
  })

  it("should reject course with negative price", () => {
    const invalidData = {
      title: "Test Course",
      price: -100,
    }

    const result = courseSchema.safeParse(invalidData)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("Le prix doit être positif ou nul")
    }
  })

  it("should accept course with price 0 (free)", () => {
    const validData = {
      title: "Free Course",
      price: 0,
    }

    const result = courseSchema.safeParse(validData)
    expect(result.success).toBe(true)
  })

  it("should accept course without description", () => {
    const validData = {
      title: "Test Course",
      price: 1000,
    }

    const result = courseSchema.safeParse(validData)
    expect(result.success).toBe(true)
  })

  it("should accept empty string for thumbnailUrl", () => {
    const validData = {
      title: "Test Course",
      price: 1000,
      thumbnailUrl: "",
    }

    const result = courseSchema.safeParse(validData)
    expect(result.success).toBe(true)
  })

  it("should reject invalid URL for thumbnailUrl", () => {
    const invalidData = {
      title: "Test Course",
      price: 1000,
      thumbnailUrl: "not-a-url",
    }

    const result = courseSchema.safeParse(invalidData)
    expect(result.success).toBe(false)
  })
})
