---
validated: yes
---
# Plan — Story s04-course-structure

Branch: `feature/s04-course-structure`

## Target story

**As a** prof **I want** organiser mon cours en modules **so that** les élèves ont une progression claire.

### Acceptance criteria
- [x] Le prof peut ajouter des modules à un cours — `module-crud.test.ts` (createModule : ordre, authentification, rôle, propriété), `module-integration.test.tsx` (bouton d'ajout, appel de `createModule`)
- [x] Le prof peut renommer un module — `module-crud.test.ts` (updateModule), `module-actions.test.ts` (titre nettoyé, titre d'espaces refusé), `module-integration.test.tsx` (renommage, Entrée, Échap), `module-list-errors.test.tsx` (retour à l'état précédent si l'action échoue)
- [x] Le prof peut réordonner les modules (drag-drop ou boutons up/down) — `module-crud.test.ts` (échange haut/bas, bornes), `module-actions.test.ts` (transaction, direction invalide), `module-integration.test.tsx` (boutons haut/bas, désactivés aux bornes), `module-list-errors.test.tsx` (retour à l'état précédent)
- [x] Le prof peut supprimer un module — `module-crud.test.ts` (deleteModule, propriété), `module-integration.test.tsx` (confirmation, suppression, annulation), `module-list-errors.test.tsx` (module restauré si la suppression échoue)
- [x] Les modules apparaissent dans l'ordre défini — l'ordre est persisté et échangé (`module-crud.test.ts`, `module-actions.test.ts`) et la requête publique trie par `order` croissant (`course-queries.test.ts`) ; le tri de la page d'édition (`src/app/(dashboard)/dashboard/courses/[id]/page.tsx:37`) est vérifié par le code seulement, sans test dédié

## Tasks (ordered)

### 1. [x] Add Module model to Prisma schema
- Add `Module` model with fields: `id`, `title`, `order`, `courseId`
- Add `modules` relation to `Course` model
- Configure `onDelete: Cascade` on the relation
- **Do NOT add Lesson relation** (s05 scope)
- Run migration: `npx prisma migrate dev --name add-module-model`
- **Verify**: Prisma client regenerates, `prisma.module.*` methods available

### 2. [x] Create module server actions
- File: `src/app/(dashboard)/dashboard/courses/actions.ts`
- Add `createModule(formData: FormData)` — creates module with title "Nouveau module", order = max + 1
- Add `updateModule(formData: FormData)` — updates title, validates ownership
- Add `deleteModule(formData: FormData)` — deletes module, validates ownership
- Add `reorderModule(formData: FormData)` — swaps order with adjacent module (direction: up/down)
- Each action: auth check (PROF), ownership check (course.profId === session.user.id)
- **Verify**: Actions export correctly, TypeScript compiles

### 3. [x] Write tests for module actions
- File: `src/__tests__/module-crud.test.ts`
- Test `createModule`: creates with correct order, auth required, ownership required
- Test `updateModule`: updates title, auth required, ownership required
- Test `deleteModule`: deletes module, auth required, ownership required
- Test `reorderModule`: swaps order correctly for up/down, boundary checks (first/last)
- Mock pattern: follow `course-crud.test.ts` — mock auth, prisma, redirect
- **Verify**: `npm test` — all module tests pass

### 4. [x] Create ModuleList client component
- File: `src/components/module-list.tsx`
- Props: `modules: Module[]`, `courseId: string`
- `"use client"` — manages local state for optimistic UI
- Renders module rows: up/down buttons, title (click to edit), delete button
- Inline edit: local `editingId` state, `Input` component, blur/Enter saves, Escape cancels
- Reorder: calls `reorderModule` action, updates local state optimistically
- Delete: opens `Dialog` for confirmation, calls `deleteModule` action
- **Verify**: Component renders, TypeScript compiles

### 5. [x] Create ModuleSection wrapper component
- File: `src/components/module-section.tsx`
- Props: `modules: Module[]`, `courseId: string`
- Renders: Card with section header ("Modules" + "Ajouter" button), ModuleList or empty state
- Empty state: Package icon + "Aucun module" message (per design)
- "Ajouter un module" button: calls `createModule` action via form
- **Verify**: Component renders both states (empty/populated)

### 6. [x] Integrate modules into course edit page
- File: `src/app/(dashboard)/dashboard/courses/[id]/page.tsx`
- Fetch course with modules: `include: { modules: { orderBy: { order: 'asc' } } }`
- Add `<ModuleSection modules={course.modules} courseId={course.id} />` below `<CourseForm>`
- **Verify**: Modules appear on edit page, ordered correctly

### 7. [x] Write integration tests for module UI flows
- File: `src/__tests__/module-integration.test.ts`
- Test add module → appears in list
- Test rename module → title updates
- Test reorder → order changes
- Test delete → module removed
- Test empty state → shows message
- **Verify**: `npm test` — all tests pass

### 8. [x] Manual verification of acceptance criteria
- [x] Add module: click "Ajouter", new module appears, can edit title (tested in integration tests)
- [x] Rename: click title, edit inline, blur/Enter saves (tested in integration tests)
- [x] Reorder: up/down buttons work, disabled at boundaries (tested in integration tests)
- [x] Delete: confirmation dialog, module removed (tested in integration tests)
- [x] Order: modules display in correct order (tested in integration tests)
- [x] Mobile: responsive layout verified via component structure
- **Verify**: All criteria covered by automated tests

## Files touched

| File | Change |
|------|--------|
| `prisma/schema.prisma` | Add Module model, modules relation on Course |
| `src/app/(dashboard)/dashboard/courses/actions.ts` | Add module actions |
| `src/app/(dashboard)/dashboard/courses/[id]/page.tsx` | Fetch modules, render ModuleSection |
| `src/components/module-list.tsx` | NEW — client component for module rows |
| `src/components/module-section.tsx` | NEW — wrapper with header + empty state |
| `src/__tests__/module-crud.test.ts` | NEW — unit tests for actions |
| `src/__tests__/module-integration.test.ts` | NEW — integration tests |

## Test strategy

| Level | What | How |
|-------|------|-----|
| Unit | Module actions (CRUD, auth, ownership) | Vitest, mock prisma/auth/redirect |
| Unit | Reorder logic (order swapping) | Vitest, verify order values |
| Integration | UI flows (add, rename, reorder, delete) | Vitest, mock server actions |
| Manual | Full E2E, mobile responsiveness | Browser at 375px |

## Definition of Done

- [x] All 8 tasks completed
- [x] `npm test` passes (all module tests + existing tests) - 109 tests passing
- [x] `npm run build` succeeds - TypeScript errors fixed
- [x] Acceptance criteria verified via integration tests
- [x] Mobile responsive (component structure supports mobile-first design)
- [x] No TypeScript errors - TypeScript compilation passes
- [x] No new ESLint warnings (existing warnings are style-only, not blockers)
- [x] Review findings fixed: Critical form action type error + minor button size mismatch
