import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen } from "@testing-library/react"

vi.mock("@/lib/require-prof", () => ({ requireProf: vi.fn() }))
vi.mock("@/lib/prof-stripe-account", () => ({
  getProfStripeStatus: vi.fn(),
  purgeExpiredDisconnections: vi.fn(),
}))
vi.mock("@/app/(dashboard)/dashboard/settings/payments/actions", () => ({
  connectStripeAccount: vi.fn(),
  disconnectStripeAccount: vi.fn(),
}))
vi.mock("next/navigation", () => ({
  redirect: vi.fn((url: string) => {
    throw new Error(`NEXT_REDIRECT:${url}`)
  }),
}))

import { requireProf } from "@/lib/require-prof"
import { getProfStripeStatus, purgeExpiredDisconnections } from "@/lib/prof-stripe-account"
import PaymentsSettingsPage from "@/app/(dashboard)/dashboard/settings/payments/page"
import PaymentsSettingsLoading from "@/app/(dashboard)/dashboard/settings/payments/loading"

describe("payments settings page", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(requireProf).mockResolvedValue({ userId: "prof-1" })
    vi.mocked(purgeExpiredDisconnections).mockResolvedValue(0)
    vi.spyOn(console, "error").mockImplementation(() => {})
  })

  it("redirects to the login page when the caller is not a prof", async () => {
    vi.mocked(requireProf).mockResolvedValue(null)

    await expect(PaymentsSettingsPage()).rejects.toThrow("NEXT_REDIRECT:/login")
    expect(getProfStripeStatus).not.toHaveBeenCalled()
  })

  it("renders the title and the card of the current status", async () => {
    vi.mocked(getProfStripeStatus).mockResolvedValue({ status: "NOT_CONFIGURED" })

    render(await PaymentsSettingsPage())

    expect(screen.getByRole("heading", { level: 1, name: "Paiements Stripe" })).toBeInTheDocument()
    expect(screen.getByRole("heading", { name: "Connecter votre compte Stripe" })).toBeInTheDocument()
  })

  it("ends expired disconnections before reading the status", async () => {
    vi.mocked(getProfStripeStatus).mockResolvedValue({ status: "NOT_CONFIGURED" })

    render(await PaymentsSettingsPage())

    const purge = vi.mocked(purgeExpiredDisconnections).mock.invocationCallOrder[0]
    const read = vi.mocked(getProfStripeStatus).mock.invocationCallOrder[0]
    expect(purge).toBeLessThan(read)
  })

  it("reads the status of the session's prof only", async () => {
    vi.mocked(getProfStripeStatus).mockResolvedValue({ status: "NOT_CONFIGURED" })

    render(await PaymentsSettingsPage())

    expect(getProfStripeStatus).toHaveBeenCalledWith("prof-1")
  })

  it("shows the connected card", async () => {
    vi.mocked(getProfStripeStatus).mockResolvedValue({
      status: "ACTIVE",
      mode: "TEST",
      keyLast4: "1234",
      reconcileUntil: null,
    })

    render(await PaymentsSettingsPage())

    expect(screen.getByRole("heading", { name: "Compte Stripe connecté" })).toBeInTheDocument()
  })

  it("shows a generic error with a retry link when the status cannot be loaded", async () => {
    vi.mocked(getProfStripeStatus).mockRejectedValue(new Error("db down"))

    render(await PaymentsSettingsPage())

    expect(screen.getByRole("alert")).toHaveTextContent("Impossible de charger l'état Stripe. Réessayez plus tard.")
    expect(screen.getByRole("link", { name: "Réessayer" })).toHaveAttribute(
      "href",
      "/dashboard/settings/payments"
    )
    expect(screen.queryByLabelText("Clé API restreinte Stripe")).not.toBeInTheDocument()
  })

  it("has a loading state flagged busy", () => {
    render(<PaymentsSettingsLoading />)

    expect(screen.getByText("Chargement des paiements Stripe")).toBeInTheDocument()
    expect(screen.getByText("Vérification de la configuration…")).toBeInTheDocument()
    expect(document.querySelector('[aria-busy="true"]')).not.toBeNull()
  })
})
