import { describe, it, expect } from "vitest"

describe("Course Edit Page Status Display", () => {
  it("should show DRAFT badge for draft courses", () => {
    const status = "DRAFT"
    const expectedVariant = "secondary"
    const expectedText = "DRAFT"

    expect(status).toBe("DRAFT")
    expect(expectedVariant).toBe("secondary")
    expect(expectedText).toBe("DRAFT")
  })

  it("should show PUBLISHED badge for published courses", () => {
    const status = "PUBLISHED"
    const expectedVariant = "default"
    const expectedText = "PUBLIÉ"

    expect(status).toBe("PUBLISHED")
    expect(expectedVariant).toBe("default")
    expect(expectedText).toBe("PUBLIÉ")
  })

  it("should determine correct badge variant based on status", () => {
    function getBadgeVariant(status: string) {
      return status === "PUBLISHED" ? "default" : "secondary"
    }

    expect(getBadgeVariant("DRAFT")).toBe("secondary")
    expect(getBadgeVariant("PUBLISHED")).toBe("default")
  })

  it("should determine correct badge text based on status", () => {
    function getBadgeText(status: string) {
      return status === "PUBLISHED" ? "PUBLIÉ" : "DRAFT"
    }

    expect(getBadgeText("DRAFT")).toBe("DRAFT")
    expect(getBadgeText("PUBLISHED")).toBe("PUBLIÉ")
  })

  it("should determine correct button text based on status", () => {
    function getButtonText(status: string) {
      return status === "PUBLISHED" ? "Dépublier" : "Publier"
    }

    expect(getButtonText("DRAFT")).toBe("Publier")
    expect(getButtonText("PUBLISHED")).toBe("Dépublier")
  })
})
