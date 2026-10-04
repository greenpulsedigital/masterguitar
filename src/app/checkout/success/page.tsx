import { auth } from "@/lib/auth"
import { stripe } from "@/lib/stripe"
import { getCourseById } from "@/lib/queries/course"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default async function SuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string; already_purchased?: string }>
}) {
  const { session_id, already_purchased } = await searchParams

  // Handle already purchased case
  if (already_purchased === "true") {
    return (
      <div className="container mx-auto max-w-2xl py-12 px-4">
        <Card>
          <CardHeader>
            <CardTitle>Cours déjà acheté</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-lg">Vous possédez déjà ce cours.</p>
            <Button className="h-11" render={<Link href="/" />}>Retour à l&apos;accueil</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Require session_id
  if (!session_id) {
    redirect("/")
  }

  // Only the buyer can see the confirmation of their own session
  const user = await auth()
  if (!user?.user?.id) {
    redirect(`/login?callbackUrl=${encodeURIComponent(`/checkout/success?session_id=${session_id}`)}`)
  }

  // Retrieve session from Stripe (redirect() must stay outside the try/catch)
  let session: Awaited<ReturnType<typeof stripe.checkout.sessions.retrieve>> | null = null
  try {
    session = await stripe.checkout.sessions.retrieve(session_id)
  } catch (error) {
    console.error("Error retrieving session:", error)
  }

  if (!session || session.metadata?.userId !== user.user.id) {
    redirect("/")
  }

  const course = session.metadata?.courseId
    ? await getCourseById(session.metadata.courseId)
    : null

  if (session.payment_status !== "paid") {
    return (
      <div className="container mx-auto max-w-2xl py-12 px-4">
        <Card>
          <CardHeader>
            <CardTitle>Paiement en attente</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-lg">
              {course
                ? `Votre paiement pour « ${course.title} » n'est pas encore confirmé. L'accès au cours sera activé dès sa validation.`
                : "Votre paiement n'est pas encore confirmé. L'accès au cours sera activé dès sa validation."}
            </p>
            <Button className="h-11" render={<Link href="/" />}>Retour à l&apos;accueil</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto max-w-2xl py-12 px-4">
      <Card>
        <CardHeader>
          <CardTitle>Merci pour votre achat !</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-lg">
            {course
              ? `Votre paiement pour « ${course.title} » a été traité avec succès. Vous avez maintenant accès à votre cours.`
              : "Votre paiement a été traité avec succès. Vous avez maintenant accès à votre cours."}
          </p>
          <div className="flex gap-4">
            <Button className="h-11" render={<Link href="/" />}>Retour à l&apos;accueil</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
