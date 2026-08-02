# Research — Story s07-stripe-checkout

## Target story

**As a** élève **I want** acheter un cours par carte bancaire **so that** je peux accéder au contenu.

### Acceptance criteria
- [ ] Le bouton "Acheter" redirige vers Stripe Checkout
- [ ] Le paiement réussi crée un accès pour l'élève
- [ ] Le paiement réussi redirige vers une page de confirmation
- [ ] Le webhook Stripe est géré (payment_intent.succeeded)
- [ ] Le prof reçoit 100% du montant (moins frais Stripe)

### Agentic notes
- Stripe Checkout (hosted) pour MVP — pas d'Elements custom
- Table `Purchase` avec `userId`, `courseId`, `stripePaymentId`, `amount`
- Webhook: `/api/webhooks/stripe`
- L'élève doit avoir un compte (créé au checkout ou pré-existant)

## Current state of the code

### What exists
| File | Purpose | State |
|------|---------|-------|
| `src/app/cours/[slug]/page.tsx` | Sales page with "Acheter" button | Links to `/checkout/${course.id}` (404) |
| `src/lib/auth.ts` | NextAuth config | Exports `auth()`, session has `user.id` and `user.role` |
| `src/lib/queries/course.ts` | `getCourseBySlug` | Returns published course with modules and prof |
| `src/app/(auth)/signup/actions.ts` | User creation | Creates STUDENT or PROF, auto-login |
| `prisma/schema.prisma` | Data model | Has User, Course, Module — **NO Purchase model** |

### What doesn't exist
| Item | Needed for |
|------|------------|
| `src/lib/stripe.ts` | Stripe client singleton |
| `src/app/checkout/[courseId]/page.tsx` | Checkout initiation (or server action) |
| `src/app/api/webhooks/stripe/route.ts` | Webhook handler |
| `src/app/checkout/success/page.tsx` | Post-payment confirmation |
| `Purchase` model in schema | Recording purchases |
| `purchases` relation on User | Student's purchased courses |

### Stripe packages
```json
"@stripe/stripe-js": "^9.12.1",  // client-side
"stripe": "^22.4.0"              // server-side
```
Both installed but not configured.

### Environment variables
From `.env.example`:
- `STRIPE_SECRET_KEY` — server-side API calls
- `STRIPE_PUBLISHABLE_KEY` — client-side (if needed, not for hosted Checkout)
- `STRIPE_WEBHOOK_SECRET` — webhook signature verification

## Anchor points

### Entry point: "Acheter" button
```tsx
// src/app/cours/[slug]/page.tsx:97,114
<Button render={<Link href={`/checkout/${course.id}`} />} ...>
  Acheter
</Button>
```
Currently links to `/checkout/${course.id}` which needs to be created.

### Auth check pattern
```typescript
// From existing actions (e.g., toggleCourseStatus)
import { auth } from "@/lib/auth"

const session = await auth()
if (!session?.user?.id) {
  throw new Error("Unauthorized")
}
```

### Query for course by ID
```typescript
// Need to add to src/lib/queries/course.ts
// getCourseById(id: string) — for checkout, need price and validation
```

## Verified APIs / functions

### NextAuth (lib/auth.ts)
- `auth()` → returns session with `user.id`, `user.email`, `user.role`
- `signIn(provider, options)` → login
- Session available in Server Components and API routes

### Prisma (lib/prisma.ts)
- `prisma` singleton client
- Current models: `User`, `Course`, `Module`
- Course has: `id`, `slug`, `title`, `price` (cents), `status`, `profId`

### Stripe SDK (to be configured)
```typescript
// Server-side (stripe v22.x)
import Stripe from "stripe"
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

// Create checkout session
stripe.checkout.sessions.create({
  mode: "payment",
  line_items: [...],
  success_url: "...",
  cancel_url: "...",
  metadata: { courseId, userId },
})

// Webhook verification
stripe.webhooks.constructEvent(body, signature, webhookSecret)
```

## Traps & constraints

### 1. User must exist before purchase
Architecture says: "L'élève doit avoir un compte (créé au checkout ou pré-existant)"

Options:
- **A**: Require login before checkout → simpler, but friction
- **B**: Allow guest checkout, create user after payment → complex (email from Stripe, handle conflicts)
- **Recommendation**: Option A for MVP — redirect to login/signup if not authenticated, then return to checkout

### 2. Schema migration required
Purchase model doesn't exist. Need migration:
```prisma
model Purchase {
  id              String   @id @default(cuid())
  amount          Int      // cents
  stripePaymentId String   @unique
  createdAt       DateTime @default(now())

  userId   String
  user     User   @relation(fields: [userId], references: [id])
  courseId String
  course   Course @relation(fields: [courseId], references: [id])
}
```
Also need to add `purchases Purchase[]` relation to User and Course models.

### 3. Webhook security
- Must verify Stripe signature using `STRIPE_WEBHOOK_SECRET`
- Webhook endpoint must NOT use auth middleware (Stripe can't authenticate)
- Need to handle idempotency (same event delivered multiple times)

### 4. Checkout flow edge cases
- Course unpublished between page view and checkout → validate status at checkout
- Price changed between page view and checkout → use price at checkout time
- Same user buying same course twice → either prevent or allow (business decision)

### 5. Route structure decision
Two patterns for checkout initiation:
- **Route**: `/checkout/[courseId]/page.tsx` — user visits page, Server Action creates session
- **Server Action**: from sales page directly, redirect to Stripe URL

Architecture shows `src/app/api/` for webhooks but Server Actions for mutations. Checkout initiation fits better as Server Action.

### 6. Existing tests to maintain
28 test files exist. None related to Stripe/Purchase yet. New tests needed for:
- Checkout session creation
- Webhook handling
- Purchase model operations

### 7. Prof receives 100% (minus Stripe fees)
Architecture says: "Connect: NOT used — profs receive payments directly, platform charges a flat SaaS fee"

This means payments go to the platform's Stripe account, not using Stripe Connect. The "prof receives 100%" is a business rule for internal accounting, not a Stripe payout feature. No additional Stripe configuration needed for MVP.

## Open questions

### 1. Duplicate purchase handling
Should a student be allowed to buy the same course twice?
- **Prevent**: Check for existing Purchase before creating session
- **Allow**: Idempotent, but wasteful

**Recommendation**: Prevent duplicate purchases (check at checkout initiation).

### 2. Checkout cancellation flow
When user cancels at Stripe Checkout:
- Return to sales page? (`/cours/{slug}`)
- Return to a dedicated cancel page?

**Recommendation**: Return to sales page (simpler).

### 3. Course access implementation
The story says "Le paiement réussi crée un accès pour l'élève". The Purchase record IS the access. Verification logic:
```typescript
// Check if user has access
const purchase = await prisma.purchase.findFirst({
  where: { userId, courseId }
})
const hasAccess = !!purchase
```
This belongs to s08-student-access, but the Purchase model must exist now.

### 4. Stripe Checkout mode
For one-shot purchase: `mode: "payment"` (not "subscription").
Webhook event: `checkout.session.completed` (not `payment_intent.succeeded` as stated in AC).

**Note**: AC says "payment_intent.succeeded" but for Checkout Sessions, the correct event is `checkout.session.completed`. The `payment_intent.succeeded` fires too, but `checkout.session.completed` contains the metadata (courseId, userId) we need.

---

## Summary

**Ready to implement**:
1. Stripe client singleton (`src/lib/stripe.ts`)
2. Purchase model + migration
3. Checkout server action (create Stripe session, redirect)
4. Success page
5. Webhook handler (`/api/webhooks/stripe`)
6. Tests

**Key decisions for planning**:
- Require auth before checkout (simpler MVP flow)
- Prevent duplicate purchases
- Use `checkout.session.completed` webhook event
- Cancel returns to sales page
