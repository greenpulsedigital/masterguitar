# ADR 002 — Next.js App Router

- Status: accepted
- Date: 2026-07-31
- Scope: framing

## Context

Next.js offre deux modes : Pages Router (legacy) et App Router (moderne). Le projet démarre de zéro, pas de migration à gérer.

## Decision

**App Router** avec Server Components par défaut.

Structure :
- Route groups `(auth)`, `(dashboard)`, `(public)` pour organiser sans affecter l'URL
- `layout.tsx` pour les layouts partagés (sidebar dashboard, etc.)
- `loading.tsx` pour les états de chargement
- `error.tsx` pour la gestion d'erreurs
- Server Actions pour les mutations (formulaires)

## Considered options

- **App Router** — retenu. RSC, streaming, layouts, parallel routes, Server Actions.
- Pages Router — rejeté. Legacy, moins performant, pas de Server Components.

## Consequences

- Tous les composants sont Server Components par défaut. Ajouter `"use client"` uniquement pour interactivité (state, effects, events).
- Les données se fetchent dans les Server Components, pas via `useEffect`.
- Les formulaires utilisent Server Actions, pas d'API routes pour les mutations simples.
- Attention au cache : `revalidatePath()` / `revalidateTag()` pour invalider après mutation.
