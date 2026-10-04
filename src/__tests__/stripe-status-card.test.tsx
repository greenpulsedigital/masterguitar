import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"
import { StripeStatusCard } from "@/components/stripe-status-card"

describe("StripeStatusCard", () => {
  it.each([
    [{ status: "NOT_CONFIGURED" } as const, "À configurer"],
    [{ status: "ACTIVE", mode: "TEST", keyLast4: "1234", reconcileUntil: null } as const, "Connecté"],
    [{ status: "INVALID", mode: "TEST", keyLast4: "1234", reconcileUntil: null } as const, "Clé à remplacer"],
    [{ status: "DISCONNECTING", mode: "TEST", keyLast4: "1234", reconcileUntil: new Date() } as const, "Déconnexion en cours"],
  ])("shows the functional status %#", (status, label) => {
    render(<StripeStatusCard status={status} />)

    expect(screen.getByRole("heading", { name: "Paiements Stripe" })).toBeInTheDocument()
    expect(screen.getByText(label)).toBeInTheDocument()
  })

  it("always links to the payment settings", () => {
    render(<StripeStatusCard status={{ status: "NOT_CONFIGURED" }} />)

    const link = screen.getByRole("link", { name: "Configurer les paiements" })
    expect(link).toHaveAttribute("href", "/dashboard/settings/payments")
    expect(link.className).toContain("min-h-11")
  })

  it("shows the mode only when the account is connected", () => {
    const { rerender } = render(
      <StripeStatusCard status={{ status: "ACTIVE", mode: "LIVE", keyLast4: "1234", reconcileUntil: null }} />
    )
    expect(screen.getByText("LIVE")).toBeInTheDocument()

    rerender(
      <StripeStatusCard status={{ status: "INVALID", mode: "LIVE", keyLast4: "1234", reconcileUntil: null }} />
    )
    expect(screen.queryByText("LIVE")).not.toBeInTheDocument()

    rerender(<StripeStatusCard status={{ status: "NOT_CONFIGURED" }} />)
    expect(screen.queryByText("TEST")).not.toBeInTheDocument()
  })

  it("shows an unavailable status without any detail when the status cannot be read", () => {
    render(<StripeStatusCard status={null} />)

    expect(screen.getByText("Statut indisponible")).toBeInTheDocument()
    expect(screen.getByRole("link", { name: "Configurer les paiements" })).toBeInTheDocument()
  })

  it("never shows the last digits, an account id or a secret", () => {
    render(
      <StripeStatusCard status={{ status: "ACTIVE", mode: "TEST", keyLast4: "1234", reconcileUntil: null }} />
    )

    expect(document.body.innerHTML).not.toContain("1234")
    expect(document.body.innerHTML).not.toMatch(/(rk|sk)_(test|live)_|acct_|whsec_/)
  })
})
