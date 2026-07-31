# Review — Story s01-project-foundation

> Fresh-context review. Each issue classified: critical / major / minor.
> Diff reviewed: `git diff main...feature/s01-project-foundation`

## Plan compliance

- [x] The code does what the plan specifies, nothing more

**Details:**
All 11 tasks from the plan are completed:
1. Electric blue accent in globals.css — DONE (`:root` and `.dark` both updated)
2. Dark mode as default — DONE (`dark` class on `<html>`)
3. Prisma client singleton — DONE (`src/lib/prisma.ts`)
4. User model in Prisma schema — DONE (Role enum + User model)
5. Header component — DONE (`src/components/header.tsx`)
6. Footer component — DONE (`src/components/footer.tsx`)
7. Header/Footer in layout — DONE
8. Home page replaced — DONE
9. Vitest setup — DONE
10. Smoke test — DONE
11. Build verified — DONE (verified by reviewer)

Extra files in diff match expectations:
- `docs/plans/s01-project-foundation.md` — plan file per AGENTS.md
- `docs/research/s01-project-foundation.md` — research file per AGENTS.md
- `package-lock.json` — auto-generated
- `src/__tests__/setup.ts` — required by vitest config

## Anti-hallucination

- [x] No invented API/function/import (each one opened and verified)

**Verified imports:**
- `@/components/header` exports `Header` function — VERIFIED
- `@/components/footer` exports `Footer` function — VERIFIED
- `@/generated/prisma/client` exports `PrismaClient` — VERIFIED
- `vitest/config` exports `defineConfig` — VERIFIED
- `@vitejs/plugin-react` exports `react` — package exists
- `vitest` exports `describe`, `it`, `expect`, `vi` — package exists
- `next/font/google` exports `Geist`, `Geist_Mono` — standard Next.js API (mocked in tests)

- [x] No plausible-but-wrong value or logic
- [x] The code matches what it claims to do

## Rules compliance

- [x] Repo conventions followed (AGENTS.md)

**Checked:**
- File naming: kebab-case (`header.tsx`, `footer.tsx`, `prisma.ts`) — OK
- Component naming: PascalCase (`Header`, `Footer`) — OK
- Absolute imports with `@/` — OK
- No barrel exports — OK
- `@ts-nocheck` in `prisma.ts` has justification — OK

- [x] No accepted ADR contradicted (docs/decisions/)

**ADR compliance:**
- ADR 001: Stack (Next.js 16, Tailwind v4, Prisma, shadcn/ui) — All present
- ADR 002: App Router with Server Components default — No `"use client"` directives
- ADR 003: Auth strategy (Role enum STUDENT/PROF) — Implemented in schema
- ADR 004/005: Not relevant to this story

- [x] Design system respected — components/tokens from docs/design-system.md

**Design system compliance:**
- Electric blue: `oklch(0.65 0.25 250)` dark / `oklch(0.55 0.25 250)` light — MATCHES
- `--ring` same as `--primary` — MATCHES
- Uses semantic tokens (`text-foreground`, `text-muted-foreground`, `bg-background`) — OK
- No invented colors or tokens

## Tests

- [x] Test suite run by the reviewer, passing

```
RUN  v4.1.10 /Users/freydavid/Desktop/masterguitar
Test Files  1 passed (1)
     Tests  1 passed (1)
```

- [x] Assertions pin the acceptance criteria (no assertion-free tests)

The smoke test has 4 assertions:
1. `expect(layoutModule.default).toBeDefined()` — pins layout export
2. `expect(typeof layoutModule.default).toBe("function")` — pins it's a function
3. `expect(layoutModule.metadata).toBeDefined()` — pins metadata export
4. `expect(layoutModule.metadata.title).toBe("MasterGuitar")` — pins exact title

Test strategy in plan explicitly states visual appearance is manual verification.

## Regressions

- [x] No impact on existing code paths

Touched files were either:
- Boilerplate replaced (page.tsx starter content)
- Configuration files (package.json, globals.css) with additive changes
- New files created

Build passes, tests pass.

## Findings

1. **minor** — `src/app/layout.tsx:29` — `lang="en"` but content is in French ("Plateforme d'apprentissage de la guitare en ligne", "Tous droits réservés"). Should be `lang="fr"`.

2. **minor** — `vitest.config.ts` — Vite warning about ESM syntax suggests file should use `.mjs` extension or `"type": "module"` in package.json. Configuration lint, not functional.

---

Max severity: minor
Ship allowed: yes
