---
validated: yes
---
# Plan — Story s03-course-crud

Branch: `feature/s03-course-crud`

## Target story

**As a** prof **I want** créer, modifier et supprimer mes cours **so that** je peux organiser mon catalogue.

### Acceptance criteria
- [x] Le prof peut créer un cours (titre, description, prix, thumbnail)
- [x] Le prof peut voir la liste de ses cours
- [x] Le prof peut modifier un cours existant
- [x] Le prof peut supprimer un cours (soft delete ou confirmation)
- [x] Le cours a un slug unique pour l'URL publique

## Tasks (ordered)

1. [x] **Install dependencies**
   - Add shadcn components: `npx shadcn add textarea badge dialog`
   - Verify: components in `src/components/ui/`

2. [x] **Update Prisma schema with Course model**
   - Add `Course` model with: id, slug, title, description, price, thumbnailUrl, status, profId, timestamps
   - Add `CourseStatus` enum (DRAFT, PUBLISHED)
   - Add relation `User.courses` (one-to-many)
   - Use `slug String @unique` for global slug uniqueness (ADR 006); collisions get a `-2`, `-3`… suffix, slug stays stable on rename
   - Run `npx prisma migrate dev --name add_course_model`
   - Verify: migration succeeds, Prisma client regenerates

3. [x] **Create slug generation utility**
   - Create `src/lib/slug.ts`
   - Export `generateSlug(text: string): string` — lowercase, trim, remove special chars, spaces to hyphens
   - Write unit test for slug generation
   - Verify: test passes

4. [x] **Create course list page**
   - Create `src/app/(dashboard)/dashboard/courses/page.tsx`
   - Server Component: fetch courses where `profId = session.user.id`
   - Display grid of course cards (thumbnail, title, price, status badge)
   - Show empty state if no courses
   - Add "Nouveau cours" button linking to `/dashboard/courses/new`
   - Verify: page renders at `/dashboard/courses`

5. [x] **Create course form component**
   - Create `src/components/course-form.tsx` (Client Component)
   - Props: `course?: Course` (for edit mode), `action: (formData) => Promise`
   - Fields: title, description (textarea), price (number), thumbnailUrl
   - Display error state from action response
   - Verify: component renders with empty form

6. [x] **Create course creation page and action**
   - Create `src/app/(dashboard)/dashboard/courses/new/page.tsx`
   - Create `src/app/(dashboard)/dashboard/courses/actions.ts` with `createCourse` action
   - Validate input with Zod (title required, price >= 0)
   - Generate slug from title
   - Create course with `status: DRAFT`
   - Redirect to `/dashboard/courses/[id]` on success
   - Verify: creating a course works end-to-end

7. [x] **Create course edit page and action**
   - Create `src/app/(dashboard)/dashboard/courses/[id]/page.tsx`
   - Fetch course by id, verify ownership (`course.profId === session.user.id`)
   - Prefill form with course data
   - Add `updateCourse` action to actions.ts
   - Redirect to `/dashboard/courses` on success
   - Verify: editing a course works end-to-end

8. [x] **Create delete course action with confirmation**
   - Add `deleteCourse` action to actions.ts
   - Hard delete course (simpler for MVP)
   - Create delete confirmation dialog in edit page
   - Redirect to `/dashboard/courses` after delete
   - Verify: deleting a course works with confirmation

9. [x] **Update dashboard home page**
   - Modify `src/app/(dashboard)/dashboard/page.tsx`
   - Add "Mes cours" section with link to `/dashboard/courses`
   - Or redirect dashboard to courses list (simpler)
   - Verify: navigation from dashboard to courses works

10. [x] **Add integration tests**
    - Test: create course with valid data → course created
    - Test: create course without title → error
    - Test: edit course → changes saved
    - Test: delete course → course removed
    - Test: non-prof cannot create course (role check)
    - Verify: `npm test` passes

## Files touched

**Created:**
- `src/components/ui/textarea.tsx` — shadcn component
- `src/components/ui/badge.tsx` — shadcn component
- `src/components/ui/dialog.tsx` — shadcn component
- `src/lib/slug.ts` — slug generation utility
- `src/app/(dashboard)/dashboard/courses/page.tsx` — course list
- `src/app/(dashboard)/dashboard/courses/new/page.tsx` — create form
- `src/app/(dashboard)/dashboard/courses/[id]/page.tsx` — edit form
- `src/app/(dashboard)/dashboard/courses/actions.ts` — CRUD actions
- `src/components/course-form.tsx` — reusable form component
- `src/__tests__/course-crud.test.ts` — tests

**Modified:**
- `prisma/schema.prisma` — add Course model + enum
- `src/app/(dashboard)/dashboard/page.tsx` — add courses link/section

## Test strategy

**Unit tests:**
- Slug generation: various inputs → correct slugs
- Zod validation: valid/invalid course data

**Integration tests:**
- Course CRUD operations via Server Actions
- Role verification (only PROF can create)
- Ownership verification (only owner can edit/delete)

**Manual verification:**
- Visual appearance of forms and list
- Mobile responsiveness
- Error states display correctly

## Definition of Done

- [x] All 10 tasks completed
- [x] `npm run build` compiles without errors
- [x] `npm test` passes (all course tests)
- [x] Course CRUD works end-to-end:
  - [x] Create with title, description, price, thumbnail
  - [x] List shows all user's courses
  - [x] Edit updates course
  - [x] Delete removes course (with confirmation)
- [x] Slug is generated and globally unique (stable on rename)
- [ ] Mobile responsive (tested at 375px width) — **non vérifié** : aucun test responsive ni vérification à 375 px n'est consigné ; la revue `docs/reviews/s03-course-crud.md` le relève comme point mineur (seules des classes mobile-first sont constatées dans le code)
- [x] TypeScript compiles without errors
- [x] Committed to `feature/s03-course-crud` branch
