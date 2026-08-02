# Review — Story s07-stripe-checkout

> Fresh-context review. Each issue classified: critical / major / minor.
> Diff reviewed: `git diff main...feature/s07-stripe-checkout`

## Plan compliance
- [x] The code does what the plan specifies, nothing more

All 8 tasks from the plan are completed:
1. Purchase model added with migration
2. Stripe client singleton created (`src/lib/stripe.ts`)
3. getCourseById query function added (`src/lib/queries/course.ts`)
4. Checkout server action created (`src/app/checkout/actions.ts`)
5. Checkout page route created (`src/app/checkout/[courseId]/page.tsx`)
6. Webhook handler created (`src/app/api/webhooks/stripe/route.ts`)
7. Success page created (`src/app/checkout/success/page.tsx`)
8. Integration tests written

## Anti-hallucination
- [x] No invented API/function/import (each one opened and verified)

Verified imports:
- `Stripe from "stripe"` - package exists at version 22.4.0 in package.json
- `stripe.checkout.sessions.create` - verified exists in Stripe SDK v22
- `stripe.checkout.sessions.retrieve` - verified exists
- `stripe.webhooks.constructEvent` - verified exists
- `Stripe.Checkout.Session` type - verified exists
- `@/lib/auth` - exports `auth()` function (verified)
- `@/lib/prisma` - exports `prisma` singleton (verified)
- `@/lib/stripe` - exports `stripe` (new file, verified)
- `@/lib/queries/course` - exports `getCourseById` (verified)
- `@/components/ui/button` - exports `Button` (verified)
- `@/components/ui/card` - exports `Card, CardContent, CardHeader, CardTitle` (verified)
- Stripe API version "2026-07-29.dahlia" - matches node_modules/stripe/cjs/apiVersion.d.ts

- [x] No plausible-but-wrong value or logic
- [x] The code matches what it claims to do

## Rules compliance
- [x] Repo conventions followed (AGENTS.md)
  - Server Components by default (checkout page, success page)
  - `"use client"` only for CheckoutButton which needs useState
  - Server Actions for mutations (createCheckoutSession)
  - Absolute imports using `@/` alias
  - kebab-case file names
  - PascalCase components
  - camelCase functions
  - Next.js 16 params/searchParams as Promise - correctly awaited

- [x] No accepted ADR contradicted (docs/decisions/)
  - ADR 004 specifies: Stripe Checkout (hosted) for MVP, webhook `checkout.session.completed`, idempotent webhook handling, Purchase model - all implemented correctly

- [x] Design system respected — components/tokens from docs/design-system.md
  - Uses `Card`, `CardHeader`, `CardTitle`, `CardContent`, `Button` from shadcn/ui
  - Uses semantic color tokens (`text-primary`)
  - No custom/invented tokens
  - Note: No design file for s07 (minimal checkout UI using existing components - acceptable)

## Tests
- [x] Test suite run by the reviewer, passing (175 tests pass)
- [x] Assertions pin the acceptance criteria (no assertion-free tests)
  - Tests verify checkout session creation with correct metadata
  - Tests verify authentication requirement
  - Tests verify course status validation (PUBLISHED required)
  - Tests verify duplicate purchase prevention
  - Tests verify webhook idempotency
  - Tests verify signature verification error handling

## Regressions
- [x] No impact on existing code paths
  - Only additive changes (new files, new Purchase model)
  - Existing tests still pass alongside new tests (175 total)

## Findings

| Severity | File | Issue |
|----------|------|-------|
| **minor** | `src/app/api/webhooks/stripe/route.ts:55` | `payment_intent as string` type assertion could fail if payment_intent is an object or null. For Checkout Sessions with one-time payments it should always be a string, but a defensive null check would be safer. |
| **minor** | `src/__tests__/stripe-webhook.test.ts` | Missing test for absent `stripe-signature` header. The code handles this case correctly (returns 400), but test coverage is incomplete. |
| **minor** | `docs/designs/s07-stripe-checkout.md` | No design file exists. AGENTS.md states "Stories without UI skip /ks-design" but this story has minimal UI. The UI uses only existing design system components, so this is acceptable for MVP. |

## Verdict

The implementation is solid. All acceptance criteria are met:
- ✅ Buy button redirects to Stripe Checkout (via server action)
- ✅ Successful payment creates Purchase record (via webhook)
- ✅ Success page displays confirmation
- ✅ Webhook handles `checkout.session.completed` correctly
- ✅ Prof receives 100% (no Stripe Connect, payments go to platform account)

The previous critical issues (params/searchParams not awaited, session typed as `any`) have been fixed:
- `params` is now `Promise<{ courseId: string }>` and awaited
- `searchParams` is now `Promise<{ session_id?: string; already_purchased?: string }>` and awaited
- Session is now typed as `Stripe.Checkout.Session` with proper null checks

Build passes. TypeScript compiles. All 175 tests pass.

Max severity: minor
Ship allowed: yes
