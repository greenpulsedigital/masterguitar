# ADR 007: Light-only "Bois & Ambre" Theme

## Status
Accepted — supersedes the dark "Studio" identity set during s01-project-foundation.

## Context

The initial design system (docs/prd.md, "Design premium 'studio'") set a dark-by-default theme with an electric blue accent, meant to read as premium/tech-forward. In practice this reads more like a generic SaaS dashboard than a space built for musicians, and the owner wants the site to feel lighter and more welcoming.

There was never a theme toggle or `next-themes` integration — `src/app/layout.tsx` hardcoded `className="dark ..."` on `<html>`, so every visitor saw the dark theme regardless of OS preference.

## Decision

Replace the dark "Studio" identity with a single light theme, "Bois & Ambre" (wood & amber): warm cream background, near-black-brown text, amber/wood-toned accent evoking a guitar's finish. Drop dark mode entirely rather than keeping it as a togglable option.

Implementation:
- `src/app/globals.css`: `:root` tokens replaced with the Bois & Ambre palette; the `.dark` override block removed.
- `src/app/layout.tsx`: `dark` class removed from `<html>`.
- `@custom-variant dark (&:is(.dark *))` is left in place (unused) so any `dark:` utility classes still present in shadcn primitives stay inert rather than reactivating via `prefers-color-scheme`.
- `docs/design-system.md` updated to document the new tokens and identity.

## Alternatives Considered

| Option | Rejected because |
|--------|-------------------|
| Keep dark as default, add light as togglable alternative | Doubles the token/maintenance surface for a solo MVP; owner explicitly asked to drop dark, not add a switch |
| Light as default, dark kept behind a toggle | Same reasoning — no current use case (e.g. video player at night) strong enough to justify a `next-themes` integration + testing both themes for every future component |
| Cooler/neutral light palette (grays only) | Reads as generic SaaS again — the amber accent is what ties the palette to "guitar/wood/musician" instead of a template look |

## Consequences

### Positive
- Simpler design system: one palette to keep consistent, no dark-mode edge cases to test per component going forward
- Visual identity now differentiates from generic dark SaaS templates, aligned with "designed for musicians" positioning

### Negative
- No dark mode for low-light use (e.g. watching a lesson video at night) — acceptable for MVP scope
- Every existing screenshot/mockup referencing the old dark theme is now stale

### Mitigation
- If dark mode is wanted later, reintroducing it means re-adding a `.dark` block + a real toggle (`next-themes` or equivalent) — this ADR would then be superseded, not amended
