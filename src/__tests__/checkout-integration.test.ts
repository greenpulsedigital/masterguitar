import { describe, it, expect, vi, beforeEach } from "vitest"

// Mock all dependencies
vi.mock("@/lib/auth", () => ({
  auth: vi.fn(() => Promise.resolve(null)),
}))

vi.mock("@/lib/prisma", () => ({
  prisma: {
    course: {
      findUnique: vi.fn(),
    },
    user: {
      findUnique: vi.fn(),
    },
    purchase: {
      findFirst: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
    },
    paymentIssue: {
      upsert: vi.fn(),
    },
  },
}))

vi.mock("@/lib/stripe", () => ({
  stripe: {
    checkout: {
      sessions: {
        create: vi.fn(),
        retrieve: vi.fn(),
      },
    },
    webhooks: {
      constructEvent: vi.fn(),
    },
  },
}))

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { stripe } from "@/lib/stripe"
import { createCheckoutSession } from "@/app/checkout/actions"
import { POST as webhookHandler } from "@/app/api/webhooks/stripe/route"
import { NextRequest } from "next/server"

type AuthResult = Awaited<ReturnType<typeof auth>>
type CourseResult = Awaited<ReturnType<typeof prisma.course.findUnique>>
type UserResult = Awaited<ReturnType<typeof prisma.user.findUnique>>
type PurchaseResult = Awaited<ReturnType<typeof prisma.purchase.findFirst>>
type PurchaseFindUniqueResult = Awaited<ReturnType<typeof prisma.purchase.findUnique>>
type PurchaseCreateResult = Awaited<ReturnType<typeof prisma.purchase.create>>
type CheckoutCreateResult = Awaited<ReturnType<typeof stripe.checkout.sessions.create>>
type StripeEvent = ReturnType<typeof stripe.webhooks.constructEvent>

describe("Checkout Integration Flow", () => {
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
    process.env.STRIPE_WEBHOOK_SECRET = "whsec_test_secret"
  })

  it("should complete full checkout flow from session creation to purchase record", async () => {
    // Step 1: Create checkout session
    vi.mocked(auth).mockResolvedValue(mockUser as unknown as AuthResult)
    vi.mocked(prisma.course.findUnique).mockResolvedValue(mockCourse as unknown as CourseResult)
    vi.mocked(prisma.purchase.findFirst).mockResolvedValue(null)
    vi.mocked(stripe.checkout.sessions.create).mockResolvedValue({
      id: "cs_test_123",
      url: "https://checkout.stripe.com/session_123",
      payment_intent: "pi_test_123",
    } as unknown as CheckoutCreateResult)

    const sessionResult = await createCheckoutSession("course-1")

    expect(sessionResult).toEqual({
      url: "https://checkout.stripe.com/session_123",
    })
    expect(stripe.checkout.sessions.create).toHaveBeenCalledWith(
      expect.objectContaining({
        mode: "payment",
        metadata: {
          courseId: "course-1",
          userId: "user-1",
        },
      })
    )

    // Step 2: Webhook receives checkout.session.completed
    const webhookEvent = {
      type: "checkout.session.completed",
      data: {
        object: {
          id: "cs_test_123",
          payment_intent: "pi_test_123",
          payment_status: "paid",
          currency: "eur",
          amount_total: 5000,
          metadata: {
            courseId: "course-1",
            userId: "user-1",
          },
        },
      },
    }

    vi.mocked(stripe.webhooks.constructEvent).mockReturnValue(webhookEvent as unknown as StripeEvent)
    vi.mocked(prisma.user.findUnique).mockResolvedValue({ id: "user-1" } as unknown as UserResult)
    vi.mocked(prisma.purchase.findUnique).mockResolvedValue(null)
    vi.mocked(prisma.purchase.create).mockResolvedValue({
      id: "purchase-1",
      amount: 5000,
      stripePaymentId: "pi_test_123",
      stripeSessionId: "cs_test_123",
      userId: "user-1",
      courseId: "course-1",
      createdAt: new Date(),
    } as unknown as PurchaseCreateResult)

    const request = new NextRequest("http://localhost:3000/api/webhooks/stripe", {
      method: "POST",
      headers: {
        "stripe-signature": "test-signature",
      },
      body: JSON.stringify(webhookEvent),
    })

    const webhookResponse = await webhookHandler(request)

    expect(webhookResponse.status).toBe(200)
    expect(prisma.purchase.create).toHaveBeenCalledWith({
      data: {
        amount: 5000,
        stripePaymentId: "pi_test_123",
        stripeSessionId: "cs_test_123",
        userId: "user-1",
        courseId: "course-1",
      },
    })
  })

  it("should prevent duplicate purchases throughout the flow", async () => {
    // User tries to checkout for a course they already own
    vi.mocked(auth).mockResolvedValue(mockUser as unknown as AuthResult)
    vi.mocked(prisma.course.findUnique).mockResolvedValue(mockCourse as unknown as CourseResult)
    vi.mocked(prisma.purchase.findFirst).mockResolvedValue({
      id: "purchase-1",
      userId: "user-1",
      courseId: "course-1",
      amount: 5000,
      stripePaymentId: "pi_existing",
      stripeSessionId: "cs_existing",
      createdAt: new Date(),
    } as unknown as PurchaseResult)

    const result = await createCheckoutSession("course-1")

    expect(result).toEqual({
      error: "Vous possédez déjà ce cours",
    })
    expect(stripe.checkout.sessions.create).not.toHaveBeenCalled()
  })

  it("should handle webhook idempotency for duplicate events", async () => {
    // Webhook receives same event twice
    const webhookEvent = {
      type: "checkout.session.completed",
      data: {
        object: {
          id: "cs_test_123",
          payment_intent: "pi_test_123",
          amount_total: 5000,
          metadata: {
            courseId: "course-1",
            userId: "user-1",
          },
        },
      },
    }

    vi.mocked(stripe.webhooks.constructEvent).mockReturnValue(webhookEvent as unknown as StripeEvent)
    vi.mocked(prisma.purchase.findUnique).mockResolvedValue({
      id: "purchase-1",
      amount: 5000,
      stripePaymentId: "pi_test_123",
      stripeSessionId: "cs_test_123",
      userId: "user-1",
      courseId: "course-1",
      createdAt: new Date(),
    } as unknown as PurchaseFindUniqueResult)

    const request = new NextRequest("http://localhost:3000/api/webhooks/stripe", {
      method: "POST",
      headers: {
        "stripe-signature": "test-signature",
      },
      body: JSON.stringify(webhookEvent),
    })

    const response = await webhookHandler(request)

    expect(response.status).toBe(200)
    expect(prisma.purchase.create).not.toHaveBeenCalled()
  })

  it("should enforce course must be PUBLISHED for checkout", async () => {
    vi.mocked(auth).mockResolvedValue(mockUser as unknown as AuthResult)
    vi.mocked(prisma.course.findUnique).mockResolvedValue({
      ...mockCourse,
      status: "DRAFT" as const,
    } as unknown as CourseResult)

    const result = await createCheckoutSession("course-1")

    expect(result).toEqual({
      error: "Ce cours n'est pas disponible à l'achat",
    })
    expect(stripe.checkout.sessions.create).not.toHaveBeenCalled()
  })

  it("should require authentication for checkout", async () => {
    vi.mocked(auth).mockResolvedValue(null as unknown as AuthResult)

    const result = await createCheckoutSession("course-1")

    expect(result).toEqual({
      error: "Vous devez être connecté pour effectuer un achat",
    })
    expect(stripe.checkout.sessions.create).not.toHaveBeenCalled()
  })
})
