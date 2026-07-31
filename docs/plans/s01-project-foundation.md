---
validated: yes
---
# Plan — Story s01-project-foundation

Branch: `feature/s01-project-foundation`

## Target story

**As a** développeur **I want** un projet Next.js configuré avec la stack complète **so that** je peux commencer à développer les features.

### Acceptance criteria
- [x] Next.js App Router initialisé (done during /ks-architect)
- [x] Tailwind CSS configuré avec design tokens "studio" (couleurs sombres, accent bleu électrique)
- [x] Prisma + PostgreSQL configurés (schema minimal + connexion vérifiée)
- [x] Layout de base (header, footer, conteneur)
- [x] Le projet build sans erreur
- [x] Les tests unitaires passent (setup Vitest)

## Tasks (ordered)

1. [x] **Apply electric blue accent in globals.css**
   - Update `--primary` and `--ring` in `:root` to `oklch(0.55 0.25 250)`
   - Update `--primary` and `--ring` in `.dark` to `oklch(0.65 0.25 250)`
   - Verify: Button component renders with blue accent

2. [x] **Set dark mode as default**
   - Add `dark` class to `<html>` element in `src/app/layout.tsx`
   - Update metadata (title: "MasterGuitar", description)
   - Verify: page background is dark (#1a1a1a), text is light

3. [x] **Create Prisma client singleton**
   - Create `src/lib/prisma.ts` with singleton pattern for dev hot reload
   - Add `DATABASE_URL` placeholder to `.env.example`
   - Verify: file exists and exports `prisma` client

4. [x] **Add minimal User model to Prisma schema**
   - Add `User` model with `id`, `email`, `passwordHash`, `name`, `role`, `createdAt`, `updatedAt`
   - Add `Role` enum (`STUDENT`, `PROF`)
   - Run `prisma generate` to verify schema is valid
   - Verify: `src/generated/prisma/` is created (gitignored)

5. [x] **Create placeholder Header component**
   - Create `src/components/header.tsx`
   - Logo text "MasterGuitar" + nav placeholder
   - Mobile-first: simple top bar, sticky
   - Verify: component renders without error

6. [x] **Create placeholder Footer component**
   - Create `src/components/footer.tsx`
   - Copyright text + links placeholder
   - Mobile-first: centered, minimal
   - Verify: component renders without error

7. [x] **Integrate Header/Footer in root layout**
   - Import and render Header/Footer in `src/app/layout.tsx`
   - Wrap children in main container with proper spacing
   - Verify: header visible at top, footer at bottom, content between

8. [x] **Replace default home page**
   - Update `src/app/page.tsx` with simple welcome message
   - Use design system tokens (bg-background, text-foreground)
   - Verify: no Next.js starter content remains

9. [x] **Setup Vitest**
   - Install: `vitest`, `@vitejs/plugin-react`, `@testing-library/react`, `@testing-library/dom`, `jsdom`
   - Create `vitest.config.ts` with jsdom environment
   - Add `"test": "vitest"` script to package.json
   - Verify: `npm test` runs without error

10. [x] **Add smoke test**
    - Create `src/__tests__/smoke.test.ts`
    - Test: "app exports without error" (import layout, check it exists)
    - Verify: `npm test` passes

11. [x] **Verify build**
    - Run `npm run build`
    - Verify: build completes without error
    - Verify: no TypeScript errors

## Files touched

**Modified:**
- `src/app/globals.css` — electric blue accent tokens
- `src/app/layout.tsx` — dark class, header/footer integration, metadata
- `src/app/page.tsx` — replace default content
- `prisma/schema.prisma` — add User model
- `package.json` — add test script + vitest deps

**Created:**
- `src/lib/prisma.ts` — Prisma client singleton
- `src/components/header.tsx` — Header component
- `src/components/footer.tsx` — Footer component
- `vitest.config.ts` — Vitest configuration
- `src/__tests__/smoke.test.ts` — Smoke test
- `.env.example` — Environment variables template

## Test strategy

**Level:** Unit tests only (no E2E for this foundation story)

**What to test:**
- Smoke test: app modules can be imported without error
- (Future stories will add component tests as features are built)

**What NOT to test:**
- Visual appearance (manual verification)
- Prisma connection (requires real DB, tested manually)

## Definition of Done

- [x] All 11 tasks completed
- [x] `npm run build` passes
- [x] `npm test` passes (1 smoke test)
- [x] Dark theme with blue accent visible on page
- [x] Header and footer render on home page
- [x] Prisma schema valid (`prisma generate` succeeds)
- [x] No TypeScript errors
- [x] Committed to `feature/s01-project-foundation` branch
