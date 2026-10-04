# Review — Story s07-stripe-checkout

> Fresh-context review. Each issue classified: critical / major / minor.
> Third review: `main` at `c181313` (2026-10-04), after PR #12 (webhook hardening), #14 (design), #15 (design gaps) and #18 (double-payment alert).
> It supersedes the review of `7d5458f` (verdict "major / Ship allowed: no") and the first review ("minor / Ship allowed: yes").

## Plan compliance
- [x] The code does what the plan specifies, nothing more — the 8 planned tasks are done, plus the hardening added by PR #12 and #18.
- [ ] Acceptance criterion "Le prof reçoit 100% du montant (moins frais Stripe)" is **not met** and is now unchecked in the plan. On 2026-10-04 ADR 004 decided **one Stripe account per prof, no Stripe Connect**; the code still uses a single platform key (`src/lib/stripe.ts:3-8`, `src/app/checkout/actions.ts:50-72`), so the money lands on the platform account. See finding 1.

## Anti-hallucination
- [x] No invented API/function/import (Stripe SDK calls, `checkout.session.async_payment_succeeded`, Prisma `upsert` on `PaymentIssue`, API version `2026-07-29.dahlia` at `src/lib/stripe.ts:8`).
- [x] No plausible-but-wrong logic found in the payment path itself.

## Rules compliance
- [x] Repo conventions followed (AGENTS.md).
- [x] ADR 004 is now decided on the payout model (one Stripe account per prof). The **code contradicts it** until the dedicated story is delivered; this is recorded as finding 1, not as an ADR violation by the original implementation (the ADR was open when s07 was written).
- [x] Design: `docs/designs/s07-stripe-checkout.md` and `.html` exist (PR #14). The gaps listed there were fixed in PR #15 (`h-11` buttons, `role="alert"`, `aria-busy`, `formatPrice`, course title on the pending page). Remaining known gaps, all outside this story's primitives: `CardTitle` is a `div`, `Button size="lg"` is 36 px in the shared primitive, `already_purchased=true` does not know the course.

## Tests
- [x] Run by the reviewer on `main` at `c181313`: `npx vitest run` → **43 files, 256 tests passed**. `npx tsc --noEmit` clean.
- [x] ESLint on `src/app/checkout`, `src/app/api`, `src/lib`: no error in the s07 code; one warning (unused `err`, `src/app/checkout/[courseId]/checkout-button.tsx:31`) and one pre-existing error in `src/lib/auth.ts:51` (`no-explicit-any`, from s02). The tests contain many `as any` casts that ESLint flags too.
- [x] Assertions pin the acceptance criteria and the hardening: unpaid session ignored, delayed payment, `payment_intent` string/object/null, amount, currency, unknown course/user, replay, concurrent replay (`P2002` with an existing purchase for the session → 200, no alert), real double payment (`P2002` without purchase → `PaymentIssue` upsert + `[PAYMENT_ALERT]` + 200), alert write failure (500), no automatic refund, raw body + signature + secret forwarded to `constructEvent`, success page (paid / unpaid / other user / unauthenticated), prof buying own course, free course.
- [ ] Gaps: no test for a request **without** the `stripe-signature` header (`route.ts:8-12`); no test for a `P2002` caused by `stripePaymentId` rather than `(userId, courseId)`; the Prisma client is mocked everywhere, so the unique constraints and migrations are never exercised against a real database, and concurrent deliveries are only simulated sequentially.

## Regressions
- [x] No impact on existing code paths. Public sales page and lesson data are untouched; `PaymentIssue` has no relation to existing models.

## Status of the findings of the previous review

| Previous finding | Status | Where |
|---|---|---|
| Double payment answered 200 and only logged | **Fixed** (PR #18): `PaymentIssue` upsert (idempotent on `stripeSessionId`), `[PAYMENT_ALERT]` log, 500 if the write fails, no automatic refund | `src/app/api/webhooks/stripe/route.ts:96-133`, `prisma/schema.prisma` (`PaymentIssue`) |
| Paid amount not compared with the course price | **Open, deliberate**: only `> 0` and currency `eur` are checked | `route.ts:46-54` |
| "Prof receives 100%" not demonstrated | **Open**: decided (one account per prof), not implemented | finding 1 |
| Success page does not check that the `Purchase` exists | **Open** | `src/app/checkout/success/page.tsx:60-90` |
| `already_purchased=true` reachable without authentication | **Open** (generic message, no data) | `success/page.tsx:16-30` |
| Refunds not reflected in the database | **Open**, accepted by ADR 004 for the MVP | `docs/decisions/004-payment-flow.md` |
| No test without `stripe-signature` | **Open** | `src/__tests__/stripe-webhook.test.ts` |
| Design file missing | **Fixed** (PR #14, gaps PR #15) | `docs/designs/s07-stripe-checkout.md` |
| Deployment prerequisites | **Open** (see finding 3) | migrations `20261004120000_*`, `20261004140000_*` |

## Findings

| Severity | File | Issue |
|----------|------|-------|
| **major** | `src/lib/stripe.ts:3-8`, `src/app/checkout/actions.ts:50-72`, `src/app/api/webhooks/stripe/route.ts` | **Per-prof Stripe account decided but not implemented.** Checkout sessions are created with the single platform key (`STRIPE_SECRET_KEY`) and the webhook verifies a single `STRIPE_WEBHOOK_SECRET`; nothing stores a Stripe account or key per prof. Today the platform collects the money, which is what ADR 004 now rules out and what the PRD's "0% commission, the prof keeps 100%" promise forbids. Needs a dedicated story (see Verdict). |
| **major** | Deployment (`prisma/migrations/20261004120000_s07_purchase_unique_user_course`, `20261004140000_s07_payment_issue`) | Both migrations are not applied anywhere yet (`prisma migrate status` on the local database confirms it). Before `prisma migrate deploy`, check for existing `(userId, courseId)` duplicates, which would make the unique index fail. The Stripe endpoint must also be subscribed to `checkout.session.async_payment_succeeded`, and `NEXT_PUBLIC_APP_URL` set in production. |
| minor | `docs/decisions/004-payment-flow.md`, `prisma/schema.prisma` (`PaymentIssue`) | Nothing moves a `PaymentIssue` from `OPEN` to `RESOLVED` (the `upsert` deliberately keeps the existing status with `update: {}`), and no screen lists them. The workflow is manual (query the table, refund in the Stripe dashboard, update the row by hand), but the exact steps are not written down. |
| minor | `src/app/api/webhooks/stripe/route.ts:96-119` | A `P2002` is classified as `DUPLICATE_PURCHASE` without looking at which constraint failed (`error.meta.target`). A `P2002` on `stripePaymentId` would be recorded the same way. Unlikely in practice (two sessions do not share a `payment_intent`), but untested. |
| minor | `prisma/schema.prisma` (`PaymentIssue`) | Only a unique index on `stripeSessionId`; no index on `userId`, `courseId`, `status` or `createdAt`, and no relations. Fine for a few rows, awkward for operations later. |
| minor | `src/app/api/webhooks/stripe/route.ts:122-147` | The alert log carries session, payment intent, user, course and amount identifiers: acceptable, but subject to your log retention/access policy. |
| minor | `src/app/api/webhooks/stripe/route.ts:46-54` | The paid amount is not compared with the course price. Deliberate: the session is built server-side from the database price and signed by Stripe, and comparing with the *current* price would reject legitimate payments after a price change. Documented, not a defect. |
| minor | `src/app/checkout/success/page.tsx:60-90` | The confirmation does not check that the `Purchase` exists yet; it can say "accès" while the webhook is late. |
| minor | `src/app/checkout/success/page.tsx:16-31` | `already_purchased=true` is reachable without authentication (no data leaked). |
| minor | `src/__tests__/stripe-webhook.test.ts` | Missing tests listed under "Tests". |

## Verdict

The payment path itself is in good shape: access is granted only for a confirmed payment, replays and real double payments are told apart and the latter are recorded and alerted, the success page no longer misleads, the design exists and the code follows it. 256 tests, `tsc` and the build pass.

Shipping stays blocked because of what the payment is *for*, not how it is processed:
1. **Per-prof Stripe accounts must be implemented.** This is a new story, not a patch to s07. It needs to settle: encrypted storage of each prof's keys (never sent to the client) and verification at entry; choosing the account at checkout from the course's `profId`; one webhook secret per prof and an endpoint that identifies the prof before checking the signature; what happens while a prof has not configured Stripe (the course cannot be bought); and subscriptions, which ADR 004 also plans.
2. **Deployment prerequisites** (finding 2) must be done and checked.

An interim option, if you need to ship before that story: keep the platform account, but then the "0% commission / prof keeps 100%" promise is broken and payouts must be handled outside the application — this contradicts ADR 004 and is not recommended.

Max severity: major
Ship allowed: no
