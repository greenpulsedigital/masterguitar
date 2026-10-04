import { redirect } from "next/navigation"
import Link from "next/link"
import { requireProf } from "@/lib/require-prof"
import {
  getProfStripeStatus,
  purgeExpiredDisconnections,
  type ProfStripeStatus,
} from "@/lib/prof-stripe-account"
import { StripeAccountCard } from "@/components/stripe-account-card"
import { Card, CardContent } from "@/components/ui/card"
import { buttonVariants } from "@/components/ui/button"

export default async function PaymentsSettingsPage() {
  const prof = await requireProf()
  if (!prof) redirect("/login")

  // Fin des déconnexions échues (paresseuse, faute de tâche planifiée), puis lecture du statut
  let status: ProfStripeStatus | null = null
  try {
    await purgeExpiredDisconnections()
    status = await getProfStripeStatus(prof.userId)
  } catch (error) {
    const code = (error as { code?: unknown })?.code
    console.error("stripe settings status unavailable", typeof code === "string" ? code : undefined)
  }

  return (
    <div className="container mx-auto max-w-3xl px-4 py-8 md:px-6 md:py-12">
      <h1 className="mb-2 text-3xl font-semibold">Paiements Stripe</h1>
      <p className="mb-8 text-muted-foreground">
        Configurez le compte qui recevra directement les paiements.
      </p>

      {status ? (
        <StripeAccountCard status={status} />
      ) : (
        <Card>
          <CardContent className="space-y-4 pt-4">
            <div
              role="alert"
              aria-live="assertive"
              className="rounded-sm bg-destructive/10 px-4 py-3 text-sm text-destructive"
            >
              Impossible de charger l&apos;état Stripe. Réessayez plus tard.
            </div>
            <Link
              href="/dashboard/settings/payments"
              className={buttonVariants({ variant: "outline", className: "min-h-11" })}
            >
              Réessayer
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
