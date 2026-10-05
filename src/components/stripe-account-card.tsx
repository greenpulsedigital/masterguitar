import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { StripeConnectForm } from "@/components/stripe-connect-form"
import { StripeDisconnectDialog } from "@/components/stripe-disconnect-dialog"
import { CONNECT_ERRORS } from "@/lib/payments-messages"
import type { ProfStripeStatus } from "@/lib/prof-stripe-account"

// Permissions à accorder à la clé restreinte : ensemble minimal établi par un test réel
// (plan s19, prérequis P1 levé le 2026-10-05, script scripts/check-stripe-restricted-key.sh).
// `webhook_write` couvre aussi la relecture, le listage et la suppression des endpoints, et
// `checkout_session_write` la relecture des sessions.
const REQUIRED_PERMISSIONS = [
  { label: "Lire le compte Stripe", scope: "connected_account_read" },
  { label: "Créer une session de paiement", scope: "checkout_session_write" },
  { label: "Créer et gérer l’endpoint webhook", scope: "webhook_write" },
]

function PermissionsList() {
  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium">Permissions minimales à accorder</h3>
      <ul className="list-disc space-y-1 pl-5 text-sm">
        {REQUIRED_PERMISSIONS.map(({ label, scope }) => (
          <li key={scope}>
            <span>{label}</span> <code className="text-xs text-muted-foreground">{scope}</code>
          </li>
        ))}
      </ul>
      <p className="text-sm text-muted-foreground">
        Ces permissions permettent de vérifier le compte, de créer les paiements et de recevoir
        leur confirmation. Laissez toutes les autres sur « Aucun ».
      </p>
    </div>
  )
}

function KeyWarning() {
  return (
    <div className="rounded-sm border bg-muted px-4 py-3 text-sm">
      Ne collez jamais une clé secrète complète commençant par <code>sk_</code>. Une clé
      restreinte suffit pour ce parcours.
    </div>
  )
}

/** Carte de la page de réglages : un rendu par statut du compte Stripe. */
export function StripeAccountCard({ status }: { status: ProfStripeStatus }) {
  if (status.status === "ACTIVE") {
    return (
      <Card>
        <CardHeader>
          <CardTitle>
            <h2>Compte Stripe connecté</h2>
          </CardTitle>
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <Badge>Connecté</Badge>
            <Badge variant="outline">{status.mode}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm">Clé enregistrée · se termine par ••••{status.keyLast4}</p>
          <p className="text-sm text-muted-foreground">
            Aucune donnée personnelle de votre compte Stripe n&apos;est affichée ici.
          </p>
          <StripeDisconnectDialog />
        </CardContent>
      </Card>
    )
  }

  if (status.status === "DISCONNECTING") {
    return (
      <Card>
        <CardHeader>
          <CardTitle>
            <h2>Déconnexion en cours</h2>
          </CardTitle>
          <div className="pt-1">
            <Badge variant="secondary">En cours</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <p aria-live="polite" className="text-sm">
            Les nouveaux paiements et les nouvelles publications sont désactivés pendant la
            déconnexion. L&apos;endpoint webhook et la clé restent en place pendant la fenêtre de
            réconciliation, pour laisser aboutir les paiements en cours, puis ils sont supprimés.
          </p>
        </CardContent>
      </Card>
    )
  }

  const invalid = status.status === "INVALID"
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <h2>{invalid ? "Remplacer la clé Stripe" : "Connecter votre compte Stripe"}</h2>
        </CardTitle>
        {!invalid && (
          <CardDescription>
            Les paiements de vos élèves seront créés directement sur votre compte Stripe.
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="space-y-5">
        <StripeConnectForm
          submitLabel={invalid ? "Remplacer la clé" : "Connecter Stripe"}
          initialError={invalid ? CONNECT_ERRORS.refused : undefined}
        />
        <KeyWarning />
        <PermissionsList />
      </CardContent>
    </Card>
  )
}
