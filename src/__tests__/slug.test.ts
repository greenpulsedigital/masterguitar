import { describe, it, expect } from "vitest"
import { generateSlug } from "@/lib/slug"

describe("generateSlug", () => {
  it("should convert text to lowercase", () => {
    expect(generateSlug("Hello World")).toBe("hello-world")
  })

  it("should replace spaces with hyphens", () => {
    expect(generateSlug("my awesome course")).toBe("my-awesome-course")
  })

  it("should remove special characters", () => {
    expect(generateSlug("Course #1: Introduction!")).toBe("course-1-introduction")
  })

  it("should trim leading and trailing spaces", () => {
    expect(generateSlug("  trimmed  ")).toBe("trimmed")
  })

  it("should collapse multiple hyphens into one", () => {
    expect(generateSlug("hello   world")).toBe("hello-world")
  })

  it("should strip French accents", () => {
    expect(generateSlug("Débuter la guitare électrique")).toBe("debuter-la-guitare-electrique")
  })

  it("should handle empty string", () => {
    expect(generateSlug("")).toBe("")
  })

  it("should handle string with only special characters", () => {
    expect(generateSlug("@#$%^&*()")).toBe("")
  })

  it("should remove hyphens at start and end", () => {
    expect(generateSlug("---test---")).toBe("test")
  })
})
