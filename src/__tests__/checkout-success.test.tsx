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

vi.mock("@/lib/auth", () => ({ auth: vi.fn() }))

vi.mock("@/lib/queries/course", () => ({ getCourseById: vi.fn() }))

import { auth } from "@/lib/auth"
import { getCourseById } from "@/lib/queries/course"
import { stripe } from "@/lib/stripe"

describe("Checkout Success Page", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(auth).mockResolvedValue({ user: { id: "user-1" } } as any)
    vi.mocked(getCourseById).mockResolvedValue({ id: "course-1", title: "Guitare Débutant" } as any)
  })

  it("should render success message with course info", async () => {
    const mockSession = {
      id: "cs_test_123",
      payment_status: "paid",
      metadata: {
        courseId: "course-1",
        userId: "user-1",
      },
      amount_total: 5000,
    }

    vi.mocked(stripe.checkout.sessions.retrieve).mockResolvedValue(mockSession as any)

    const SuccessPage = (await import("@/app/checkout/success/page")).default

    const result = await SuccessPage({
      searchParams: Promise.resolve({ session_id: "cs_test_123" }),
    })
    render(result as React.ReactElement)

    expect(screen.getByText(/merci pour votre achat/i)).toBeInTheDocument()
    expect(screen.getByText(/Guitare Débutant/)).toBeInTheDocument()
    expect(stripe.checkout.sessions.retrieve).toHaveBeenCalledWith("cs_test_123")
  })

  it("should not confirm an unpaid session", async () => {
    vi.mocked(stripe.checkout.sessions.retrieve).mockResolvedValue({
      id: "cs_test_123",
      payment_status: "unpaid",
      metadata: { courseId: "course-1", userId: "user-1" },
    } as any)

    const SuccessPage = (await import("@/app/checkout/success/page")).default
    render((await SuccessPage({ searchParams: Promise.resolve({ session_id: "cs_test_123" }) })) as React.ReactElement)

    expect(screen.getByText(/paiement en attente/i)).toBeInTheDocument()
    expect(screen.getByText(/Guitare Débutant/)).toBeInTheDocument()
    expect(screen.getByRole("link", { name: /retour à l'accueil/i })).toHaveClass("h-11")
    expect(screen.queryByText(/merci pour votre achat/i)).not.toBeInTheDocument()
  })

  it("should redirect when the session belongs to another user", async () => {
    vi.mocked(stripe.checkout.sessions.retrieve).mockResolvedValue({
      id: "cs_test_123",
      payment_status: "paid",
      metadata: { courseId: "course-1", userId: "someone-else" },
    } as any)

    const SuccessPage = (await import("@/app/checkout/success/page")).default

    await expect(
      SuccessPage({ searchParams: Promise.resolve({ session_id: "cs_test_123" }) })
    ).rejects.toThrow("NEXT_REDIRECT:/")
  })

  it("should redirect to login when not authenticated", async () => {
    vi.mocked(auth).mockResolvedValue(null as any)

    const SuccessPage = (await import("@/app/checkout/success/page")).default

    await expect(
      SuccessPage({ searchParams: Promise.resolve({ session_id: "cs_test_123" }) })
    ).rejects.toThrow("NEXT_REDIRECT:/login")
    expect(stripe.checkout.sessions.retrieve).not.toHaveBeenCalled()
  })

  it("should handle already_purchased query param", async () => {
    const SuccessPage = (await import("@/app/checkout/success/page")).default

    const result = await SuccessPage({
      searchParams: Promise.resolve({ already_purchased: "true" }),
    })
    render(result as React.ReactElement)

    expect(screen.getByText(/vous possédez déjà ce cours/i)).toBeInTheDocument()
  })

  it("should redirect to home if no session_id or already_purchased param", async () => {
    const SuccessPage = (await import("@/app/checkout/success/page")).default

    await expect(async () => {
      await SuccessPage({ searchParams: Promise.resolve({}) })
    }).rejects.toThrow("NEXT_REDIRECT:/")
  })

  it("should handle Stripe session retrieval error", async () => {
    vi.mocked(stripe.checkout.sessions.retrieve).mockRejectedValue(
      new Error("Session not found")
    )

    const SuccessPage = (await import("@/app/checkout/success/page")).default

    await expect(async () => {
      await SuccessPage({ searchParams: Promise.resolve({ session_id: "invalid" }) })
    }).rejects.toThrow("NEXT_REDIRECT:/")
  })
})
