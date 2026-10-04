import { auth } from "@/lib/auth"
import { getCourseById } from "@/lib/queries/course"
import { prisma } from "@/lib/prisma"
import { formatPrice } from "@/lib/format"
import { redirect, notFound } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckoutButton } from "./checkout-button"

export default async function CheckoutPage({
  params,
}: {
  params: Promise<{ courseId: string }>
}) {
  const { courseId } = await params

  // Check authentication
  const session = await auth()
  if (!session?.user?.id) {
    redirect(`/login?callbackUrl=/checkout/${courseId}`)
  }

  // Get course
  const course = await getCourseById(courseId)
  if (!course || course.status !== "PUBLISHED") {
    notFound()
  }

  // Free courses have no checkout flow
  if (course.price <= 0) {
    notFound()
  }

  // A prof cannot buy their own course
  if (course.profId === session.user.id) {
    redirect(`/cours/${course.slug}`)
  }

  // Check if user already owns the course
  const existingPurchase = await prisma.purchase.findFirst({
    where: {
      userId: session.user.id,
      courseId: courseId,
    },
  })

  if (existingPurchase) {
    redirect("/checkout/success?already_purchased=true")
  }

  return (
    <div className="container mx-auto max-w-2xl py-12 px-4">
      <Card>
        <CardHeader>
          <CardTitle>Finaliser votre achat</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold mb-2">{course.title}</h2>
            <p className="text-3xl font-bold text-primary">{formatPrice(course.price)}</p>
          </div>
          <CheckoutButton courseId={courseId} />
        </CardContent>
      </Card>
    </div>
  )
}
