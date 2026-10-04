---
validated: yes
---
# Plan — Story s05-video-lessons

Branch: `feature/s05-video-lessons`

## Target story
**As a** prof **I want** ajouter des leçons vidéo à mes modules **so that** les élèves peuvent apprendre.

Acceptance criteria:
- [x] Le prof peut ajouter une leçon à un module — `lesson-crud.test.ts` (createLesson : ordre, authentification, rôle, propriété), `lesson-actions.test.ts` (redirection après succès), `lesson-integration.test.tsx` (dialog d'ajout)
- [x] La leçon a un titre, une description, une URL vidéo externe — `lesson-crud.test.ts` (updateLesson avec title, description, videoUrl), `lesson-actions.test.ts` (URL `https://` acceptée, `javascript:`/`data:`/`http:` refusées)
- [x] Le prof peut réordonner les leçons dans un module — `lesson-crud.test.ts` (reorderLesson haut/bas, bornes), `lesson-actions.test.ts` (échange en une transaction, direction invalide), `lesson-integration.test.tsx` (réordonnancement, boutons désactivés aux bornes)
- [x] Le prof peut modifier ou supprimer une leçon — `lesson-crud.test.ts` (updateLesson, deleteLesson, propriété), `lesson-integration.test.tsx` (dialog d'édition pré-rempli, confirmation avant suppression)
- [ ] La vidéo s'affiche en preview dans l'éditeur — **non vérifié par test** : la prévisualisation existe dans le code (`src/components/lesson-form-dialog.tsx`, iframe `sandbox`), mais aucun test ne la couvre et aucune vérification manuelle n'est consignée

Design decisions carried in from `docs/designs/s05-video-lessons.md` (not re-litigated here): lessons render nested inside each module's row (no new page/route); a lesson's title is not inline-editable like a module's — add/edit opens a `Dialog` form (3 fields don't fit an inline row); video URL is pasted pre-formatted (no YouTube/Vimeo parsing — matches the story's own "pas de player avancé" note and the fact that no embed-parsing utility exists anywhere in the codebase); `videoUrl` optional at the DB layer, validated as a well-formed URL only if provided (same pattern as `Course.thumbnailUrl`).

## Tasks (ordered)

1. [x] Add `Lesson` model to `prisma/schema.prisma` (`id`, `title`, `description String?`, `videoUrl String?`, `order Int`, `moduleId`, `module` relation `onDelete: Cascade`) + `lessons Lesson[]` back-relation on `Module`. Run `npx prisma migrate dev --name s05_lesson_model`. Verify: migration directory created under `prisma/migrations/`, `src/generated/prisma/models/Lesson.ts` exists, `npm run build` (or `npx tsc --noEmit`) has no type errors.

2. [x] Write failing tests in `src/__tests__/lesson-crud.test.ts` for `createLesson`, `updateLesson`, `deleteLesson`, `reorderLesson` — mirror `src/__tests__/module-crud.test.ts`'s structure exactly: mock `@/lib/auth`, `next/navigation`, and `@/lib/prisma` (`prisma.lesson.{create,update,delete,findUnique,findMany}`, `prisma.module.findUnique` for the ownership chain). Cover: PROF-only access (STUDENT/no-session → redirect, no mutation), ownership check via `lesson.module.course.profId` (a different prof's lesson → error, no mutation), `order` calculated as `max(existing) + 1` on create, reorder swap between adjacent lessons only within the same module, reorder boundary errors (already first/already last).

3. [x] Implement `createLesson`, `updateLesson`, `deleteLesson`, `reorderLesson` in `src/app/(dashboard)/dashboard/courses/actions.ts`, appended after the existing module actions. Follow `createModule`/`updateModule`/`deleteModule`/`reorderModule` line for line: same auth/redirect guard, same two-level ownership fetch (`prisma.lesson.findUnique({ where: { id }, include: { module: { include: { course: true } } } })` then check `.module.course.profId`), Zod schema `z.object({ title: z.string().min(1, "Le titre est requis"), description: z.string().optional(), videoUrl: z.string().url().optional().or(z.literal("")) })` using `.issues[0].message` (Zod v4 — not `.errors`), swap-based reorder with two sequential `prisma.lesson.update` calls (no `$transaction`, matching the existing pattern). Make task 2's tests pass. Run `npm test -- lesson-crud`.

4. [x] Extend the data layer: in `src/app/(dashboard)/dashboard/courses/[id]/page.tsx`, change the `modules` include to `modules: { orderBy: { order: "asc" }, include: { lessons: { orderBy: { order: "asc" } } } }`. Update the local `Module` TS interfaces in `src/components/module-section.tsx` and `src/components/module-list.tsx` to add `lessons: Lesson[]` (define a matching `Lesson` interface: `id`, `title`, `description`, `videoUrl`, `order`, `moduleId`). Verify: `npx tsc --noEmit` passes, no implicit `any` on the new field.

5. [x] Build `src/components/lesson-form-dialog.tsx` (`"use client"`): a `Dialog` used for both add and edit, controlled by props (`open`, `onOpenChange`, optional `lesson` for edit / `undefined` for create, `moduleId`, and the submit handler wired to `createLesson`/`updateLesson`). Fields: `Label`+`Input` for title, `Label`+`Textarea` for description, `Label`+`Input type="url"` for video URL. Below the URL field, a live preview: `videoUrl` state-bound — if non-empty render `<iframe src={videoUrl} className="aspect-video w-full rounded-md border">`, else a muted placeholder div ("Ajoutez une URL vidéo pour voir l'aperçu") per the design mockup. `Annuler` (`variant="outline"`) closes without saving; `Enregistrer` (`variant="default"`) submits.

6. [x] Build `src/components/lesson-list.tsx` (`"use client"`): mirrors `module-list.tsx`'s local-state/optimistic-update shape but without inline title editing — each row: reorder buttons (`ChevronUp`/`ChevronDown`, `size="icon-sm"`, disabled at boundaries), title as plain text, a `Pencil` icon button that opens `LessonFormDialog` in edit mode (pre-filled), a `Trash2` icon button that opens the existing delete-confirmation `Dialog` pattern (copy the `DeleteCourseDialog`/module-delete-dialog shape: "Supprimer la leçon" / "Êtes-vous sûr de vouloir supprimer cette leçon ? Cette action est irréversible."). Reorder and delete call `reorderLesson`/`deleteLesson` the same optimistic way `module-list.tsx` calls `reorderModule`/`deleteModule`.

7. [x] Build `src/components/lesson-section.tsx`: sub-header "Leçons" + "Ajouter une leçon" button (`variant="outline"`, `size="sm"` per the design's smaller nested-button treatment) that opens `LessonFormDialog` in create mode; renders `LessonList` when `lessons.length > 0`, else the compact empty state (`Video` icon from lucide-react, "Aucune leçon", "Ajoutez des leçons vidéo à ce module.") per `docs/designs/s05-video-lessons.md`.

8. [x] Wire `LessonSection` into `src/components/module-list.tsx`: render it nested below each module's existing row (inside the same per-module block), passing that module's `lessons` and `moduleId`. Matches the mockup's nested-card layout (`docs/designs/s05-video-lessons.html`).

9. [x] Write `src/__tests__/lesson-integration.test.tsx` mirroring `src/__tests__/module-integration.test.tsx`: renders a module with lessons (rows visible, correct titles), renders the empty state when a module has no lessons, opens the add dialog and confirms empty fields, opens the edit dialog pre-filled from an existing lesson, confirms reorder buttons are disabled at the first/last position, confirms delete opens the confirmation dialog before calling `deleteLesson`.

10. [x] Run `npm test` — confirm 0 regressions against the pre-story baseline (177 passing) and all new lesson tests green. Manually verify in the running app (`npm run dev`): add a lesson with a real YouTube "embed" URL (e.g. `https://www.youtube.com/embed/dQw4w9WgXcQ`) and confirm the iframe actually renders and plays; confirm reorder, edit, delete work end-to-end; confirm a prof cannot edit/delete another prof's lesson (test via direct action call or a second seeded prof, since there's no UI path to another prof's course).
    > Note : la vérification manuelle dans l'application (embed YouTube réel, édition/suppression de bout en bout, leçon d'un autre prof) n'est pas consignée ; cette tâche n'atteste que la non-régression des tests et le build (voir `docs/reviews/s05-video-lessons.md`).

## Files touched
- `prisma/schema.prisma` (new `Lesson` model, `Module.lessons` back-relation)
- `prisma/migrations/<ts>_s05_lesson_model/` (new)
- `src/app/(dashboard)/dashboard/courses/actions.ts` (4 new server actions)
- `src/app/(dashboard)/dashboard/courses/[id]/page.tsx` (include update)
- `src/components/module-section.tsx` (interface update)
- `src/components/module-list.tsx` (interface update, wires `LessonSection`)
- `src/components/lesson-section.tsx` (new)
- `src/components/lesson-list.tsx` (new)
- `src/components/lesson-form-dialog.tsx` (new)
- `src/__tests__/lesson-crud.test.ts` (new)
- `src/__tests__/lesson-integration.test.tsx` (new)

## Test strategy
- **Unit (server actions)**: `src/__tests__/lesson-crud.test.ts`, prisma fully mocked (no real DB in tests, matches every existing action test) — auth guard, ownership chain, order calculation, reorder swap + boundaries.
- **Component/integration**: `src/__tests__/lesson-integration.test.tsx` — rendering, empty state, dialog open/pre-fill, reorder button disabled states, delete confirmation flow. No assertion on actual iframe video playback (jsdom doesn't render media) — that's covered by the manual check in task 10.
- **No e2e, no real DB**: consistent with the project's current test setup (Vitest + full prisma mocks; no test-DB infra exists yet).
- **Regression gate**: full `npm test` must stay green (177 baseline + new tests) before review.

## Definition of Done
- Single PR (`feature/s05-video-lessons` → `main`), structured description, readable diff.
- All lesson CRUD + reorder covered by passing tests; full suite green, no regression on the 177-test baseline.
- Ownership check prevents a prof from mutating another prof's lesson (verified by test, not just by code inspection — a copy-paste mistake in the two-level `include` is the most likely bug here per research).
- Video preview renders the iframe for a valid `videoUrl` and shows the placeholder when empty — verified manually (jsdom can't assert real video playback).
- Reorder never crosses a lesson into another module's list (swap only among the current module's `lessons`, ordered).
- Review passed (no open critical issue) via `/ks-review`.
- Deployed to production per the ship strategy (manual — PR opened, human merges).
