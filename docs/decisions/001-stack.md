# ADR 001 — Stack technique

- Status: accepted
- Date: 2026-07-31
- Scope: framing

## Context

MasterGuitar est une plateforme de cours en ligne pour profs de guitare. Le PRD impose Next.js + React. Il faut choisir le reste de la stack : styling, DB, auth, payments.

Contraintes :
- Solo developer
- Mobile-first
- Design premium "studio"
- Paiements Stripe (critère de succès : 0% commission plateforme)

## Decision

Stack retenue :
- **Next.js 16 App Router** + TypeScript
- **Tailwind CSS v4** + **shadcn/ui** (base-nova)
- **Prisma** + **PostgreSQL**
- **NextAuth.js v5** (Credentials provider)
- **Stripe** (Checkout + Subscriptions)

## Considered options

### Styling
- **Tailwind + shadcn/ui** — retenu. Components accessibles, theming CSS variables, RSC compatible.
- CSS Modules — rejeté. Pas de système de design, maintenance plus lourde.
- Chakra UI — rejeté. Bundle size, moins RSC-friendly.

### Database
- **Prisma + PostgreSQL** — retenu. Type safety, migrations, écosystème mature.
- Drizzle + PostgreSQL — rejeté. Plus léger mais moins d'outillage (studio, seed).
- MongoDB — rejeté. Relations complexes (courses → modules → lessons), SQL plus adapté.

### Auth
- **NextAuth.js v5** — retenu. Intégration Next.js native, session JWT, middleware.
- Better Auth — rejeté. Plus récent, moins de docs, risque.
- Auth0 / Clerk — rejeté. Coût supplémentaire, dépendance externe.

### Payments
- **Stripe** — imposé par le PRD. Checkout hosted pour MVP, Elements pour custom plus tard.

## Consequences

- Tailwind v4 utilise la nouvelle syntaxe CSS (`@theme`, `@import "tailwindcss"`). Lire la doc avant de modifier `globals.css`.
- NextAuth v5 est en beta — suivre les breaking changes.
- shadcn/ui demande d'installer chaque composant individuellement (`npx shadcn add button`).
- Prisma génère le client dans `src/generated/prisma/` — ce dossier est gitignored, regénéré à chaque `prisma generate`.
