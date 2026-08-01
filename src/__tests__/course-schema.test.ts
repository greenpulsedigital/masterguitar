import { describe, it, expect } from "vitest"
import { readFileSync } from "fs"
import { join } from "path"

describe("Course Prisma Schema", () => {
  it("should have Course model defined in schema.prisma", () => {
    // Read the schema file
    const schemaPath = join(process.cwd(), "prisma", "schema.prisma")
    const schemaContent = readFileSync(schemaPath, "utf-8")

    // Check for Course model
    expect(schemaContent).toContain("model Course")
    expect(schemaContent).toContain("enum CourseStatus")
    expect(schemaContent).toContain("DRAFT")
    expect(schemaContent).toContain("PUBLISHED")
  })

  it("should have required Course fields in schema", () => {
    const schemaPath = join(process.cwd(), "prisma", "schema.prisma")
    const schemaContent = readFileSync(schemaPath, "utf-8")

    // Check for required fields
    expect(schemaContent).toContain("slug")
    expect(schemaContent).toContain("title")
    expect(schemaContent).toContain("price")
    expect(schemaContent).toContain("profId")
    expect(schemaContent).toContain("@@unique([profId, slug])")
  })
})
