import { auth } from "@/lib/auth"
import { getCourseById } from "@/lib/queries/course"
import { prisma } from "@/lib/prisma"
import { redirect, notFound } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckoutButton } from "./checkout-button"

interface CheckoutPageProps {
  params: {
    courseId: string
  }
}

export default async function CheckoutPage({ params }: CheckoutPageProps) {
  // Check authentication
  const session = await auth()
  if (!session?.user?.id) {
    redirect(`/login?callbackUrl=/checkout/${params.courseId}`)
  }

  // Get course
  const course = await getCourseById(params.courseId)
  if (!course || course.status !== "PUBLISHED") {
    notFound()
  }

  // Check if user already owns the course
  const existingPurchase = await prisma.purchase.findFirst({
    where: {
      userId: session.user.id,
      courseId: params.courseId,
    },
  })

  if (existingPurchase) {
    redirect("/checkout/success?already_purchased=true")
  }

  // Format price
  const priceInEuros = (course.price / 100).toFixed(2)

  return (
    <div className="container mx-auto max-w-2xl py-12 px-4">
      <Card>
        <CardHeader>
          <CardTitle>Finaliser votre achat</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold mb-2">{course.title}</h2>
            <p className="text-3xl font-bold text-primary">{priceInEuros} €</p>
          </div>
          <CheckoutButton courseId={params.courseId} />
        </CardContent>
      </Card>
    </div>
  )
}
