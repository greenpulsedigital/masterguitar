import { describe, it, expect, vi, beforeEach } from "vitest"
import { NextRequest } from "next/server"

// Mock dependencies
vi.mock("@/lib/stripe", () => ({
  stripe: {
    webhooks: {
      constructEvent: vi.fn(),
    },
  },
}))

vi.mock("@/lib/prisma", () => ({
  prisma: {
    purchase: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
  },
}))

import { stripe } from "@/lib/stripe"
import { prisma } from "@/lib/prisma"
import { POST } from "@/app/api/webhooks/stripe/route"

describe("Stripe Webhook Handler", () => {
  const mockSession = {
    id: "cs_test_123",
    payment_intent: "pi_test_123",
    amount_total: 5000,
    metadata: {
      courseId: "course-1",
      userId: "user-1",
    },
  }

  beforeEach(() => {
    vi.clearAllMocks()
    process.env.STRIPE_WEBHOOK_SECRET = "whsec_test_secret"
  })

  it("should create a purchase on checkout.session.completed event", async () => {
    const mockEvent = {
      type: "checkout.session.completed",
      data: {
        object: mockSession,
      },
    }

    vi.mocked(stripe.webhooks.constructEvent).mockReturnValue(mockEvent as any)
    vi.mocked(prisma.purchase.findUnique).mockResolvedValue(null)
    vi.mocked(prisma.purchase.create).mockResolvedValue({
      id: "purchase-1",
      amount: 5000,
      stripePaymentId: "pi_test_123",
      stripeSessionId: "cs_test_123",
      userId: "user-1",
      courseId: "course-1",
      createdAt: new Date(),
    } as any)

    const request = new NextRequest("http://localhost:3000/api/webhooks/stripe", {
      method: "POST",
      headers: {
        "stripe-signature": "test-signature",
      },
      body: JSON.stringify(mockEvent),
    })

    const response = await POST(request)

    expect(response.status).toBe(200)
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

  it("should be idempotent - skip if purchase already exists", async () => {
    const mockEvent = {
      type: "checkout.session.completed",
      data: {
        object: mockSession,
      },
    }

    vi.mocked(stripe.webhooks.constructEvent).mockReturnValue(mockEvent as any)
    vi.mocked(prisma.purchase.findUnique).mockResolvedValue({
      id: "purchase-1",
      amount: 5000,
      stripePaymentId: "pi_test_123",
      stripeSessionId: "cs_test_123",
      userId: "user-1",
      courseId: "course-1",
      createdAt: new Date(),
    } as any)

    const request = new NextRequest("http://localhost:3000/api/webhooks/stripe", {
      method: "POST",
      headers: {
        "stripe-signature": "test-signature",
      },
      body: JSON.stringify(mockEvent),
    })

    const response = await POST(request)

    expect(response.status).toBe(200)
    expect(prisma.purchase.create).not.toHaveBeenCalled()
  })

  it("should return 400 on invalid signature", async () => {
    vi.mocked(stripe.webhooks.constructEvent).mockImplementation(() => {
      throw new Error("Invalid signature")
    })

    const request = new NextRequest("http://localhost:3000/api/webhooks/stripe", {
      method: "POST",
      headers: {
        "stripe-signature": "invalid-signature",
      },
      body: JSON.stringify({}),
    })

    const response = await POST(request)

    expect(response.status).toBe(400)
    expect(prisma.purchase.create).not.toHaveBeenCalled()
  })

  it("should return 200 for unhandled event types", async () => {
    const mockEvent = {
      type: "payment_intent.succeeded",
      data: {
        object: {},
      },
    }

    vi.mocked(stripe.webhooks.constructEvent).mockReturnValue(mockEvent as any)

    const request = new NextRequest("http://localhost:3000/api/webhooks/stripe", {
      method: "POST",
      headers: {
        "stripe-signature": "test-signature",
      },
      body: JSON.stringify(mockEvent),
    })

    const response = await POST(request)

    expect(response.status).toBe(200)
    expect(prisma.purchase.create).not.toHaveBeenCalled()
  })

  it("should return 500 on database error", async () => {
    const mockEvent = {
      type: "checkout.session.completed",
      data: {
        object: mockSession,
      },
    }

    vi.mocked(stripe.webhooks.constructEvent).mockReturnValue(mockEvent as any)
    vi.mocked(prisma.purchase.findUnique).mockResolvedValue(null)
    vi.mocked(prisma.purchase.create).mockRejectedValue(new Error("Database error"))

    const request = new NextRequest("http://localhost:3000/api/webhooks/stripe", {
      method: "POST",
      headers: {
        "stripe-signature": "test-signature",
      },
      body: JSON.stringify(mockEvent),
    })

    const response = await POST(request)

    expect(response.status).toBe(500)
  })
})
