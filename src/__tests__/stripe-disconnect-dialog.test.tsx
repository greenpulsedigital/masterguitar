import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, fireEvent, waitFor } from "@testing-library/react"

vi.mock("@/app/(dashboard)/dashboard/settings/payments/actions", () => ({
  connectStripeAccount: vi.fn(),
  disconnectStripeAccount: vi.fn(),
}))

import { disconnectStripeAccount } from "@/app/(dashboard)/dashboard/settings/payments/actions"
import { StripeDisconnectDialog } from "@/components/stripe-disconnect-dialog"
import { CONNECT_ERRORS } from "@/lib/payments-messages"

describe("StripeDisconnectDialog", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("never disconnects at the first click", () => {
    render(<StripeDisconnectDialog />)

    fireEvent.click(screen.getByRole("button", { name: "Déconnecter" }))

    expect(disconnectStripeAccount).not.toHaveBeenCalled()
    expect(screen.getByText("Déconnecter le compte Stripe ?")).toBeInTheDocument()
  })

  it("explains the consequences", async () => {
    render(<StripeDisconnectDialog />)

    fireEvent.click(screen.getByRole("button", { name: "Déconnecter" }))

    const dialog = await screen.findByRole("dialog")
    expect(dialog).toHaveTextContent(/nouveaux paiements et les nouvelles publications/i)
    expect(dialog).toHaveTextContent(/fin de la fenêtre de réconciliation/i)
    expect(dialog).toHaveTextContent(/accès des élèves ne sont pas supprimés/i)
  })

  it("closes without acting when cancelled", async () => {
    render(<StripeDisconnectDialog />)
    fireEvent.click(screen.getByRole("button", { name: "Déconnecter" }))
    await screen.findByRole("dialog")

    fireEvent.click(screen.getByRole("button", { name: "Annuler" }))

    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument())
    expect(disconnectStripeAccount).not.toHaveBeenCalled()
  })

  it("disconnects on confirmation and closes", async () => {
    vi.mocked(disconnectStripeAccount).mockResolvedValue(undefined)
    render(<StripeDisconnectDialog />)
    fireEvent.click(screen.getByRole("button", { name: "Déconnecter" }))
    const dialog = await screen.findByRole("dialog")

    const confirm = Array.from(dialog.querySelectorAll("button")).find(
      (button) => button.textContent === "Déconnecter"
    )!
    fireEvent.click(confirm)

    await waitFor(() => expect(disconnectStripeAccount).toHaveBeenCalledTimes(1))
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument())
  })

  it("keeps the dialog open and shows the error when the action fails", async () => {
    vi.mocked(disconnectStripeAccount).mockResolvedValue({ error: CONNECT_ERRORS.unexpected })
    render(<StripeDisconnectDialog />)
    fireEvent.click(screen.getByRole("button", { name: "Déconnecter" }))
    const dialog = await screen.findByRole("dialog")

    const confirm = Array.from(dialog.querySelectorAll("button")).find(
      (button) => button.textContent === "Déconnecter"
    )!
    fireEvent.click(confirm)

    const alert = await screen.findByRole("alert")
    expect(alert).toHaveTextContent(CONNECT_ERRORS.unexpected)
    expect(screen.getByRole("dialog")).toBeInTheDocument()
  })

  it("shows a generic error when the action throws", async () => {
    vi.mocked(disconnectStripeAccount).mockRejectedValue(new Error("db down"))
    render(<StripeDisconnectDialog />)
    fireEvent.click(screen.getByRole("button", { name: "Déconnecter" }))
    const dialog = await screen.findByRole("dialog")

    const confirm = Array.from(dialog.querySelectorAll("button")).find(
      (button) => button.textContent === "Déconnecter"
    )!
    fireEvent.click(confirm)

    expect(await screen.findByRole("alert")).toHaveTextContent(CONNECT_ERRORS.unexpected)
  })
})
