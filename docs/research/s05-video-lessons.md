# Research — Story s05-video-lessons

## Target story

**As a** prof **I want** ajouter des leçons vidéo à mes modules **so that** les élèves peuvent apprendre.

### Acceptance criteria
- [ ] Le prof peut ajouter une leçon à un module
- [ ] La leçon a un titre, une description, une URL vidéo externe
- [ ] Le prof peut réordonner les leçons dans un module
- [ ] Le prof peut modifier ou supprimer une leçon
- [ ] La vidéo s'affiche en preview dans l'éditeur

### Agentic notes
- Table `Lesson` avec `moduleId`, `title`, `description`, `videoUrl`, `order`
- Vidéo: embed externe (YouTube, Vimeo, Bunny, Mux) — juste une URL
- Pas de player avancé ici, juste l'embed basique
- Référence Podia: ajout de "content" dans un produit

## Current state of the code

### Prisma schema (`prisma/schema.prisma`)

The `Module` model exists (from s04) but has **no lessons relation yet**:

```prisma
model Module {
  id       String @id @default(cuid())
  title    String
  order    Int
  courseId String
  course   Course @relation(fields: [courseId], references: [id], onDelete: Cascade)
}
```

The architecture doc (`docs/architecture.md`) shows the target Lesson model:
```prisma
model Lesson {
  id          String   @id @default(cuid())
  title       String
  description String?
  videoUrl    String?
  tabUrl      String?  // s14 scope, not s05
  order       Int
  moduleId    String
  module      Module   @relation(fields: [moduleId], references: [id], onDelete: Cascade)
  progress    Progress[]
}
```

**Note**: `tabUrl` and `progress` relation are out of scope for s05 — they belong to s14 and s10 respectively.

### Server actions (`src/app/(dashboard)/dashboard/courses/actions.ts`)

Module CRUD actions exist (lines 164-346):
- `createModule(formData)` — creates with "Nouveau module" title, order = max + 1
- `updateModule(formData)` — updates title, validates ownership via module.course.profId
- `deleteModule(formData)` — deletes, validates ownership
- `reorderModule(formData)` — swaps order with adjacent module

**Pattern established**: All actions follow the same auth/ownership pattern:
1. Check `session.user.role === "PROF"`
2. Fetch entity with course relation
3. Verify `course.profId === session.user.id`
4. Perform operation
5. `redirect()` on success, return `{ error }` on failure

### UI components

**ModuleSection** (`src/components/module-section.tsx`):
- Client component wrapping Card + ModuleList
- "Ajouter un module" button triggers createModule action
- Empty state: Package icon + "Aucun module"

**ModuleList** (`src/components/module-list.tsx`):
- Client component with local state for optimistic UI
- Handles: inline edit, reorder (up/down), delete with confirmation dialog
- Uses: Button, Input, Dialog from shadcn/ui

**Course edit page** (`src/app/(dashboard)/dashboard/courses/[id]/page.tsx`):
- Fetches course with `include: { modules: { orderBy: { order: "asc" } } }`
- Renders CourseForm + ModuleSection

## Anchor points

### Where lessons plug in

1. **Schema**: Add `Lesson` model, add `lessons` relation to `Module`

2. **Actions file** (`src/app/(dashboard)/dashboard/courses/actions.ts`):
   - Add: `createLesson`, `updateLesson`, `deleteLesson`, `reorderLesson`
   - Follow same auth/ownership pattern as module actions

3. **UI structure** — lessons expand within each module row:
   - Current: `ModuleList` renders module rows with reorder/edit/delete
   - New: Each module row should expand to show its lessons
   - Option A: Accordion/collapsible pattern within module row
   - Option B: Separate LessonList component rendered below module title

4. **Course edit page** — fetch chain:
   - Current: `include: { modules: { orderBy } }`
   - New: `include: { modules: { orderBy, include: { lessons: { orderBy } } } }`

### Video preview component

- New component: `VideoPreview` or inline iframe
- Input: `videoUrl` (YouTube, Vimeo, Bunny, Mux)
- Output: Responsive iframe embed
- **Complexity**: URL parsing to detect provider and extract video ID
  - YouTube: `https://youtube.com/watch?v=VIDEO_ID` or `https://youtu.be/VIDEO_ID`
  - Vimeo: `https://vimeo.com/VIDEO_ID`
  - Generic: Direct embed if already an embed URL

## Verified APIs / functions

### Prisma (verified in schema + existing actions)
- `prisma.module.findUnique({ where: { id }, include: { course: true } })` — exists in actions.ts:223
- `prisma.module.findUnique({ where: { id }, include: { course: { include: { modules: { orderBy } } } } })` — exists in actions.ts:293
- Will need: `prisma.lesson.create/update/delete/findUnique` — standard Prisma CRUD

### Auth (`src/lib/auth.ts`)
- `auth()` returns session or null — verified export at line 6
- `session.user.id`, `session.user.role` — verified in existing actions

### UI components (all verified in `src/components/ui/`)
- `Button` — variants: default, ghost, destructive; sizes: sm, icon, icon-sm
- `Input` — text input for lesson title
- `Textarea` — verified at src/components/ui/textarea.tsx (for description)
- `Dialog` — delete confirmation
- `Card`, `CardHeader`, `CardContent`, `CardTitle` — section wrapper

### Icons (Lucide React, verified imports in existing components)
- `ChevronUp`, `ChevronDown` — reorder
- `Trash2` — delete
- `Plus` — add lesson
- `Play` or `Video` — video icon for empty/preview state

## Traps & constraints

### 1. Module → Lesson cascade delete
Adding `lessons Lesson[]` relation to Module requires cascade delete behavior. The Module already has `onDelete: Cascade` from Course. Adding lessons with `onDelete: Cascade` on the Module relation is safe and expected.

### 2. Nested include depth
Fetching course → modules → lessons is 3 levels deep. Prisma handles this fine, but the TypeScript types become nested. May need explicit type for the query result.

### 3. Video URL validation
- Story requires video **preview** — not just storing the URL
- Need to handle multiple providers (YouTube, Vimeo, Bunny, Mux)
- Edge cases: invalid URLs, private videos, broken embeds
- **Recommendation**: Simple iframe approach first, provider detection later if needed

### 4. UI complexity: lessons inside modules
Current module row is flat. Adding lessons creates nested structure:
- Option A: Accordion — module row expands to show lessons
- Option B: Always-visible — lessons listed below module title
- **Consideration**: Mobile UX — too much nesting is hard to use

### 5. Test mocking
Module tests mock `prisma.module.*` and `prisma.course.findUnique`. Lesson tests will need to add `prisma.lesson.*` mocks. Follow same pattern in `src/__tests__/module-crud.test.ts`.

### 6. Order field on lessons
Same pattern as modules: `order` field, reorder swaps adjacent. Must scope to `moduleId` — lessons reorder within their module, not globally.

### 7. Empty description handling
Lesson `description` is optional (`String?`). Form should allow empty, store as `null`. Follow same pattern as Course description in existing form.

## Open questions

1. **UI pattern for lessons in modules**: Should lessons be in an accordion (collapsed by default) or always visible below the module title? The design doc for s04 didn't specify this — need design decision.

2. **Video preview size**: What dimensions for the video preview in the editor? Responsive 16:9 or fixed small preview? This affects the layout.

3. **Lesson form**: Full form (title + description + videoUrl) or incremental (create with title, then expand to edit details)? Module pattern is incremental (create → edit title). Lesson has more fields.

4. **Video provider detection**: Should we explicitly parse YouTube/Vimeo URLs to generate proper embed URLs, or accept any URL and use a generic iframe? The former is more robust, the latter is simpler.

5. **Textarea vs Input for description**: Description could be multi-line. Design system has `Textarea` component — should we use it?
