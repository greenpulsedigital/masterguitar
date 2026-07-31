import { describe, it, expect, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import { CourseForm } from "@/components/course-form"

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: vi.fn(() => ({
    push: vi.fn(),
  })),
}))

describe("CourseForm", () => {
  it("should render empty form for course creation", () => {
    const mockAction = vi.fn()

    render(<CourseForm action={mockAction} />)

    // Check for form fields
    expect(screen.getByLabelText(/titre/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/prix/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/image/i)).toBeInTheDocument()
  })

  it("should render prefilled form for course editing", () => {
    const mockAction = vi.fn()
    const mockCourse = {
      id: "1",
      slug: "test-course",
      title: "Test Course",
      description: "Test Description",
      price: 4999, // in cents
      thumbnailUrl: "https://example.com/image.jpg",
      status: "DRAFT" as const,
      profId: "prof-1",
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    render(<CourseForm course={mockCourse} action={mockAction} />)

    // Check for prefilled values
    const titleInput = screen.getByLabelText(/titre/i) as HTMLInputElement
    expect(titleInput.value).toBe("Test Course")

    const descriptionInput = screen.getByLabelText(/description/i) as HTMLTextAreaElement
    expect(descriptionInput.value).toBe("Test Description")

    const priceInput = screen.getByLabelText(/prix/i) as HTMLInputElement
    expect(priceInput.value).toBe("49.99")
  })
})
