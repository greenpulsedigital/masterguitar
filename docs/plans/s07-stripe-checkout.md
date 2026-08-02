---
validated: yes
---
# Plan — Story s07-stripe-checkout

Branch: `feature/s07-stripe-checkout`

## Target story

**As a** élève **I want** acheter un cours par carte bancaire **so that** je peux accéder au contenu.

### Acceptance criteria
- [x] Le bouton "Acheter" redirige vers Stripe Checkout
- [x] Le paiement réussi crée un accès pour l'élève
- [x] Le paiement réussi redirige vers une page de confirmation
- [x] Le webhook Stripe est géré (`checkout.session.completed`)
- [x] Le prof reçoit 100% du montant (moins frais Stripe)

**Note**: AC says `payment_intent.succeeded` but for Stripe Checkout, the correct event is `checkout.session.completed` which contains the metadata we need.

## Tasks (ordered)

### 1. [x] Add Purchase model to schema and run migration
- Add `Purchase` model with `id`, `amount`, `stripePaymentId` (unique), `stripeSessionId`, `userId`, `courseId`, `createdAt`
- Add `purchases Purchase[]` relation to `User` and `Course` models
- Run `prisma migrate dev --name s07_purchase_model`
- **Test**: Schema compiles, migration applies

### 2. [x] Create Stripe client singleton
- Create `src/lib/stripe.ts` with server-side Stripe client
- Use `STRIPE_SECRET_KEY` from environment
- Export typed `stripe` instance
- **Test**: Unit test that client initializes (mock env)

### 3. [x] Add getCourseById query function
- Add to `src/lib/queries/course.ts`
- Returns course with `id`, `title`, `slug`, `price`, `status`, `profId`
- Used for checkout validation (course exists, is published)
- **Test**: Unit test with Prisma mock

### 4. [x] Create checkout server action
- Create `src/app/checkout/actions.ts` with `createCheckoutSession(courseId: string)`
- Validate: user authenticated, course exists and PUBLISHED, user doesn't already own it
- Create Stripe Checkout session with:
  - `mode: "payment"`
  - `line_items`: one item with course title and price
  - `metadata`: `{ courseId, userId }`
  - `success_url`: `/checkout/success?session_id={CHECKOUT_SESSION_ID}`
  - `cancel_url`: `/cours/{slug}`
- Return Stripe session URL for redirect
- **Test**: Unit tests for validation (auth, course status, duplicate purchase)

### 5. [x] Create checkout page route
- Create `src/app/checkout/[courseId]/page.tsx`
- Server Component that:
  - Checks auth → redirect to `/login?callbackUrl=/checkout/{courseId}` if not authenticated
  - Validates course → 404 if not found or not published
  - Checks existing purchase → redirect to success with message if already purchased
  - Renders minimal UI: course name, price, "Proceed to payment" button
  - Button triggers server action and redirects to Stripe
- **Test**: Integration test for auth redirect and course validation

### 6. [x] Create webhook handler
- Create `src/app/api/webhooks/stripe/route.ts`
- POST handler that:
  - Reads raw body (no JSON parsing by Next.js)
  - Verifies Stripe signature using `STRIPE_WEBHOOK_SECRET`
  - Handles `checkout.session.completed` event
  - Extracts `courseId`, `userId` from metadata
  - Creates `Purchase` record (idempotent: skip if `stripeSessionId` exists)
  - Returns 200 OK
- **Test**: Unit test with mock Stripe event, test idempotency

### 7. [x] Create success page
- Create `src/app/checkout/success/page.tsx`
- Server Component that:
  - Reads `session_id` from searchParams
  - Retrieves session from Stripe to get course info
  - Displays confirmation: "Merci pour votre achat!", course title
  - Link to "Mes cours" (future) or back to course page
- Uses design system: Card, Button components
- **Test**: Renders correctly with valid session

### 8. [x] Integration tests for full checkout flow
- Test checkout action with mocked Stripe
- Test webhook with mocked Stripe signature verification
- Test Purchase creation and duplicate prevention
- Verify existing tests still pass (137 tests)

## Files touched

### New files
- `prisma/migrations/YYYYMMDD_s07_purchase_model/migration.sql`
- `src/lib/stripe.ts`
- `src/app/checkout/actions.ts`
- `src/app/checkout/[courseId]/page.tsx`
- `src/app/api/webhooks/stripe/route.ts`
- `src/app/checkout/success/page.tsx`
- `src/__tests__/stripe-client.test.ts`
- `src/__tests__/checkout.test.ts`
- `src/__tests__/webhook.test.ts`

### Modified files
- `prisma/schema.prisma` (Purchase model, relations)
- `src/lib/queries/course.ts` (add getCourseById)

## Test strategy

| Layer | What | How |
|-------|------|-----|
| Unit | Stripe client init | Mock env, verify instance |
| Unit | getCourseById | Mock Prisma |
| Unit | Checkout validation | Mock auth, Prisma, Stripe |
| Unit | Webhook handler | Mock Stripe signature verify, mock Prisma |
| Integration | Checkout flow | Mock Stripe session creation |
| Integration | Purchase creation | Test idempotency |

**Mocking Stripe**: Create test doubles for `stripe.checkout.sessions.create` and `stripe.webhooks.constructEvent`. Don't call real Stripe in tests.

## Definition of Done

- [x] All 8 tasks completed and checked
- [x] Purchase model exists with migration
- [x] "Acheter" button redirects to Stripe Checkout
- [x] Successful payment creates Purchase record
- [x] Success page displays confirmation
- [x] Webhook handles `checkout.session.completed`
- [x] Duplicate purchases prevented
- [x] All tests pass (existing + new) - 175 tests passing
- [x] TypeScript compiles without errors (source files clean)
- [x] No regressions on existing functionality

## Key decisions

1. **Auth required before checkout** (Option A from research) — simpler MVP, no guest checkout
2. **Prevent duplicate purchases** — check at checkout initiation
3. **Cancel returns to sales page** — no dedicated cancel page
4. **Use `checkout.session.completed`** — not `payment_intent.succeeded` (metadata available)
5. **Store `stripeSessionId`** — for idempotency in webhook handling
