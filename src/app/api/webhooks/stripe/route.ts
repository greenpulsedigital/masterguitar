import { NextRequest } from "next/server"
import Stripe from "stripe"
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

    // Handle the event. async_payment_succeeded covers delayed payment methods,
    // whose sessions are "completed" but still unpaid at first.
    if (
      event.type === "checkout.session.completed" ||
      event.type === "checkout.session.async_payment_succeeded"
    ) {
      const session = event.data.object as Stripe.Checkout.Session

      // Only grant access once the money is actually received
      if (session.payment_status !== "paid") {
        console.log("Checkout session not paid yet, ignoring:", session.id, session.payment_status)
        return new Response("OK", { status: 200 })
      }

      const courseId = session.metadata?.courseId
      const userId = session.metadata?.userId

      if (!courseId || !userId) {
        console.error("Missing metadata in checkout session:", session.id)
        return new Response("Missing metadata", { status: 400 })
      }

      if (session.amount_total === null || session.amount_total <= 0) {
        console.error("Missing or invalid amount_total in checkout session:", session.id)
        return new Response("Missing amount", { status: 400 })
      }

      if (session.currency !== "eur") {
        console.error("Unexpected currency in checkout session:", session.id, session.currency)
        return new Response("Unexpected currency", { status: 400 })
      }

      // payment_intent is expandable and null when no payment was made
      const paymentIntentId =
        typeof session.payment_intent === "string"
          ? session.payment_intent
          : session.payment_intent?.id
      if (!paymentIntentId) {
        console.error("Missing payment_intent in checkout session:", session.id)
        return new Response("Missing payment intent", { status: 400 })
      }

      const [course, user] = await Promise.all([
        prisma.course.findUnique({ where: { id: courseId }, select: { id: true } }),
        prisma.user.findUnique({ where: { id: userId }, select: { id: true } }),
      ])
      if (!course || !user) {
        console.error("Unknown course or user in checkout session:", session.id)
        return new Response("Unknown course or user", { status: 400 })
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
      try {
        await prisma.purchase.create({
          data: {
            amount: session.amount_total,
            stripePaymentId: paymentIntentId,
            stripeSessionId: session.id,
            userId,
            courseId,
          },
        })
      } catch (error) {
        // Unique violation: a concurrent delivery of the same event, or a second payment
        // for a course the user already owns (needs a manual refund). Either way, don't make Stripe retry.
        if ((error as { code?: string }).code === "P2002") {
          console.error("Duplicate purchase ignored for session:", session.id)
          return new Response("OK", { status: 200 })
        }
        throw error
      }

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
