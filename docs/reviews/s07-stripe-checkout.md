# Review — Story s07-stripe-checkout

> Fresh-context review. Each issue classified: critical / major / minor.
> Re-review of `main` at `7d5458f` (2026-10-04), after the fixes merged in PR #12.
> The first review (diff `main...feature/s07-stripe-checkout`, verdict "Ship allowed: yes") is superseded by this one.

## Plan compliance
- [x] The code does what the plan specifies, nothing more

The 8 tasks from the plan are completed (Purchase model + migration, Stripe client `src/lib/stripe.ts`, `getCourseById`, checkout action, checkout page, webhook, success page, integration tests).

PR #12 added behaviour beyond the original plan, all of it hardening:
- `@@unique([userId, courseId])` on `Purchase` + migration `20261004120000_s07_purchase_unique_user_course`
- Refusal of free courses and of a prof buying their own course (`src/app/checkout/actions.ts:29-36`, `src/app/checkout/[courseId]/page.tsx:28-35`)
- `src/lib/app-url.ts`: `NEXT_PUBLIC_APP_URL` required in production

## Anti-hallucination
- [x] No invented API/function/import (each one opened and verified)

Verified against the current code:
- `stripe.checkout.sessions.create` / `retrieve`, `stripe.webhooks.constructEvent`, `Stripe.Checkout.Session`
- Event `checkout.session.async_payment_succeeded` (handled in `src/app/api/webhooks/stripe/route.ts:26-29`)
- Stripe API version `2026-07-29.dahlia` (`src/lib/stripe.ts:8`)

- [x] No plausible-but-wrong value or logic — see findings for the residual risks below

## Rules compliance
- [x] Repo conventions followed (AGENTS.md): Server Components by default, `"use client"` only for `CheckoutButton`, Server Action for the mutation, `@/` imports, `params`/`searchParams` awaited as Promises.
- [x] No accepted ADR contradicted — with one open point: ADR 004 still leaves undecided whether each prof has their own Stripe account or the platform has a single account that reverses to profs (see finding 3).
- [ ] Design: **not satisfied.** The story has UI (`src/app/checkout/[courseId]/page.tsx`, `src/app/checkout/success/page.tsx`) but there is no `docs/designs/s07-stripe-checkout.md` nor mockup, while AGENTS.md requires a design file for stories with UI (see s06, which has both `.md` and `.html`). The first review called this "acceptable"; it is a pipeline gap. Components and tokens used are all from the existing design system.

## Tests
- [x] Test suite run by the reviewer, passing: `npx vitest run` on `main` at `7d5458f` → **43 files, 252 tests passed** (the "175 tests" of the first review is outdated).
- [x] `npx tsc --noEmit` passes; ESLint is clean on the checkout files except a pre-existing unused-variable warning in `src/app/checkout/[courseId]/checkout-button.tsx:31`.
- [x] Assertions pin the acceptance criteria:
  - Session creation with correct metadata, authentication required, `PUBLISHED` required, duplicate purchase refused, prof cannot buy own course, free course refused
  - Webhook: unpaid session ignored, delayed payment (`async_payment_succeeded`) creates the purchase, `payment_intent` as string / object / null, zero amount, wrong currency, unknown course, unknown user, replay (`findUnique`) and concurrent replay (`P2002`) both answered 200, raw body + signature + secret forwarded to `constructEvent`
  - Success page: paid / unpaid session, session of another user, unauthenticated user
- [ ] Gap: no test for a request **without** the `stripe-signature` header, although `route.ts:8-12` handles it (400).
- Limit: the Prisma client is mocked everywhere, so the real unique constraints and the migration are not exercised by tests. The migration was checked with `prisma migrate diff` (no difference with the schema), not applied to a database in this review.

## Regressions
- [x] No impact on existing code paths. Existing checkout tests were updated for the new webhook rules (`payment_status`, `currency`, user/course lookups); the rest of the suite is unchanged.

## Corrections of the first review verified in the code

| Previous finding / risk | Status | Where |
|---|---|---|
| `payment_intent as string` could fail on object/null | **Fixed** | `route.ts:56-64` (string, expanded object, null → 400) |
| Webhook granted access without checking payment | **Fixed** | `route.ts:33-36` requires `payment_status === "paid"`; `async_payment_succeeded` handled |
| No check on currency / amount / course / user | **Fixed** (amount only partially, see finding 2) | `route.ts:46-73` |
| Double purchase (race) possible | **Fixed** | `schema.prisma:87`, migration, `P2002` handled at `route.ts:99-105` |
| Prof could buy own course; free course reached Stripe | **Fixed** | `actions.ts:29-36`, `[courseId]/page.tsx:28-35` |
| `localhost` fallback for success/cancel URLs in production | **Fixed** | `src/lib/app-url.ts` |
| Success page showed "paid" for any `session_id` | **Fixed** | `success/page.tsx:39-60`: login required, session must belong to the user, unpaid shows "Paiement en attente" |
| `redirect()` inside `try/catch` on the success page | **Fixed** | `success/page.tsx:44-54` |

## Findings

| Severity | File | Issue |
|----------|------|-------|
| **major** | `src/app/api/webhooks/stripe/route.ts:99-105` | A `P2002` is answered 200 and only logged. If a second payment for an already-owned course goes through (concurrent checkouts, or an old session paid late), Stripe has captured the money, no access is created, and nothing alerts anyone: the refund relies on someone reading the logs. Needs an alert/record (e.g. a flagged table or a monitored log) or an automatic refund. |
| **major** | `src/app/api/webhooks/stripe/route.ts:46-49, 66-69` | The paid amount is only checked to be `> 0`; it is not compared with the course price. Deliberate: the session is created server-side from the database price and signed by Stripe, and comparing with the *current* price would reject legitimate payments if the prof changes the price between session creation and payment. The consequence is that a price change mid-checkout is accepted silently. Acceptable if documented; a stricter option is to store the expected amount in the session metadata and compare with that. |
| **major** | `src/lib/stripe.ts:6-9`, `src/app/checkout/actions.ts:52-75`, `docs/plans/s07-stripe-checkout.md:17` | The acceptance criterion "the prof receives 100% (minus Stripe fees)" is **not demonstrated by the code**. Payments go to the single platform Stripe account (global `STRIPE_SECRET_KEY`); there is no Stripe Connect, no per-prof account, no transfer. ADR 004 (lines 20, 41, 45) rules out Connect and leaves open whether each prof uses their own Stripe account or the platform reverses payouts. The first review marked this criterion as met; it depends on an undecided product/legal point. |
| minor | `src/app/checkout/success/page.tsx:60-90` | The page confirms the Stripe payment but does not check that the `Purchase` row exists yet. It can say "vous avez maintenant accès" while the webhook is late or failed. |
| minor | `src/app/checkout/success/page.tsx:17-31` | The `already_purchased=true` branch is reachable without authentication. It leaks no data, but the page is not fully authenticated as the fix suggests. |
| minor | `docs/decisions/004-payment-flow.md:48` | Refunds are manual in the Stripe dashboard and are not reflected in the database: a refunded `Purchase` keeps its access. Consistent with the ADR for the MVP, but must be known. |
| minor | `src/__tests__/stripe-webhook.test.ts` | No test for the missing `stripe-signature` header (see Tests). |
| minor | `docs/designs/s07-stripe-checkout.md` | Missing design file for a story with UI (see Rules compliance). |
| minor | Deployment | Not code, but required for the webhook to work: subscribe the Stripe endpoint to `checkout.session.async_payment_succeeded`, set `NEXT_PUBLIC_APP_URL` in production, run `prisma migrate deploy` (fails if `(userId, courseId)` duplicates already exist). |

## Verdict

The security and idempotency problems of the first version are fixed and covered by tests: access is granted only after a confirmed payment, replays and double purchases are handled, and the success page no longer shows a misleading confirmation.

Shipping is still blocked by items that are decisions or safeguards rather than regressions:
1. the "prof receives 100%" criterion depends on an open decision in ADR 004 (own Stripe account per prof vs. platform account with payouts);
2. a double payment ends in a silent 200 with no alert or refund path;
3. the design file required by AGENTS.md for a story with UI is missing.

Moving to `Ship allowed: yes` requires: the payout model decided and written in ADR 004 (or the criterion removed from the plan), an alert or refund path for the `P2002` case, and the design file (or an explicit waiver recorded in the plan).

Max severity: major
Ship allowed: no
