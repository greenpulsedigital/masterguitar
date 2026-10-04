"use client"

import { useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { connectStripeAccount } from "@/app/(dashboard)/dashboard/settings/payments/actions"
import { CONNECT_ERRORS } from "@/lib/payments-messages"

interface StripeConnectFormProps {
  submitLabel?: string
  /** Message affiché dès l'ouverture (état « clé à remplacer »). */
  initialError?: string
}

/**
 * Saisie de la clé restreinte du prof.
 *
 * Le champ n'est PAS contrôlé : la clé ne passe jamais par l'état React. Elle est lue au moment
 * de l'envoi, puis le champ est vidé quelle que soit l'issue (elle n'est jamais réaffichée).
 */
export function StripeConnectForm({
  submitLabel = "Connecter Stripe",
  initialError,
}: StripeConnectFormProps) {
  const [error, setError] = useState<string | undefined>(initialError)
  const [pending, setPending] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    const formData = new FormData(form)

    setError(undefined)
    setPending(true)
    try {
      const result = await connectStripeAccount(formData)
      if (result?.error) setError(result.error)
    } catch {
      setError(CONNECT_ERRORS.unexpected)
    } finally {
      setPending(false)
      form.reset()
      inputRef.current?.focus()
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <div className="space-y-2">
        <Label htmlFor="restricted-key">Clé API restreinte Stripe</Label>
        <Input
          ref={inputRef}
          id="restricted-key"
          name="restrictedKey"
          type="password"
          autoComplete="off"
          spellCheck={false}
          placeholder="rk_test_••••"
          required
          maxLength={300}
          disabled={pending}
          aria-describedby="restricted-key-help"
          aria-invalid={error ? true : undefined}
          className="h-11"
        />
        <p id="restricted-key-help" className="text-sm text-muted-foreground">
          Utilisez de préférence une clé restreinte. La clé ne sera jamais réaffichée après
          l&apos;enregistrement.
        </p>
      </div>

      {error && (
        <div
          role="alert"
          aria-live="assertive"
          className="rounded-sm bg-destructive/10 px-4 py-3 text-sm text-destructive"
        >
          {error}
        </div>
      )}

      <Button
        type="submit"
        disabled={pending}
        aria-busy={pending}
        className="min-h-11 w-full md:w-fit"
      >
        {pending ? "Vérification…" : submitLabel}
      </Button>
    </form>
  )
}
