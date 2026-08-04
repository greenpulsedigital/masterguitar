# Research — Story s05-video-lessons

## Target story
**As a** prof **I want** ajouter des leçons vidéo à mes modules **so that** les élèves peuvent apprendre.

Acceptance criteria:
- [ ] Le prof peut ajouter une leçon à un module
- [ ] La leçon a un titre, une description, une URL vidéo externe
- [ ] Le prof peut réordonner les leçons dans un module
- [ ] Le prof peut modifier ou supprimer une leçon
- [ ] La vidéo s'affiche en preview dans l'éditeur

Dependencies: s04-course-structure (shipped — modules exist and are CRUD/reorderable).

## Current state of the code

**The `Lesson` model does not exist yet.** `prisma/schema.prisma:1-76` only defines `User`, `Course`, `Module`, `Purchase`. `docs/architecture.md` documents a much richer schema (with `Lesson`, `Progress`, `Subscription`, `Post`, `Affiliate`, `Bundle`...) but that is the target end-state design, not the current DB — it has drifted ahead of the code on purpose (architecture was written once, upfront, for the whole PRD). Confirmed with `grep -rl "Lesson" src/` → zero matches anywhere in `src/`. `src/generated/prisma/models/` only has `Course.ts`, `Module.ts`, `Purchase.ts`, `User.ts` — no `Lesson.ts`.

Current `Module` model (`prisma/schema.prisma:56-62`):
```prisma
model Module {
  id       String @id @default(cuid())
  title    String
  order    Int
  courseId String
  course   Course @relation(fields: [courseId], references: [id], onDelete: Cascade)
}
```
No `lessons Lesson[]` back-relation — must be added alongside the new `Lesson` model.

Target `Lesson` shape per `docs/architecture.md:151-161` (design intent, to adapt to the current schema — drop `tabUrl`/`progress` which belong to later stories s10/s14):
```prisma
model Lesson {
  id          String   @id @default(cuid())
  title       String
  description String?
  videoUrl    String?
  order       Int
  moduleId    String
  module      Module   @relation(fields: [moduleId], references: [id], onDelete: Cascade)
}
```

**Module CRUD (s04, shipped) is the direct template to mirror** — same course, same dashboard, one level down:
- `src/app/(dashboard)/dashboard/courses/actions.ts` — all `"use server"` mutations for course + module live in one file (`createCourse`, `updateCourse`, `deleteCourse`, `createModule`, `updateModule`, `deleteModule`, `reorderModule`, `toggleCourseStatus`). Lesson actions belong here too (`createLesson`, `updateLesson`, `deleteLesson`, `reorderLesson`).
- `src/app/(dashboard)/dashboard/courses/[id]/page.tsx` — server component, loads `course` with `modules: { orderBy: { order: "asc" } }` via `prisma.course.findUnique`, renders `<ModuleSection modules={course.modules} courseId={course.id} />`. Will need `modules: { orderBy: { order: "asc" }, include: { lessons: { orderBy: { order: "asc" } } } }`.
- `src/components/module-section.tsx` — `"use client"` wrapper: `CardHeader` with "Ajouter un module" button (a `<form action={createModule}>` with hidden `courseId`), `CardContent` renders `<ModuleList>` or an empty state (`Package` icon + "Aucun module"). A `LessonSection` per module would follow the identical shape, nested inside each module row.
- `src/components/module-list.tsx` — `"use client"`, holds local `items` state for optimistic UI. Inline-edit title (click text → `Input`, save on blur/Enter, cancel on Escape). Reorder is **swap-based up/down buttons** (`ChevronUp`/`ChevronDown`, disabled at boundaries) — no drag-and-drop, no `react-beautiful-dnd` or similar. Delete goes through a shadcn `Dialog` confirmation, not `window.confirm`.

## Anchor points

- Schema: `prisma/schema.prisma` — add `model Lesson` + `lessons Lesson[]` on `Module`.
- Migration: `npx prisma migrate dev --name <name>` → new dir under `prisma/migrations/`. Existing naming isn't fully consistent (`20260731134705_add_course_model`, `20260801095901_add_module_model`, but later ones are story-prefixed: `20260802070511_s07_purchase_model`, `20260802084729_s06_sales_page`). Follow the story-prefixed convention: `s05_lesson_model` or `add_lesson_model`.
- Actions: append to `src/app/(dashboard)/dashboard/courses/actions.ts` (same file as course/module actions — no separate `lessons/actions.ts` in this codebase's convention).
- Page: `src/app/(dashboard)/dashboard/courses/[id]/page.tsx` — extend the `prisma.course.findUnique` include to pull lessons per module.
- New components: `src/components/lesson-section.tsx` (per-module card/list wrapper) and `src/components/lesson-list.tsx` (item list with inline edit, reorder, delete), placed inside `module-list.tsx`'s per-module row or nested under `module-section.tsx` — exact composition is a planning decision (see Open questions).
- Ownership check pattern (every mutation): `auth()` → `session.user.role !== "PROF"` → redirect; then re-fetch the parent chain to check `...profId !== session.user.id`. For a lesson this means `lesson.module.course.profId`, i.e. a `findUnique` with `include: { module: { include: { course: true } } }`.

## Verified APIs / functions

All confirmed by reading the actual files (not assumed from docs):
- `auth()` from `@/lib/auth` — returns session with `session.user.id`, `session.user.role` (`"PROF" | "STUDENT"`). Used identically in every existing action.
- `prisma` singleton from `@/lib/prisma` (`src/lib/prisma.ts`) — note its `DATABASE_URL` fallback is currently `"file:./dev.db"` (changed from `"file:./prisma/dev.db"` in an uncommitted local tweak on a prior session — not story-related, leave as is unless it breaks the local DB path).
- `zod` `z.object(...).safeParse(...)` → `validation.error.issues[0].message` (the Zod v4 API — `.issues`, not `.errors`; this was a critical fix flagged in s02's review, must be used correctly from the start here).
- shadcn components confirmed present in `src/components/ui/`: `button.tsx`, `card.tsx`, `dialog.tsx`, `input.tsx`, `label.tsx`, `textarea.tsx`, `badge.tsx`, `checkbox.tsx`. All needed for a lesson form (title `Input`, description `Textarea`, videoUrl `Input`) already exist — no new shadcn install needed for the form itself.
- `generateSlug` from `@/lib/slug` — used for Course only, not needed for Lesson (no public slug requirement in the acceptance criteria).
- Lucide icons already used for this kind of UI: `ChevronUp`, `ChevronDown`, `Trash2`, `Package` (empty state).

## Traps & constraints

- **No video-embed pattern exists anywhere in the codebase yet.** `grep -rn "iframe|embed|youtube|vimeo"` across `src/` returns nothing, and no player library (`react-player` or similar) is in `package.json`. The story's acceptance criterion "la vidéo s'affiche en preview dans l'éditeur" requires a first decision on *how* a raw URL becomes a preview: likely a plain `<iframe src={videoUrl}>` for URLs that are already embed-ready, with no URL-parsing/normalization (e.g. converting a `youtube.com/watch?v=` URL into `youtube.com/embed/`). `docs/architecture.md:275-279` confirms scope: "just a URL", "native embed or custom wrapper", explicitly **no self-hosting, no advanced player** — matches the story's own note "Pas de player avancé ici, juste l'embed basique". Whether to normalize common YouTube/Vimeo URL shapes into embeddable ones, or require the prof to paste an already-embeddable URL, is a planning decision, not something the research can settle from existing code (there's no precedent).
- **Reorder must follow the exact swap pattern from `reorderModule`** (`actions.ts:282-346`): fetch the item with its full sibling list ordered, guard boundaries (already first/last → error), find the adjacent item, swap the two `order` values with two sequential `prisma.*.update` calls. No transaction is used in the existing code (two separate `await`s) — replicate that, don't introduce a `$transaction` unless deliberately upgrading the pattern (would be a scope increase beyond "nothing more than the plan specifies").
- **All existing action tests fully mock `prisma`** (`src/__tests__/module-crud.test.ts:14-27`) — `vi.mock("@/lib/prisma", ...)` with only the methods actually called (`create`, `update`, `delete`, `findUnique`, `findMany` as needed). A `lesson-crud.test.ts` must mock `prisma.lesson.*` and `prisma.module.findUnique` (for the ownership chain) the same way; no real DB/SQLite file touched in tests.
- **`onDelete: Cascade` is used on every parent relation** (`Module.course`, and presumably `Lesson.module`) — deleting a module already cascades its lessons at the DB level; no manual cleanup needed in `deleteModule`, and none should be added to `deleteLesson`'s course/module chain either.
- **Ownership check depth grows one level**: module actions check `module.course.profId`; lesson actions need `lesson.module.course.profId` — a two-level nested `include`. Get this wrong (e.g. checking only `lesson.module` without traversing to `course`) and any prof could edit any other prof's lessons.
- **`src/app/(dashboard)/dashboard/courses/[id]/page.tsx`'s existing include will need to grow** from `modules: { orderBy: { order: "asc" } }` to also nest `lessons: { orderBy: { order: "asc" } }` — a one-line change, but every consumer of that `course.modules` shape (`ModuleSection`, `ModuleList`, and their local `Module` TS interfaces at the top of each file) currently types modules as `{ id, title, order, courseId }` with **no `lessons` field** — those interfaces will need updating or the new `lessons` array will be silently dropped/untyped where passed through.
- Test suite currently at 177 passing (`npm test`, verified this session) — a clean baseline to compare against after implementation.

## Open questions

- **Video URL normalization**: does the form accept only pre-formatted embed URLs (simplest, matches "juste une URL" in the story notes), or should the plan include parsing common YouTube/Vimeo watch-page URLs into embeddable ones? No existing code or ADR settles this — recommend simplest option (raw `<iframe src>`, prof pastes an embed-ready URL) unless the plan step decides otherwise, since the story explicitly scopes out "player avancé".
- **Component composition**: should lessons render inside `ModuleList`'s existing per-module row (expanding each module into an accordion/expandable section), or as a fully separate `LessonSection`/`LessonList` pair mirroring `ModuleSection`/`ModuleList` one level down? Both are consistent with existing conventions; this is a UI-structure decision for `/ks-plan` (or `/ks-design`, since this story has a UI surface — it wasn't design-reviewed like s02/s03/s04/s06, likely because the module editor UI already exists and this only extends it, but a design pass may still be warranted for the nested-lesson layout).
- **`videoUrl` required or optional**: the story says "La leçon a un titre, une description, une URL vidéo externe" (reads as required), but `docs/architecture.md`'s target schema marks `videoUrl String?` (optional, likely to allow draft lessons without a video yet, matching `Course.description` being optional too). Plan should decide: required at the Zod-validation layer (UX) vs. optional at the DB layer (flexibility) — these aren't mutually exclusive but need an explicit choice.
