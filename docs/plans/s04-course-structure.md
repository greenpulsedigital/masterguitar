---
validated: yes
---
# Plan — Story s04-course-structure

Branch: `feature/s04-course-structure`

## Target story

**As a** prof **I want** organiser mon cours en modules **so that** les élèves ont une progression claire.

### Acceptance criteria
- [ ] Le prof peut ajouter des modules à un cours
- [ ] Le prof peut renommer un module
- [ ] Le prof peut réordonner les modules (drag-drop ou boutons up/down)
- [ ] Le prof peut supprimer un module
- [ ] Les modules apparaissent dans l'ordre défini

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

### 7. [ ] Write integration tests for module UI flows
- File: `src/__tests__/module-integration.test.ts`
- Test add module → appears in list
- Test rename module → title updates
- Test reorder → order changes
- Test delete → module removed
- Test empty state → shows message
- **Verify**: `npm test` — all tests pass

### 8. [ ] Manual verification of acceptance criteria
- [ ] Add module: click "Ajouter", new module appears, can edit title
- [ ] Rename: click title, edit inline, blur/Enter saves
- [ ] Reorder: up/down buttons work, disabled at boundaries
- [ ] Delete: confirmation dialog, module removed
- [ ] Order: modules display in correct order
- [ ] Mobile: responsive layout at 375px width
- **Verify**: All criteria met manually

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

- [ ] All 8 tasks completed
- [ ] `npm test` passes (all module tests + existing tests)
- [ ] `npm run build` succeeds
- [ ] Acceptance criteria verified manually
- [ ] Mobile responsive (tested at 375px width)
- [ ] No TypeScript errors
- [ ] No new ESLint warnings
