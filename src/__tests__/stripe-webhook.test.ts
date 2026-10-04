import { describe, it, expect, vi, beforeEach } from "vitest"
import { NextRequest } from "next/server"

// Mock dependencies
vi.mock("@/lib/stripe", () => ({
  stripe: {
    webhooks: {
      constructEvent: vi.fn(),
    },
    refunds: {
      create: vi.fn(),
    },
  },
}))

vi.mock("@/lib/prisma", () => ({
  prisma: {
    course: { findUnique: vi.fn() },
    user: { findUnique: vi.fn() },
    purchase: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
    paymentIssue: {
      upsert: vi.fn(),
    },
  },
}))

import { stripe } from "@/lib/stripe"
import { prisma } from "@/lib/prisma"
import { POST } from "@/app/api/webhooks/stripe/route"

type CourseResult = Awaited<ReturnType<typeof prisma.course.findUnique>>
type UserResult = Awaited<ReturnType<typeof prisma.user.findUnique>>
type PurchaseResult = Awaited<ReturnType<typeof prisma.purchase.findUnique>>
type PurchaseCreateResult = Awaited<ReturnType<typeof prisma.purchase.create>>
type PaymentIssueResult = Awaited<ReturnType<typeof prisma.paymentIssue.upsert>>
type StripeEvent = ReturnType<typeof stripe.webhooks.constructEvent>

describe("Stripe Webhook Handler", () => {
  const mockSession = {
    id: "cs_test_123",
    payment_intent: "pi_test_123",
    payment_status: "paid",
    currency: "eur",
    amount_total: 5000,
    metadata: {
      courseId: "course-1",
      userId: "user-1",
    },
  }

  beforeEach(() => {
    vi.clearAllMocks()
    process.env.STRIPE_WEBHOOK_SECRET = "whsec_test_secret"
    vi.mocked(prisma.course.findUnique).mockResolvedValue({ id: "course-1" } as unknown as CourseResult)
    vi.mocked(prisma.user.findUnique).mockResolvedValue({ id: "user-1" } as unknown as UserResult)
  })

  async function send(object: Record<string, unknown>, type = "checkout.session.completed") {
    const event = { type, data: { object } }
    vi.mocked(stripe.webhooks.constructEvent).mockReturnValue(event as unknown as StripeEvent)
    vi.mocked(prisma.purchase.findUnique).mockResolvedValue(null)
    vi.mocked(prisma.purchase.create).mockResolvedValue({} as unknown as PurchaseCreateResult)

    return POST(
      new NextRequest("http://localhost:3000/api/webhooks/stripe", {
        method: "POST",
        headers: { "stripe-signature": "test-signature" },
        body: JSON.stringify(event),
      })
    )
  }

  describe("payment confirmation and data checks", () => {
    it("ignores an unpaid session (delayed payment method)", async () => {
      const response = await send({ ...mockSession, payment_status: "unpaid" })

      expect(response.status).toBe(200)
      expect(prisma.purchase.create).not.toHaveBeenCalled()
    })

    it("creates the purchase when a delayed payment finally succeeds", async () => {
      const response = await send(mockSession, "checkout.session.async_payment_succeeded")

      expect(response.status).toBe(200)
      expect(prisma.purchase.create).toHaveBeenCalledTimes(1)
    })

    it("accepts an expanded payment_intent object", async () => {
      await send({ ...mockSession, payment_intent: { id: "pi_expanded" } })

      expect(prisma.purchase.create).toHaveBeenCalledWith({
        data: expect.objectContaining({ stripePaymentId: "pi_expanded" }),
      })
    })

    it("rejects a paid session without payment_intent", async () => {
      const response = await send({ ...mockSession, payment_intent: null })

      expect(response.status).toBe(400)
      expect(prisma.purchase.create).not.toHaveBeenCalled()
    })

    it("rejects a zero amount", async () => {
      const response = await send({ ...mockSession, amount_total: 0 })

      expect(response.status).toBe(400)
      expect(prisma.purchase.create).not.toHaveBeenCalled()
    })

    it("rejects an unexpected currency", async () => {
      const response = await send({ ...mockSession, currency: "usd" })

      expect(response.status).toBe(400)
      expect(prisma.purchase.create).not.toHaveBeenCalled()
    })

    it("rejects an unknown course", async () => {
      vi.mocked(prisma.course.findUnique).mockResolvedValue(null)

      const response = await send(mockSession)

      expect(response.status).toBe(400)
      expect(prisma.purchase.create).not.toHaveBeenCalled()
    })

    it("rejects an unknown user", async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue(null)

      const response = await send(mockSession)

      expect(response.status).toBe(400)
      expect(prisma.purchase.create).not.toHaveBeenCalled()
    })

    it("treats a unique violation as a concurrent replay when the session purchase now exists", async () => {
      const event = { type: "checkout.session.completed", data: { object: mockSession } }
      const consoleError = vi.spyOn(console, "error")
      vi.mocked(stripe.webhooks.constructEvent).mockReturnValue(event as unknown as StripeEvent)
      vi.mocked(prisma.purchase.findUnique)
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce({ stripeSessionId: mockSession.id } as unknown as PurchaseResult)
      vi.mocked(prisma.purchase.create).mockRejectedValue(
        Object.assign(new Error("Unique constraint failed"), { code: "P2002" })
      )

      const response = await POST(
        new NextRequest("http://localhost:3000/api/webhooks/stripe", {
          method: "POST",
          headers: { "stripe-signature": "test-signature" },
          body: JSON.stringify(event),
        })
      )

      expect(response.status).toBe(200)
      expect(prisma.paymentIssue.upsert).not.toHaveBeenCalled()
      expect(consoleError).not.toHaveBeenCalled()
      consoleError.mockRestore()
    })

    it("records and alerts a real duplicate payment when the session purchase does not exist", async () => {
      const event = { type: "checkout.session.completed", data: { object: mockSession } }
      const consoleError = vi.spyOn(console, "error").mockImplementation(() => {})
      vi.mocked(stripe.webhooks.constructEvent).mockReturnValue(event as unknown as StripeEvent)
      vi.mocked(prisma.purchase.findUnique).mockResolvedValue(null)
      vi.mocked(prisma.purchase.create).mockRejectedValue(
        Object.assign(new Error("Unique constraint failed"), { code: "P2002" })
      )
      vi.mocked(prisma.paymentIssue.upsert).mockResolvedValue({} as unknown as PaymentIssueResult)

      const response = await POST(
        new NextRequest("http://localhost:3000/api/webhooks/stripe", {
          method: "POST",
          headers: { "stripe-signature": "test-signature" },
          body: JSON.stringify(event),
        })
      )

      expect(response.status).toBe(200)
      expect(prisma.paymentIssue.upsert).toHaveBeenCalledWith({
        where: { stripeSessionId: "cs_test_123" },
        create: {
          type: "DUPLICATE_PURCHASE",
          stripeSessionId: "cs_test_123",
          stripePaymentId: "pi_test_123",
          amount: 5000,
          userId: "user-1",
          courseId: "course-1",
        },
        update: {},
      })
      expect(consoleError).toHaveBeenCalledWith(
        "[PAYMENT_ALERT]",
        {
          sessionId: "cs_test_123",
          paymentIntentId: "pi_test_123",
          userId: "user-1",
          courseId: "course-1",
          amount: 5000,
        },
        "remboursement manuel requis"
      )
      expect(stripe.refunds.create).not.toHaveBeenCalled()
      consoleError.mockRestore()
    })

    it("returns 500 when recording a real duplicate payment fails", async () => {
      const event = { type: "checkout.session.completed", data: { object: mockSession } }
      vi.mocked(stripe.webhooks.constructEvent).mockReturnValue(event as unknown as StripeEvent)
      vi.mocked(prisma.purchase.findUnique).mockResolvedValue(null)
      vi.mocked(prisma.purchase.create).mockRejectedValue(
        Object.assign(new Error("Unique constraint failed"), { code: "P2002" })
      )
      vi.mocked(prisma.paymentIssue.upsert).mockRejectedValue(new Error("Payment issue error"))

      const response = await POST(
        new NextRequest("http://localhost:3000/api/webhooks/stripe", {
          method: "POST",
          headers: { "stripe-signature": "test-signature" },
          body: JSON.stringify(event),
        })
      )

      expect(response.status).toBe(500)
      expect(stripe.refunds.create).not.toHaveBeenCalled()
    })

    it("passes the raw body and the webhook secret to constructEvent", async () => {
      await send(mockSession)

      const [body, signature, secret] = vi.mocked(stripe.webhooks.constructEvent).mock.calls[0]
      expect(typeof body).toBe("string")
      expect(JSON.parse(body as string).data.object.id).toBe("cs_test_123")
      expect(signature).toBe("test-signature")
      expect(secret).toBe("whsec_test_secret")
    })
  })

  it("should create a purchase on checkout.session.completed event", async () => {
    const mockEvent = {
      type: "checkout.session.completed",
      data: {
        object: mockSession,
      },
    }

    vi.mocked(stripe.webhooks.constructEvent).mockReturnValue(mockEvent as unknown as StripeEvent)
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

    vi.mocked(stripe.webhooks.constructEvent).mockReturnValue(mockEvent as unknown as StripeEvent)
    vi.mocked(prisma.purchase.findUnique).mockResolvedValue({
      id: "purchase-1",
      amount: 5000,
      stripePaymentId: "pi_test_123",
      stripeSessionId: "cs_test_123",
      userId: "user-1",
      courseId: "course-1",
      createdAt: new Date(),
    } as unknown as PurchaseResult)

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

    vi.mocked(stripe.webhooks.constructEvent).mockReturnValue(mockEvent as unknown as StripeEvent)

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

    vi.mocked(stripe.webhooks.constructEvent).mockReturnValue(mockEvent as unknown as StripeEvent)
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
