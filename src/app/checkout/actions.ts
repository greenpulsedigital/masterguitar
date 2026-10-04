"use server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { stripe } from "@/lib/stripe"
import { getCourseById } from "@/lib/queries/course"
import { getBaseUrl } from "@/lib/app-url"

export async function createCheckoutSession(courseId: string) {
  try {
    // Check authentication
    const session = await auth()
    if (!session?.user?.id) {
      return { error: "Vous devez être connecté pour effectuer un achat" }
    }

    // Get course
    const course = await getCourseById(courseId)
    if (!course) {
      return { error: "Cours introuvable" }
    }

    // Check if course is published
    if (course.status !== "PUBLISHED") {
      return { error: "Ce cours n'est pas disponible à l'achat" }
    }

    // Free courses have no checkout flow yet (Stripe would reject a 0 amount anyway)
    if (course.price <= 0) {
      return { error: "Ce cours n'est pas disponible à l'achat" }
    }

    // A prof cannot buy their own course
    if (course.profId === session.user.id) {
      return { error: "Vous ne pouvez pas acheter votre propre cours" }
    }

    // Check if user already owns the course
    const existingPurchase = await prisma.purchase.findFirst({
      where: {
        userId: session.user.id,
        courseId: courseId,
      },
    })

    if (existingPurchase) {
      return { error: "Vous possédez déjà ce cours" }
    }

    // Create Stripe checkout session
    const baseUrl = getBaseUrl()
    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: {
              name: course.title,
            },
            unit_amount: course.price,
          },
          quantity: 1,
        },
      ],
      metadata: {
        courseId: courseId,
        userId: session.user.id,
      },
      success_url: `${baseUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/cours/${course.slug}`,
    })

    return { url: checkoutSession.url }
  } catch (error) {
    console.error("Checkout error:", error)
    return { error: "Erreur lors de la création de la session de paiement" }
  }
}
