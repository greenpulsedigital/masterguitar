import { describe, it, expect } from "vitest"
import { formatPrice } from "@/lib/format"

describe("formatPrice", () => {
  it("should format price in cents to French Euro format", () => {
    const result = formatPrice(4900)
    expect(result).toContain("49,00")
    expect(result).toContain("€")
  })

  it("should handle zero cents", () => {
    const result = formatPrice(0)
    expect(result).toContain("0,00")
    expect(result).toContain("€")
  })

  it("should handle large amounts", () => {
    const result = formatPrice(999999)
    expect(result).toContain("9")
    expect(result).toContain("999,99")
    expect(result).toContain("€")
  })

  it("should handle cents with decimals correctly", () => {
    expect(formatPrice(1050)).toContain("10,50")
    expect(formatPrice(1005)).toContain("10,05")
    expect(formatPrice(105)).toContain("1,05")
  })

  it("should handle single digit cents", () => {
    expect(formatPrice(1)).toContain("0,01")
    expect(formatPrice(10)).toContain("0,10")
  })

  it("should use comma as decimal separator (French style)", () => {
    const result = formatPrice(4900)
    expect(result).toMatch(/\d+,\d{2}/)
  })
})
