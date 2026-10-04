# Review — Story s05-video-lessons

> Fresh-context review. Each issue classified: critical / major / minor.
> Re-review of `main` at `7713e23` (2026-10-04), after the fixes merged in PR #9 (merge of `main` + review fixes) and the related fixes of PR #8 and #10.
> The first review (diff `main...feature/s05-video-lessons`, verdict "critical / Ship allowed: no") is superseded by this one: its critical finding is fixed.

## Plan compliance
- [x] The code does what the plan specifies, nothing more — the 10 tasks map to the schema, actions, data layer, dialog, list, section, wiring and tests. PR #9 added hardening beyond the plan (see "Corrections of the first review").
- [ ] The plan's acceptance criteria (5) and task 10's manual check are **not ticked** in `docs/plans/s05-video-lessons.md` (task 10 asks to verify in the running app: real YouTube embed, reorder/edit/delete, other prof's lesson). This review did not run the app either, so none of them is evidenced by a manual check (see Findings).

## Anti-hallucination
- [x] No invented API/function/import.
- [x] No plausible-but-wrong value or logic found on the main paths (the former `redirect()` defect is fixed).
- [x] `Lesson` model, migration (`20260804144653_s05_lesson_model`) and relations match the plan (`id`, `title`, `description?`, `videoUrl?`, `order`, `moduleId`, `onDelete: Cascade`, `Module.lessons`).

## Rules compliance
- [x] AGENTS.md conventions followed (Server Actions for mutations, `@/` imports, kebab-case files, no dark-mode classes / hardcoded colors).
- [x] ADR 005 (external video hosting, plain `<iframe>`, no URL parsing) respected: any `https://` host is accepted. ADR 007 (light-only theme) respected.
- [~] Design system: mostly respected. Two drifts from `docs/designs/s05-video-lessons.md` remain (see Findings).

## Tests
- [x] Test suite run by the reviewer on `main` at `7713e23`: **`npx vitest run` → 43 files, 254 tests passed** (the first review's "201 tests" is outdated). Lesson tests: `lesson-crud.test.ts`, `lesson-integration.test.tsx` and `lesson-actions.test.ts` → 34 tests.
- [x] `npx tsc --noEmit` clean; `npm run build` succeeds (run with dummy `STRIPE_SECRET_KEY`/`AUTH_SECRET`).
- [x] The blind spot of the first review is closed: `lesson-actions.test.ts` mocks `redirect` so that it **throws like Next.js**, and checks the redirect destination after create / update / delete / reorder. It also covers `javascript:`, `data:` and `http:` video URLs (rejected), an `https:` URL (accepted), an invalid `direction` (rejected before any DB access) and the single-transaction swap of `order`.
- [~] The component tests (`lesson-integration.test.tsx`) still mock the server actions entirely; the client-side rollback of `lesson-list.tsx` is not covered by a test (unlike the module list, see `module-list-errors.test.tsx`).

## Regressions
- [x] No impact on existing code paths; the full suite passes. The `Module` interfaces already carry `lessons` (`module-list.tsx`, `module-section.tsx`).
- [x] The public sales page does not expose lessons or `videoUrl`: `getCourseBySlug` selects only course fields, module `id/title/order` and the prof name (`src/lib/queries/course.ts`, covered by a privacy test in `course-queries.test.ts`).

## Corrections of the first review verified in the code

| Previous finding | Status | Where |
|---|---|---|
| **critical**: `redirect()` inside `try/catch` swallowed (create/update/delete/reorder lesson) | **Fixed** | all four actions call `redirect()` after the `try/catch` (`actions.ts` `createLesson` L375, `updateLesson` L435, `deleteLesson` L488, `reorderLesson` L522) |
| `redirect()` defect pre-existing in module actions (s04) and course actions (s03) | **Fixed** | PR #10 (modules), PR #8 (courses) |
| Unsafe `videoUrl` reaching an `<iframe>` (`javascript:`, `data:`) *(raised in the Codex review, not in the first report)* | **Fixed** | `lessonSchema` requires `https://` (`actions.ts` L367-372); preview iframe has `sandbox="allow-scripts allow-same-origin allow-presentation"` (`lesson-form-dialog.tsx:130`) |
| Non-atomic reorder (two separate `update`) | **Fixed** | `$transaction` in `reorderLesson` |
| `direction` not validated server-side | **Fixed** | rejected unless `up`/`down` |
| Reorder failure left the list in the wrong order | **Fixed** | rollback + ignore on error in `lesson-list.tsx:60-63` |
| minor: no `title` on the preview `<iframe>` | **Open** | see Findings |
| minor: `Card` not used for the nested "Leçons" block | **Open** | see Findings |
| minor: "Ajouter une leçon" button variant (`outline` vs design `default`) | **Open** (doc drift) | see Findings |

## Findings

| Severity | File | Issue |
|----------|------|-------|
| minor (process) | `docs/plans/s05-video-lessons.md:12-16, task 10` | The five acceptance criteria and the manual run-through of task 10 are not ticked, and no manual verification is recorded (real embed playing, edit/delete end to end, another prof's lesson). Automated tests and the build pass, but the story's own definition of done is not documented as met. |
| minor | `actions.ts` `lessonSchema` (L363-373), `createLesson`, `updateLesson` | The lesson title is only checked with `min(1)` and is stored as typed: a title made of spaces is accepted and `"  Intro  "` keeps its spaces. Module titles are trimmed since PR #10; lessons were not aligned. |
| minor | `src/components/lesson-list.tsx` (`handleDeleteConfirm`) | The result of `deleteLesson` is ignored: if the deletion fails, the lesson disappears from the screen until the next reload (only reorder has a rollback). |
| minor | `src/components/lesson-section.tsx:27` | The nested "Leçons" block is a plain `<div className="border rounded-lg p-3 bg-background">` instead of the `Card` required by `docs/designs/s05-video-lessons.md:94`. |
| minor | `src/components/lesson-section.tsx:32`, `docs/designs/s05-video-lessons.md:95` | "Ajouter une leçon" is `variant="outline"` (as in the plan) while the design says `default`: doc drift to reconcile. |
| minor | `src/components/lesson-form-dialog.tsx:128` | The preview `<iframe>` has no `title` attribute (accessibility). |
| minor | `actions.ts` `createLesson` | `order` is computed as `max + 1` then inserted separately: two simultaneous adds can get the same `order` (same limitation as modules; no unique `(moduleId, order)` constraint). |

## Verdict

The critical defect of the first review is fixed and now covered by tests that would have caught it: every lesson mutation redirects after success instead of returning a false error. The URL, atomicity and rollback issues raised afterwards are fixed as well. Tests (254), `tsc` and the build pass.

What remains is minor: small code gaps (title trimming, delete rollback, `Card`, iframe `title`, order race) and one process gap — the plan's acceptance criteria and the manual check of task 10 are not ticked or evidenced. No finding blocks shipping, but the manual check (real embed playing, edit/delete end to end, another prof's lesson) should be run and recorded in the plan before a release.

Max severity: minor
Ship allowed: yes
