import { stripe } from "@/lib/stripe"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface SuccessPageProps {
  searchParams: {
    session_id?: string
    already_purchased?: string
  }
}

export default async function SuccessPage({ searchParams }: SuccessPageProps) {
  // Handle already purchased case
  if (searchParams.already_purchased === "true") {
    return (
      <div className="container mx-auto max-w-2xl py-12 px-4">
        <Card>
          <CardHeader>
            <CardTitle>Cours déjà acheté</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-lg">Vous possédez déjà ce cours.</p>
            <Button render={<Link href="/" />}>Retour à l'accueil</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Require session_id
  if (!searchParams.session_id) {
    redirect("/")
  }

  try {
    // Retrieve session from Stripe
    const session = await stripe.checkout.sessions.retrieve(searchParams.session_id)

    return (
      <div className="container mx-auto max-w-2xl py-12 px-4">
        <Card>
          <CardHeader>
            <CardTitle>Merci pour votre achat !</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-lg">
              Votre paiement a été traité avec succès. Vous avez maintenant accès à votre cours.
            </p>
            <div className="flex gap-4">
              <Button render={<Link href="/" />}>Retour à l'accueil</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  } catch (error) {
    console.error("Error retrieving session:", error)
    redirect("/")
  }
}
