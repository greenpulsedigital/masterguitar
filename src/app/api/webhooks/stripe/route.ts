import { NextRequest } from "next/server"
import { stripe } from "@/lib/stripe"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get("stripe-signature")

  if (!signature) {
    return new Response("Missing stripe-signature header", { status: 400 })
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  if (!webhookSecret) {
    console.error("STRIPE_WEBHOOK_SECRET is not set")
    return new Response("Webhook secret not configured", { status: 500 })
  }

  try {
    // Verify webhook signature
    const event = stripe.webhooks.constructEvent(body, signature, webhookSecret)

    // Handle the event
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as any

      const { courseId, userId } = session.metadata

      if (!courseId || !userId) {
        console.error("Missing metadata in checkout session:", session.id)
        return new Response("Missing metadata", { status: 400 })
      }

      // Check if purchase already exists (idempotency)
      const existingPurchase = await prisma.purchase.findUnique({
        where: { stripeSessionId: session.id },
      })

      if (existingPurchase) {
        console.log("Purchase already exists for session:", session.id)
        return new Response("OK", { status: 200 })
      }

      // Create purchase record
      await prisma.purchase.create({
        data: {
          amount: session.amount_total,
          stripePaymentId: session.payment_intent as string,
          stripeSessionId: session.id,
          userId: userId,
          courseId: courseId,
        },
      })

      console.log("Purchase created for session:", session.id)
    }

    return new Response("OK", { status: 200 })
  } catch (error) {
    console.error("Webhook error:", error)
    if (error instanceof Error && error.message.includes("signature")) {
      return new Response("Invalid signature", { status: 400 })
    }
    return new Response("Webhook handler failed", { status: 500 })
  }
}
