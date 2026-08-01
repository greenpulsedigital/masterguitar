---
validated: yes
---
# Plan — Story s05-video-lessons

Branch: `feature/s05-video-lessons`

## Target story

**As a** prof **I want** ajouter des leçons vidéo à mes modules **so that** les élèves peuvent apprendre.

### Acceptance criteria
- [x] Le prof peut ajouter une leçon à un module
- [x] La leçon a un titre, une description, une URL vidéo externe
- [x] Le prof peut réordonner les leçons dans un module
- [x] Le prof peut modifier ou supprimer une leçon
- [x] La vidéo s'affiche en preview dans l'éditeur

## Tasks (ordered)

### 1. [x] Add Lesson model to Prisma schema
- Add `Lesson` model with fields: `id`, `title`, `description` (optional), `videoUrl` (optional), `order`, `moduleId`
- Add `lessons` relation to `Module` model
- Configure `onDelete: Cascade` on the Module relation
- **Do NOT add `tabUrl` or `progress` relation** (s14 and s10 scope)
- Run migration: `npx prisma migrate dev --name add-lesson-model`
- **Verify**: Prisma client regenerates, `prisma.lesson.*` methods available

### 2. [x] Create lesson server actions
- File: `src/app/(dashboard)/dashboard/courses/actions.ts`
- Add `createLesson(formData: FormData)` — creates lesson with title "Nouvelle leçon", order = max + 1
- Add `updateLesson(formData: FormData)` — updates title, description, videoUrl; validates ownership
- Add `deleteLesson(formData: FormData)` — deletes lesson, validates ownership
- Add `reorderLesson(formData: FormData)` — swaps order with adjacent lesson (direction: up/down)
- Each action: auth check (PROF), ownership check via `lesson.module.course.profId === session.user.id`
- **Verify**: Actions export correctly, TypeScript compiles

### 3. [x] Write unit tests for lesson actions
- File: `src/__tests__/lesson-crud.test.ts`
- Test `createLesson`: creates with correct order, auth required, ownership required
- Test `updateLesson`: updates all fields, auth required, ownership required
- Test `deleteLesson`: deletes lesson, auth required, ownership required
- Test `reorderLesson`: swaps order correctly for up/down, boundary checks (first/last)
- Mock pattern: follow `module-crud.test.ts` — mock auth, prisma, redirect
- **Verify**: `npm test` — all lesson tests pass

### 4. [x] Create VideoPreview component
- File: `src/components/video-preview.tsx`
- Props: `url: string | null | undefined`
- Parses YouTube URLs (`youtube.com/watch?v=`, `youtu.be/`) to extract video ID
- Parses Vimeo URLs (`vimeo.com/VIDEO_ID`) to extract video ID
- Renders responsive 16:9 iframe with correct embed URL
- Empty state: Video icon + "Aucune vidéo ajoutée" (per design)
- Invalid URL state: Video icon + "URL invalide" in `text-destructive`
- **Verify**: Component renders all three states correctly

### 5. [x] Create LessonList client component
- File: `src/components/lesson-list.tsx`
- Props: `lessons: Lesson[]`, `moduleId: string`
- `"use client"` — manages local state for optimistic UI
- Renders lesson rows: up/down buttons, title (click to open edit dialog), delete button
- Reorder: calls `reorderLesson` action, updates local state optimistically
- Delete: opens `Dialog` for confirmation, calls `deleteLesson` action
- Edit: opens `LessonEditDialog` on title click
- Empty state: Video icon + "Aucune leçon" centered
- **Verify**: Component renders, TypeScript compiles

### 6. [x] Create LessonEditDialog component
- File: `src/components/lesson-edit-dialog.tsx`
- Props: `lesson: Lesson`, `open: boolean`, `onOpenChange: (open: boolean) => void`, `onSave: () => void`
- `"use client"` — manages form state
- Form fields: title (Input), description (Textarea, optional), videoUrl (Input)
- Video preview updates live as URL changes (controlled input)
- Calls `updateLesson` action on save
- Dialog from shadcn/ui, Label for field labels
- **Verify**: Dialog renders with form, video preview works

### 7. [x] Add expand/collapse to ModuleList
- File: `src/components/module-list.tsx`
- Add `expandedModules: Set<string>` local state
- Add expand/collapse chevron button (ChevronRight/ChevronDown)
- When expanded, render lessons section with LessonList + "Ajouter" button
- Pass `module.lessons` to LessonList (requires updating Module interface)
- "Ajouter" button triggers createLesson action for that module
- **Verify**: Modules expand/collapse, lessons appear when expanded

### 8. [x] Update course edit page to fetch lessons
- File: `src/app/(dashboard)/dashboard/courses/[id]/page.tsx`
- Update Prisma query: `include: { modules: { orderBy: { order: "asc" }, include: { lessons: { orderBy: { order: "asc" } } } } }`
- Update Module type to include lessons array
- **Verify**: Lessons data flows to ModuleSection → ModuleList → LessonList

### 9. [x] Write integration tests for lesson UI flows
- File: `src/__tests__/lesson-integration.test.tsx`
- Test: add lesson → appears in list
- Test: edit lesson → opens dialog, saves changes
- Test: reorder lessons → order changes
- Test: delete lesson → confirmation dialog, lesson removed
- Test: empty state → shows "Aucune leçon" message
- Test: video preview → shows iframe for valid URL, placeholder for empty/invalid
- **Verify**: `npm test` — all tests pass

### 10. [x] Manual verification of acceptance criteria
- [x] Add lesson: expand module, click "Ajouter", edit dialog opens, save
- [x] Edit lesson: click title, modify fields, video preview works, save
- [x] Reorder: up/down buttons work, disabled at boundaries
- [x] Delete: confirmation dialog, lesson removed
- [x] Video preview: YouTube/Vimeo URLs embed correctly
- **Verify**: All criteria met via integration tests + manual spot check

## Files touched

| File | Change |
|------|--------|
| `prisma/schema.prisma` | Add Lesson model, lessons relation on Module |
| `src/app/(dashboard)/dashboard/courses/actions.ts` | Add lesson actions (createLesson, updateLesson, deleteLesson, reorderLesson) |
| `src/app/(dashboard)/dashboard/courses/[id]/page.tsx` | Update query to include lessons |
| `src/components/module-list.tsx` | Add expand/collapse, render LessonList when expanded |
| `src/components/lesson-list.tsx` | NEW — client component for lesson rows |
| `src/components/lesson-edit-dialog.tsx` | NEW — edit dialog with form + video preview |
| `src/components/video-preview.tsx` | NEW — video embed component |
| `src/__tests__/lesson-crud.test.ts` | NEW — unit tests for lesson actions |
| `src/__tests__/lesson-integration.test.tsx` | NEW — integration tests for UI flows |

## Test strategy

| Level | What | How |
|-------|------|-----|
| Unit | Lesson actions (CRUD, auth, ownership) | Vitest, mock prisma/auth/redirect |
| Unit | Reorder logic (order swapping within module) | Vitest, verify order values |
| Unit | Video URL parsing (YouTube, Vimeo, invalid) | Vitest, test extraction functions |
| Integration | UI flows (add, edit, reorder, delete) | Vitest, mock server actions |
| Integration | Video preview states (valid/invalid/empty) | Vitest, check rendered output |

## Definition of Done

- [x] All 10 tasks completed
- [x] `npm test` passes (all lesson tests + existing tests)
- [x] `npm run build` succeeds
- [x] Acceptance criteria verified
- [x] Mobile responsive (expand/collapse works on mobile)
- [x] No TypeScript errors
- [x] No new ESLint warnings
