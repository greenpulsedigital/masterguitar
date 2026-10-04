import Link from "next/link"
import { PUBLISH_BLOCKED_MESSAGE } from "@/lib/payments-messages"

/** Explique pourquoi « Publier » est indisponible, avec le chemin pour y remédier. */
export function PublishBlockedNotice() {
  return (
    <div
      role="alert"
      className="mb-6 rounded-sm bg-destructive/10 px-4 py-3 text-sm text-destructive"
    >
      <p>{PUBLISH_BLOCKED_MESSAGE}</p>
      <Link
        href="/dashboard/settings/payments"
        className="mt-2 inline-block font-medium underline underline-offset-4"
      >
        Configurer les paiements
      </Link>
    </div>
  )
}
