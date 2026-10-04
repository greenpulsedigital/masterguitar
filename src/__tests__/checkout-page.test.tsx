import { describe, it, expect, vi, beforeEach } from "vitest"
import { fireEvent, render, screen, waitFor } from "@testing-library/react"

// Mock dependencies
vi.mock("@/lib/auth", () => ({
  auth: vi.fn(() => Promise.resolve(null)),
}))

vi.mock("@/lib/queries/course", () => ({
  getCourseById: vi.fn(),
}))

vi.mock("@/lib/prisma", () => ({
  prisma: {
    purchase: {
      findFirst: vi.fn(),
    },
  },
}))

vi.mock("@/lib/stripe", () => ({
  stripe: {
    checkout: {
      sessions: {
        create: vi.fn(),
      },
    },
  },
}))

vi.mock("@/app/checkout/actions", () => ({
  createCheckoutSession: vi.fn(),
}))

vi.mock("next/navigation", () => ({
  redirect: vi.fn((url: string) => {
    throw new Error(`NEXT_REDIRECT:${url}`)
  }),
  notFound: vi.fn(() => {
    throw new Error("NEXT_NOT_FOUND")
  }),
}))

import { auth } from "@/lib/auth"
import { getCourseById } from "@/lib/queries/course"
import { prisma } from "@/lib/prisma"
import { createCheckoutSession } from "@/app/checkout/actions"
import { CheckoutButton } from "@/app/checkout/[courseId]/checkout-button"

type AuthResult = Awaited<ReturnType<typeof auth>>
type PurchaseResult = Awaited<ReturnType<typeof prisma.purchase.findFirst>>

describe("Checkout Page", () => {
  const mockUser = {
    user: {
      id: "user-1",
      email: "student@test.com",
      role: "STUDENT" as const,
    },
  }

  const mockCourse = {
    id: "course-1",
    title: "Test Course",
    slug: "test-course",
    price: 5000,
    status: "PUBLISHED" as const,
    profId: "prof-1",
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("should redirect to login if user is not authenticated", async () => {
    vi.mocked(auth).mockResolvedValue(null as unknown as AuthResult)

    const CheckoutPage = (await import("@/app/checkout/[courseId]/page")).default

    await expect(async () => {
      await CheckoutPage({ params: Promise.resolve({ courseId: "course-1" }) })
    }).rejects.toThrow("NEXT_REDIRECT:/login?callbackUrl=/checkout/course-1")
  })

  it("should return 404 if course is not found", async () => {
    vi.mocked(auth).mockResolvedValue(mockUser as unknown as AuthResult)
    vi.mocked(getCourseById).mockResolvedValue(null)

    const CheckoutPage = (await import("@/app/checkout/[courseId]/page")).default

    await expect(async () => {
      await CheckoutPage({ params: Promise.resolve({ courseId: "non-existent" }) })
    }).rejects.toThrow("NEXT_NOT_FOUND")
  })

  it("should return 404 if course is not published", async () => {
    vi.mocked(auth).mockResolvedValue(mockUser as unknown as AuthResult)
    vi.mocked(getCourseById).mockResolvedValue({
      ...mockCourse,
      status: "DRAFT" as const,
    })

    const CheckoutPage = (await import("@/app/checkout/[courseId]/page")).default

    await expect(async () => {
      await CheckoutPage({ params: Promise.resolve({ courseId: "course-1" }) })
    }).rejects.toThrow("NEXT_NOT_FOUND")
  })

  it("should redirect to success if user already owns the course", async () => {
    vi.mocked(auth).mockResolvedValue(mockUser as unknown as AuthResult)
    vi.mocked(getCourseById).mockResolvedValue(mockCourse)
    vi.mocked(prisma.purchase.findFirst).mockResolvedValue({
      id: "purchase-1",
      userId: "user-1",
      courseId: "course-1",
      amount: 5000,
      stripePaymentId: "pi_123",
      stripeSessionId: "cs_123",
      createdAt: new Date(),
    } as unknown as PurchaseResult)

    const CheckoutPage = (await import("@/app/checkout/[courseId]/page")).default

    await expect(async () => {
      await CheckoutPage({ params: Promise.resolve({ courseId: "course-1" }) })
    }).rejects.toThrow("NEXT_REDIRECT:/checkout/success?already_purchased=true")
  })

  it("should render checkout page for valid course", async () => {
    vi.mocked(auth).mockResolvedValue(mockUser as unknown as AuthResult)
    vi.mocked(getCourseById).mockResolvedValue(mockCourse)
    vi.mocked(prisma.purchase.findFirst).mockResolvedValue(null)

    const CheckoutPage = (await import("@/app/checkout/[courseId]/page")).default

    const result = await CheckoutPage({ params: Promise.resolve({ courseId: "course-1" }) })
    render(result as React.ReactElement)

    expect(screen.getByText("Test Course")).toBeInTheDocument()
    expect(screen.getByText("50,00 €")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /procéder au paiement/i })).toHaveClass("h-11")
  })

  it("should expose checkout errors as alerts", async () => {
    vi.mocked(createCheckoutSession).mockResolvedValue({
      error: "Erreur lors de la création de la session de paiement",
    })

    render(<CheckoutButton courseId="course-1" />)
    fireEvent.click(screen.getByRole("button", { name: /procéder au paiement/i }))

    const alert = await screen.findByRole("alert")
    expect(alert).toHaveTextContent("Erreur lors de la création de la session de paiement")
  })

  it("should expose the loading state with aria-busy on the payment button", async () => {
    let resolveCheckout: ((result: { error: string }) => void) | undefined
    vi.mocked(createCheckoutSession).mockReturnValue(
      new Promise<{ error: string }>((resolve) => {
        resolveCheckout = resolve
      })
    )

    render(<CheckoutButton courseId="course-1" />)
    const button = screen.getByRole("button", { name: /procéder au paiement/i })
    fireEvent.click(button)

    await waitFor(() => expect(button).toHaveAttribute("aria-busy", "true"))

    resolveCheckout?.({ error: "Erreur lors de la création de la session de paiement" })
    await waitFor(() => expect(button).toHaveAttribute("aria-busy", "false"))
  })
})
