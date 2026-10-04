import Link from "next/link"
import { CreditCard } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { ProfStripeStatus } from "@/lib/prof-stripe-account"

const LABELS = {
  NOT_CONFIGURED: "À configurer",
  ACTIVE: "Connecté",
  INVALID: "Clé à remplacer",
  DISCONNECTING: "Déconnexion en cours",
} as const

const DESCRIPTIONS = {
  NOT_CONFIGURED: "Connectez Stripe pour vendre vos cours",
  ACTIVE: "Les paiements arrivent directement sur votre compte",
  INVALID: "Votre clé n'est plus valide : remplacez-la pour continuer à vendre",
  DISCONNECTING: "Les nouveaux paiements et publications sont désactivés",
} as const

/**
 * Carte du dashboard : statut fonctionnel du compte Stripe uniquement,
 * jamais d'email, de nom d'entreprise ni d'identifiant Stripe.
 * `status` à `null` = lecture impossible (erreur), affichée sans détail.
 */
export function StripeStatusCard({ status }: { status: ProfStripeStatus | null }) {
  const key = status?.status ?? null

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="size-5" />
          <h2>Paiements Stripe</h2>
        </CardTitle>
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <Badge variant={key === "INVALID" ? "destructive" : key === "ACTIVE" ? "default" : "secondary"}>
            {key ? LABELS[key] : "Statut indisponible"}
          </Badge>
          {status && status.status === "ACTIVE" && <Badge variant="outline">{status.mode}</Badge>}
        </div>
        <CardDescription>
          {key ? DESCRIPTIONS[key] : "Impossible de lire l'état de votre compte Stripe pour le moment"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Link
          href="/dashboard/settings/payments"
          className={buttonVariants({ className: "min-h-11" })}
        >
          Configurer les paiements
        </Link>
      </CardContent>
    </Card>
  )
}
