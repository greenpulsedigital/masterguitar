# Research — Story s01-project-foundation

## Target story

**As a** développeur **I want** un projet Next.js configuré avec la stack complète **so that** je peux commencer à développer les features.

### Acceptance criteria
- [ ] Next.js 14 App Router initialisé
- [ ] Tailwind CSS configuré avec design tokens "studio" (couleurs sombres, accents)
- [ ] Prisma + PostgreSQL configurés
- [ ] Layout de base (header, footer, conteneur)
- [ ] Le projet build sans erreur
- [ ] Les tests unitaires passent (setup Jest/Vitest)

## Current state of the code

### Already done (during /ks-architect)
| Item | Status | Notes |
|------|--------|-------|
| Next.js 16 App Router | Installed | `next@16.2.12` in package.json |
| Tailwind CSS v4 | Installed | `tailwindcss@^4`, Tailwind v4 syntax in globals.css |
| shadcn/ui | Initialized | `components.json` present, Button component installed |
| Prisma | Installed | `prisma@^7.9.1`, empty schema in `prisma/schema.prisma` |
| NextAuth | Installed | `next-auth@^5.0.0-beta.32` |
| Stripe | Installed | `stripe@^22.4.0`, `@stripe/stripe-js@^9.12.1` |

### Not done (this story's work)
| Item | Status | Notes |
|------|--------|-------|
| Electric blue accent | Missing | `globals.css` still has neutral grayscale `--primary` |
| Dark mode default | Missing | `<html>` doesn't have `dark` class |
| Prisma schema | Empty | Only datasource + generator, no models |
| DATABASE_URL | Missing | `.env` exists but likely needs DATABASE_URL |
| Layout (header/footer) | Missing | `layout.tsx` is bare minimal |
| Test setup | Missing | No Vitest/Jest installed, no test scripts |
| Prisma client | Not generated | `src/generated/prisma/` doesn't exist yet |

### Files inventory

```
src/
├── app/
│   ├── globals.css      # Tailwind v4 + shadcn theme (neutral, not studio)
│   ├── layout.tsx       # Minimal RootLayout, Geist fonts, no dark class
│   ├── page.tsx         # Default Next.js starter page (to replace)
│   └── favicon.ico
├── components/ui/
│   └── button.tsx       # shadcn Button (variants: default, outline, secondary, ghost, destructive, link)
└── lib/
    └── utils.ts         # cn() helper for class merging

prisma/
└── schema.prisma        # Empty: just generator + datasource

package.json             # All deps installed, but no "test" script
tsconfig.json            # Standard Next.js config, @/* alias configured
```

## Anchor points

### Where to apply electric blue accent
File: `src/app/globals.css`
- `:root` block (lines 51-84): light mode tokens
- `.dark` block (lines 86-118): dark mode tokens
- Replace `--primary` and `--ring` with `oklch(0.65 0.25 250)` (dark) / `oklch(0.55 0.25 250)` (light)

### Where to set dark mode default
File: `src/app/layout.tsx`
- Add `dark` class to `<html>` element (line 28)

### Where to add layout components
File: `src/app/layout.tsx`
- Wrap `{children}` with header/footer components
- Create: `src/components/header.tsx`, `src/components/footer.tsx`

### Where to define Prisma models
File: `prisma/schema.prisma`
- Add models from `docs/architecture.md` data model section

### Where to add test setup
Files to create:
- `vitest.config.ts`
- `src/__tests__/` directory
- Update `package.json` scripts: add `"test": "vitest"`

## Verified APIs / functions

### shadcn/ui Button
Location: `src/components/ui/button.tsx`
```tsx
function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>)
```
Variants: `default`, `outline`, `secondary`, `ghost`, `destructive`, `link`
Sizes: `xs`, `sm`, `default`, `lg`, `icon`, `icon-xs`, `icon-sm`, `icon-lg`

### cn() helper
Location: `src/lib/utils.ts`
```tsx
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

### Tailwind v4 theme syntax
Location: `src/app/globals.css`
- Uses `@import "tailwindcss"` (not `@tailwind base/components/utilities`)
- Uses `@theme inline {}` for CSS variable mapping
- Uses `@custom-variant dark (&:is(.dark *))` for dark mode

### Fonts
Location: `src/app/layout.tsx`
```tsx
import { Geist, Geist_Mono } from "next/font/google";
const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });
```
Applied via `className={`${geistSans.variable} ${geistMono.variable} ...`}` on `<html>`

## Traps & constraints

### Tailwind v4 breaking changes
- Tailwind v4 uses different syntax: `@import "tailwindcss"` instead of `@tailwind` directives
- Theme config is in CSS (`@theme inline {}`), not `tailwind.config.js`
- The `dark:` variant requires `@custom-variant dark` declaration (already present)

### Prisma 7 client output
- Generator configured with `output = "../src/generated/prisma"`
- Must run `npx prisma generate` after schema changes
- `src/generated/prisma/` is gitignored — will be generated at install time

### Dark mode strategy
- Using class-based dark mode (`.dark` class on `<html>`)
- Setting `dark` class statically for now (no theme toggle in MVP)
- Can add `next-themes` later if light mode needed

### No existing tests
- No test framework installed
- No test scripts in package.json
- This story must set up Vitest from scratch

### Acceptance criteria note: "Next.js 14"
- The project has Next.js **16** (not 14)
- The acceptance criterion says "Next.js 14" but the architecture doc says 16
- This is acceptable — 16 is newer, the criterion should be read as "Next.js App Router"

## Open questions

1. **PostgreSQL instance**: Does the user have a local PostgreSQL or should we use a cloud provider (Neon, Supabase, Vercel Postgres)? The `.env` file exists but DATABASE_URL content is unknown.

2. **Vitest vs Jest**: The stories mention "Jest/Vitest". Architecture doesn't specify. Vitest is recommended for Vite-based projects and modern Next.js. **Recommendation: Vitest** — faster, ESM-native, better DX.

3. **Header/footer design**: The design system exists but doesn't specify the exact header/footer layout. This story should create minimal placeholder components; detailed design comes later.

4. **Prisma models in this story?**: The acceptance criteria don't mention Prisma models, but "Prisma + PostgreSQL configurés" implies the connection should work. **Recommendation**: Add minimal User model to verify connection, leave full schema for s02-prof-auth.
