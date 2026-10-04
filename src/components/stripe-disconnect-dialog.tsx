"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { disconnectStripeAccount } from "@/app/(dashboard)/dashboard/settings/payments/actions"
import { CONNECT_ERRORS } from "@/lib/payments-messages"

/** Confirmation de déconnexion : jamais de déconnexion directe au premier clic. */
export function StripeDisconnectDialog() {
  const [open, setOpen] = useState(false)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | undefined>()

  async function handleConfirm() {
    setError(undefined)
    setPending(true)
    try {
      const result = await disconnectStripeAccount()
      if (result?.error) {
        setError(result.error)
        return
      }
      setOpen(false)
    } catch {
      setError(CONNECT_ERRORS.unexpected)
    } finally {
      setPending(false)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!pending) {
          setOpen(next)
          if (!next) setError(undefined)
        }
      }}
    >
      <DialogTrigger render={<Button variant="destructive" className="min-h-11" />}>
        Déconnecter
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Déconnecter le compte Stripe ?</DialogTitle>
          <DialogDescription>
            Les nouveaux paiements et les nouvelles publications seront bloqués immédiatement.
            L&apos;endpoint webhook et la clé seront supprimés à la fin de la fenêtre de
            réconciliation, pour laisser aboutir les paiements en cours. Les paiements déjà
            confirmés et l&apos;accès des élèves ne sont pas supprimés.
          </DialogDescription>
        </DialogHeader>
        {error && (
          <div
            role="alert"
            aria-live="assertive"
            className="rounded-sm bg-destructive/10 px-4 py-3 text-sm text-destructive"
          >
            {error}
          </div>
        )}
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            className="min-h-11"
            disabled={pending}
            onClick={() => setOpen(false)}
          >
            Annuler
          </Button>
          <Button
            type="button"
            variant="destructive"
            className="min-h-11"
            disabled={pending}
            aria-busy={pending}
            onClick={handleConfirm}
          >
            {pending ? "Déconnexion…" : "Déconnecter"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
