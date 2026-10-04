"use server"

import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { requireProf } from "@/lib/require-prof"
import { CONNECT_ERRORS } from "@/lib/payments-messages"
import { checkConnectRateLimit, getClientIp } from "@/lib/rate-limit"
import {
  connectAccount,
  purgeExpiredDisconnections,
  startDisconnect,
} from "@/lib/prof-stripe-account"

/**
 * Actions de gestion du compte Stripe du prof (s19).
 *
 * Règles : rôle PROF relu en base, limitation de débit par utilisateur et par IP, messages
 * génériques identiques quelle que soit la cause, et aucun secret dans les retours.
 * redirect() est toujours appelé en dehors des try/catch (il lève une exception).
 */

type PaymentsActionResult = { error: string } | undefined

const SETTINGS_PATH = "/dashboard/settings/payments"

function revalidatePaymentsPages() {
  revalidatePath("/dashboard")
  revalidatePath(SETTINGS_PATH)
}

/** Journalise sans message d'erreur : il pourrait contenir une clé. */
function logUnexpected(label: string, error: unknown) {
  const code = (error as { code?: unknown })?.code
  console.error(label, typeof code === "string" ? code : undefined)
}

export async function connectStripeAccount(formData: FormData): Promise<PaymentsActionResult> {
  const prof = await requireProf()
  if (!prof) redirect("/login")

  try {
    const ip = getClientIp(await headers())
    const limit = await checkConnectRateLimit({ userId: prof.userId, ip, scope: "connect" })
    if (!limit.allowed) return { error: CONNECT_ERRORS.rateLimited }

    const rawKey = formData.get("restrictedKey")
    if (typeof rawKey !== "string") return { error: CONNECT_ERRORS.refused }

    // Un compte dont la fenêtre de déconnexion est échue doit disparaître avant toute reconnexion
    await purgeExpiredDisconnections()

    const result = await connectAccount({ profId: prof.userId, rawKey })
    if (!result.ok) {
      if (result.reason === "BLOCKED") return { error: CONNECT_ERRORS.alreadyConnected }
      if (result.reason === "ERROR") return { error: CONNECT_ERRORS.unexpected }
      return { error: CONNECT_ERRORS.refused }
    }
  } catch (error) {
    logUnexpected("stripe account connection failed", error)
    return { error: CONNECT_ERRORS.unexpected }
  }

  revalidatePaymentsPages()
  redirect(SETTINGS_PATH)
}

export async function disconnectStripeAccount(): Promise<PaymentsActionResult> {
  const prof = await requireProf()
  if (!prof) redirect("/login")

  try {
    const ip = getClientIp(await headers())
    const limit = await checkConnectRateLimit({ userId: prof.userId, ip, scope: "disconnect" })
    if (!limit.allowed) return { error: CONNECT_ERRORS.rateLimited }

    // Le prof ne peut agir que sur son propre compte : l'identifiant vient de la session
    const result = await startDisconnect(prof.userId)
    if (!result.ok) return { error: CONNECT_ERRORS.unexpected }
  } catch (error) {
    logUnexpected("stripe account disconnection failed", error)
    return { error: CONNECT_ERRORS.unexpected }
  }

  revalidatePaymentsPages()
  redirect(SETTINGS_PATH)
}
