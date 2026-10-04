import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function PaymentsSettingsLoading() {
  return (
    <div className="container mx-auto max-w-3xl px-4 py-8 md:px-6 md:py-12">
      <Card aria-busy="true">
        <CardHeader>
          <CardTitle>
            <h2>Chargement des paiements Stripe</h2>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Vérification de la configuration…</p>
        </CardContent>
      </Card>
    </div>
  )
}
