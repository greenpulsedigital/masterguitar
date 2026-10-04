import { describe, it, expect, vi } from "vitest"
import { render, screen } from "@testing-library/react"

vi.mock("@/app/(dashboard)/dashboard/settings/payments/actions", () => ({
  connectStripeAccount: vi.fn(),
  disconnectStripeAccount: vi.fn(),
}))

import { StripeAccountCard } from "@/components/stripe-account-card"
import { CONNECT_ERRORS } from "@/lib/payments-messages"

describe("StripeAccountCard", () => {
  describe("not configured", () => {
    it("shows the connection form, the warning and the minimal permissions", () => {
      render(<StripeAccountCard status={{ status: "NOT_CONFIGURED" }} />)

      expect(screen.getByRole("heading", { name: "Connecter votre compte Stripe" })).toBeInTheDocument()
      expect(screen.getByLabelText("Clé API restreinte Stripe")).toHaveAttribute("type", "password")
      expect(screen.getByRole("button", { name: "Connecter Stripe" })).toBeInTheDocument()
      expect(screen.getByText(/ne collez jamais une clé secrète complète/i)).toBeInTheDocument()
      expect(screen.getByRole("heading", { name: "Permissions minimales à accorder" })).toBeInTheDocument()
      expect(screen.getByText("Lire le compte Stripe")).toBeInTheDocument()
      expect(screen.getByText("Créer une session de paiement")).toBeInTheDocument()
      expect(screen.getByText(/créer et gérer l.endpoint webhook/i)).toBeInTheDocument()
    })

    it("does not show an error before any attempt", () => {
      render(<StripeAccountCard status={{ status: "NOT_CONFIGURED" }} />)

      expect(screen.queryByRole("alert")).not.toBeInTheDocument()
    })
  })

  describe("invalid key", () => {
    it("asks to replace the key with the generic message", () => {
      render(
        <StripeAccountCard
          status={{ status: "INVALID", mode: "TEST", keyLast4: "1234", reconcileUntil: null }}
        />
      )

      expect(screen.getByRole("heading", { name: "Remplacer la clé Stripe" })).toBeInTheDocument()
      expect(screen.getByRole("alert")).toHaveTextContent(CONNECT_ERRORS.refused)
      expect(screen.getByRole("button", { name: "Remplacer la clé" })).toBeInTheDocument()
    })

    it("does not prefill the previous key", () => {
      render(
        <StripeAccountCard
          status={{ status: "INVALID", mode: "TEST", keyLast4: "1234", reconcileUntil: null }}
        />
      )

      expect((screen.getByLabelText("Clé API restreinte Stripe") as HTMLInputElement).value).toBe("")
    })
  })

  describe("connected", () => {
    it("shows the status, the mode and the last 4 characters only", () => {
      render(
        <StripeAccountCard
          status={{ status: "ACTIVE", mode: "LIVE", keyLast4: "A7Q2", reconcileUntil: null }}
        />
      )

      expect(screen.getByRole("heading", { name: "Compte Stripe connecté" })).toBeInTheDocument()
      expect(screen.getByText("Connecté")).toBeInTheDocument()
      expect(screen.getByText("LIVE")).toBeInTheDocument()
      expect(screen.getByText(/se termine par ••••A7Q2/)).toBeInTheDocument()
      expect(screen.getByText(/aucune donnée personnelle/i)).toBeInTheDocument()
    })

    it("offers the disconnection but no connection form", () => {
      render(
        <StripeAccountCard
          status={{ status: "ACTIVE", mode: "TEST", keyLast4: "1234", reconcileUntil: null }}
        />
      )

      expect(screen.getByRole("button", { name: "Déconnecter" })).toBeInTheDocument()
      expect(screen.queryByLabelText("Clé API restreinte Stripe")).not.toBeInTheDocument()
    })

    it("never renders anything that looks like a secret or an account id", () => {
      render(
        <StripeAccountCard
          status={{ status: "ACTIVE", mode: "TEST", keyLast4: "1234", reconcileUntil: null }}
        />
      )

      expect(document.body.innerHTML).not.toMatch(/(rk|sk)_(test|live)_[A-Za-z0-9]{6,}|acct_|whsec_/)
    })
  })

  describe("disconnecting", () => {
    it("explains the state and offers no action", () => {
      render(
        <StripeAccountCard
          status={{
            status: "DISCONNECTING",
            mode: "TEST",
            keyLast4: "1234",
            reconcileUntil: new Date("2026-10-08T12:00:00Z"),
          }}
        />
      )

      expect(screen.getByRole("heading", { name: "Déconnexion en cours" })).toBeInTheDocument()
      expect(screen.getByText("En cours")).toBeInTheDocument()
      expect(screen.getByText(/nouveaux paiements et les nouvelles publications sont désactivés/i)).toHaveAttribute(
        "aria-live",
        "polite"
      )
      expect(screen.queryByRole("button")).not.toBeInTheDocument()
      expect(screen.queryByLabelText("Clé API restreinte Stripe")).not.toBeInTheDocument()
    })
  })
})
