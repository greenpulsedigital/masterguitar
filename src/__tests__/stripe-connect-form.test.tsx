import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, fireEvent, waitFor } from "@testing-library/react"

vi.mock("@/app/(dashboard)/dashboard/settings/payments/actions", () => ({
  connectStripeAccount: vi.fn(),
  disconnectStripeAccount: vi.fn(),
}))

import { connectStripeAccount } from "@/app/(dashboard)/dashboard/settings/payments/actions"
import { StripeConnectForm } from "@/components/stripe-connect-form"
import { CONNECT_ERRORS } from "@/lib/payments-messages"

const KEY = ["rk", "test", "FAKEKEYFAKEKEY1234"].join("_")

function keyInput() {
  return screen.getByLabelText("Clé API restreinte Stripe") as HTMLInputElement
}

function submit(value = KEY) {
  fireEvent.change(keyInput(), { target: { value } })
  fireEvent.click(screen.getByRole("button", { name: /connecter stripe/i }))
}

describe("StripeConnectForm", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("renders a password field that never autocompletes", () => {
    render(<StripeConnectForm />)

    const input = keyInput()
    expect(input).toHaveAttribute("type", "password")
    expect(input).toHaveAttribute("autocomplete", "off")
    expect(input).toHaveAttribute("spellcheck", "false")
    expect(input).toHaveAttribute("name", "restrictedKey")
    expect(input).toHaveAttribute("placeholder", "rk_test_••••")
  })

  it("explains that the key is never shown again", () => {
    render(<StripeConnectForm />)

    expect(screen.getByText(/ne sera jamais réaffichée/i)).toBeInTheDocument()
  })

  it("sends the key in a FormData and not through props or the URL", async () => {
    vi.mocked(connectStripeAccount).mockResolvedValue(undefined)
    render(<StripeConnectForm />)

    submit()

    await waitFor(() => expect(connectStripeAccount).toHaveBeenCalledTimes(1))
    const sent = vi.mocked(connectStripeAccount).mock.calls[0][0] as FormData
    expect(sent.get("restrictedKey")).toBe(KEY)
  })

  it("shows the generic error returned by the action in an alert", async () => {
    vi.mocked(connectStripeAccount).mockResolvedValue({ error: CONNECT_ERRORS.refused })
    render(<StripeConnectForm />)

    submit()

    const alert = await screen.findByRole("alert")
    expect(alert).toHaveTextContent(CONNECT_ERRORS.refused)
    expect(alert).toHaveAttribute("aria-live", "assertive")
  })

  it("empties the field whatever the outcome, so the key stays out of the DOM", async () => {
    vi.mocked(connectStripeAccount).mockResolvedValue({ error: CONNECT_ERRORS.refused })
    render(<StripeConnectForm />)

    submit()

    await screen.findByRole("alert")
    expect(keyInput().value).toBe("")
    expect(document.body.innerHTML).not.toContain("FAKEKEY")
  })

  it("shows a generic error when the action throws", async () => {
    vi.mocked(connectStripeAccount).mockRejectedValue(new Error(`boom ${KEY}`))
    render(<StripeConnectForm />)

    submit()

    const alert = await screen.findByRole("alert")
    expect(alert).toHaveTextContent(CONNECT_ERRORS.unexpected)
    expect(document.body.innerHTML).not.toContain("FAKEKEY")
  })

  it("disables the form and flags it busy while the request is running", async () => {
    let finish: (value: undefined) => void = () => {}
    vi.mocked(connectStripeAccount).mockReturnValue(
      new Promise((resolve) => {
        finish = resolve
      })
    )
    render(<StripeConnectForm />)

    submit()

    const button = await screen.findByRole("button", { name: /vérification/i })
    expect(button).toBeDisabled()
    expect(button).toHaveAttribute("aria-busy", "true")
    expect(keyInput()).toBeDisabled()

    finish(undefined)
    await waitFor(() => expect(screen.getByRole("button", { name: /connecter stripe/i })).toBeEnabled())
  })

  it("shows an initial error when provided", () => {
    render(<StripeConnectForm initialError={CONNECT_ERRORS.refused} submitLabel="Remplacer la clé" />)

    expect(screen.getByRole("alert")).toHaveTextContent(CONNECT_ERRORS.refused)
    expect(screen.getByRole("button", { name: "Remplacer la clé" })).toBeInTheDocument()
  })

  it("gives the button a 44px touch target", () => {
    render(<StripeConnectForm />)

    expect(screen.getByRole("button", { name: /connecter stripe/i }).className).toContain("min-h-11")
  })
})
