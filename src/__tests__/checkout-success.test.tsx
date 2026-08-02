import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen } from "@testing-library/react"

// Mock dependencies
vi.mock("@/lib/stripe", () => ({
  stripe: {
    checkout: {
      sessions: {
        retrieve: vi.fn(),
      },
    },
  },
}))

vi.mock("next/navigation", () => ({
  redirect: vi.fn((url: string) => {
    throw new Error(`NEXT_REDIRECT:${url}`)
  }),
}))

import { stripe } from "@/lib/stripe"

describe("Checkout Success Page", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("should render success message with course info", async () => {
    const mockSession = {
      id: "cs_test_123",
      metadata: {
        courseId: "course-1",
        userId: "user-1",
      },
      amount_total: 5000,
    }

    vi.mocked(stripe.checkout.sessions.retrieve).mockResolvedValue(mockSession as any)

    const SuccessPage = (await import("@/app/checkout/success/page")).default

    const result = await SuccessPage({
      searchParams: { session_id: "cs_test_123" },
    })
    render(result as React.ReactElement)

    expect(screen.getByText(/merci pour votre achat/i)).toBeInTheDocument()
    expect(stripe.checkout.sessions.retrieve).toHaveBeenCalledWith("cs_test_123")
  })

  it("should handle already_purchased query param", async () => {
    const SuccessPage = (await import("@/app/checkout/success/page")).default

    const result = await SuccessPage({
      searchParams: { already_purchased: "true" },
    })
    render(result as React.ReactElement)

    expect(screen.getByText(/vous possédez déjà ce cours/i)).toBeInTheDocument()
  })

  it("should redirect to home if no session_id or already_purchased param", async () => {
    const SuccessPage = (await import("@/app/checkout/success/page")).default

    await expect(async () => {
      await SuccessPage({ searchParams: {} })
    }).rejects.toThrow("NEXT_REDIRECT:/")
  })

  it("should handle Stripe session retrieval error", async () => {
    vi.mocked(stripe.checkout.sessions.retrieve).mockRejectedValue(
      new Error("Session not found")
    )

    const SuccessPage = (await import("@/app/checkout/success/page")).default

    await expect(async () => {
      await SuccessPage({ searchParams: { session_id: "invalid" } })
    }).rejects.toThrow("NEXT_REDIRECT:/")
  })
})
