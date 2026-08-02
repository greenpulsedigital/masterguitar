import { describe, it, expect, vi, beforeEach } from "vitest"

// Mock dependencies
vi.mock("@/lib/auth", () => ({
  auth: vi.fn(() => Promise.resolve(null)),
}))

vi.mock("@/lib/prisma", () => ({
  prisma: {
    course: {
      findUnique: vi.fn(),
    },
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

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { stripe } from "@/lib/stripe"
import { createCheckoutSession } from "@/app/checkout/actions"

describe("createCheckoutSession", () => {
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

  it("should create checkout session for authenticated user with valid course", async () => {
    vi.mocked(auth).mockResolvedValue(mockUser as any)
    vi.mocked(prisma.course.findUnique).mockResolvedValue(mockCourse as any)
    vi.mocked(prisma.purchase.findFirst).mockResolvedValue(null) // No existing purchase
    vi.mocked(stripe.checkout.sessions.create).mockResolvedValue({
      url: "https://checkout.stripe.com/session_123",
    } as any)

    const result = await createCheckoutSession("course-1")

    expect(result).toEqual({
      url: "https://checkout.stripe.com/session_123",
    })

    expect(stripe.checkout.sessions.create).toHaveBeenCalledWith({
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: {
              name: "Test Course",
            },
            unit_amount: 5000,
          },
          quantity: 1,
        },
      ],
      metadata: {
        courseId: "course-1",
        userId: "user-1",
      },
      success_url: expect.stringContaining("/checkout/success?session_id="),
      cancel_url: expect.stringContaining("/cours/test-course"),
    })
  })

  it("should return error when user is not authenticated", async () => {
    vi.mocked(auth).mockResolvedValue(null as any)

    const result = await createCheckoutSession("course-1")

    expect(result).toEqual({
      error: "Vous devez être connecté pour effectuer un achat",
    })
    expect(stripe.checkout.sessions.create).not.toHaveBeenCalled()
  })

  it("should return error when course not found", async () => {
    vi.mocked(auth).mockResolvedValue(mockUser as any)
    vi.mocked(prisma.course.findUnique).mockResolvedValue(null)

    const result = await createCheckoutSession("non-existent")

    expect(result).toEqual({
      error: "Cours introuvable",
    })
    expect(stripe.checkout.sessions.create).not.toHaveBeenCalled()
  })

  it("should return error when course is not published", async () => {
    vi.mocked(auth).mockResolvedValue(mockUser as any)
    vi.mocked(prisma.course.findUnique).mockResolvedValue({
      ...mockCourse,
      status: "DRAFT" as const,
    } as any)

    const result = await createCheckoutSession("course-1")

    expect(result).toEqual({
      error: "Ce cours n'est pas disponible à l'achat",
    })
    expect(stripe.checkout.sessions.create).not.toHaveBeenCalled()
  })

  it("should return error when user already owns the course", async () => {
    vi.mocked(auth).mockResolvedValue(mockUser as any)
    vi.mocked(prisma.course.findUnique).mockResolvedValue(mockCourse as any)
    vi.mocked(prisma.purchase.findFirst).mockResolvedValue({
      id: "purchase-1",
      userId: "user-1",
      courseId: "course-1",
      amount: 5000,
      stripePaymentId: "pi_123",
      stripeSessionId: "cs_123",
      createdAt: new Date(),
    } as any)

    const result = await createCheckoutSession("course-1")

    expect(result).toEqual({
      error: "Vous possédez déjà ce cours",
    })
    expect(stripe.checkout.sessions.create).not.toHaveBeenCalled()
  })

  it("should handle Stripe errors gracefully", async () => {
    vi.mocked(auth).mockResolvedValue(mockUser as any)
    vi.mocked(prisma.course.findUnique).mockResolvedValue(mockCourse as any)
    vi.mocked(prisma.purchase.findFirst).mockResolvedValue(null)
    vi.mocked(stripe.checkout.sessions.create).mockRejectedValue(
      new Error("Stripe API error")
    )

    const result = await createCheckoutSession("course-1")

    expect(result).toEqual({
      error: "Erreur lors de la création de la session de paiement",
    })
  })
})
