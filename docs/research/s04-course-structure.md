# Research — Story s04-course-structure

## Target story

**As a** prof **I want** organiser mon cours en modules **so that** les élèves ont une progression claire.

### Acceptance criteria
- [ ] Le prof peut ajouter des modules à un cours
- [ ] Le prof peut renommer un module
- [ ] Le prof peut réordonner les modules (drag-drop ou boutons up/down)
- [ ] Le prof peut supprimer un module
- [ ] Les modules apparaissent dans l'ordre défini

### Agentic notes
- Table `Module` avec `courseId`, `title`, `order`
- UI: liste verticale avec contrôles de réordonnancement
- Pas de lessons ici — juste la structure de modules
- Référence Podia: éditeur de curriculum

---

## Current state of the code

### Prisma schema (`prisma/schema.prisma`)

The `Module` model does **NOT exist yet**. The schema currently has:
- `User` model (id, email, passwordHash, name, role, timestamps, courses relation)
- `Course` model (id, slug, title, description, price, thumbnailUrl, status, timestamps, profId, prof relation)
- `Role` enum (STUDENT, PROF)
- `CourseStatus` enum (DRAFT, PUBLISHED)

The architecture doc (`docs/architecture.md`) specifies the Module model:
```prisma
model Module {
  id        String   @id @default(cuid())
  title     String
  order     Int
  courseId  String
  course    Course   @relation(fields: [courseId], references: [id], onDelete: Cascade)
  lessons   Lesson[]
}
```

This story only implements Module — no Lesson yet.

### Dashboard courses pages

| File | Purpose | Status |
|------|---------|--------|
| `src/app/(dashboard)/dashboard/courses/page.tsx` | Course list | Works, lists courses by prof |
| `src/app/(dashboard)/dashboard/courses/[id]/page.tsx` | Course edit | Works, has CourseForm + delete dialog |
| `src/app/(dashboard)/dashboard/courses/new/page.tsx` | Course create | Works |
| `src/app/(dashboard)/dashboard/courses/actions.ts` | Server Actions (create, update, delete) | Works |

The course edit page (`[id]/page.tsx`) is the **anchor point** — modules will be managed here, below the course form.

### UI components available

| Component | Location | Installed |
|-----------|----------|-----------|
| Button | `src/components/ui/button.tsx` | YES |
| Card | `src/components/ui/card.tsx` | YES |
| Dialog | `src/components/ui/dialog.tsx` | YES |
| Input | `src/components/ui/input.tsx` | YES |
| Label | `src/components/ui/label.tsx` | YES |
| Badge | `src/components/ui/badge.tsx` | YES |
| Textarea | `src/components/ui/textarea.tsx` | YES |
| Checkbox | `src/components/ui/checkbox.tsx` | YES |

Missing for this story:
- **None required** — up/down buttons can use existing Button + Lucide icons

---

## Anchor points

### 1. Course edit page — where modules will appear
**File**: `src/app/(dashboard)/dashboard/courses/[id]/page.tsx`

The current page has:
```tsx
<div className="container mx-auto p-4 md:p-6 max-w-2xl">
  <div className="flex justify-between items-center mb-6">
    <h1 className="text-3xl font-semibold">Modifier le cours</h1>
    <DeleteCourseDialog ... />
  </div>
  <CourseForm course={course} action={updateCourse} />
</div>
```

Modules section will be added **below** `<CourseForm>`.

### 2. Course actions file — where module actions will live
**File**: `src/app/(dashboard)/dashboard/courses/actions.ts`

Pattern established:
- `"use server"` at top
- Zod schema for validation
- Auth check: `await auth()`, check `session.user.role === "PROF"`
- Ownership check: verify `course.profId === session.user.id`
- Use `redirect()` or return `{ error: string }`

Module actions to add: `createModule`, `updateModule`, `deleteModule`, `reorderModules`

### 3. Prisma client
**File**: `src/lib/prisma.ts`

Singleton pattern with LibSQL adapter. After adding Module model:
- Run `npx prisma migrate dev --name add-module-model`
- Regenerates client to `src/generated/prisma/`

---

## Verified APIs / functions

### Prisma Course operations (exist, verified in `actions.ts`)
```ts
// src/app/(dashboard)/dashboard/courses/actions.ts

import { prisma } from "@/lib/prisma"

prisma.course.findUnique({ where: { id } })  // line 96
prisma.course.update({ where: { id }, data: { ... } })  // line 112
prisma.course.delete({ where: { id } })  // line 152
```

### Auth function (exists, verified)
```ts
// src/lib/auth.ts line 6
export const { handlers, signIn, signOut, auth } = NextAuth({ ... })

// Usage:
const session = await auth()
session.user.id     // string
session.user.role   // "PROF" | "STUDENT"
```

### Lucide icons needed
```ts
import { ChevronUp, ChevronDown, Trash2, Plus, GripVertical } from "lucide-react"
```
All standard Lucide exports — verified available.

### redirect, notFound (Next.js)
```ts
import { redirect, notFound } from "next/navigation"
```
Standard Next.js 14+ exports — used in current codebase.

---

## Traps & constraints

### 1. Module relation on Course model
The current `Course` model has no `modules` relation. The migration must add:
```prisma
// In Course model
modules      Module[]

// New Module model
model Module {
  id        String   @id @default(cuid())
  title     String
  order     Int
  courseId  String
  course    Course   @relation(fields: [courseId], references: [id], onDelete: Cascade)
}
```

`onDelete: Cascade` means deleting a course deletes its modules — matching existing UX.

### 2. Order field — integer, must be maintained
When reordering:
- `order` must be unique per course (or at least consistent)
- Insert at end: `order = max(existing orders) + 1`
- Move up/down: swap orders between adjacent modules
- Delete: no need to compact (gaps are fine)

### 3. Ownership checks required
All module operations must verify:
```ts
// Fetch course with ownership
const course = await prisma.course.findUnique({
  where: { id: courseId },
  include: { modules: true }
})
if (!course || course.profId !== session.user.id) {
  return { error: "Non autorisé" }
}
```

### 4. No lessons yet
This story explicitly excludes lessons. The Module model may reference Lesson[] per architecture, but the Lesson model won't exist yet. Options:
- **Option A**: Add Module without Lesson relation, add later
- **Option B**: Add empty Lesson model placeholder

Recommend **Option A** — simpler, no unused code.

### 5. Test pattern to follow
Existing tests in `src/__tests__/course-crud.test.ts` mock:
- `vi.mock("@/lib/auth")` — returns session or null
- `vi.mock("next/navigation")` — captures redirect calls
- `vi.mock("@/lib/prisma")` — mocks `prisma.course.*` methods

Module tests will mock `prisma.module.*` and `prisma.course.findUnique` (for ownership).

### 6. Client component for reordering
The module list with up/down buttons needs client-side state. Pattern:
```tsx
"use client"

function ModuleList({ modules, courseId }: { modules: Module[], courseId: string }) {
  // Local state for optimistic UI
  const [items, setItems] = useState(modules)

  async function handleMoveUp(moduleId: string) {
    // Optimistic reorder
    // Call server action
  }
}
```

The parent page (server component) passes initial data; the list is a client component.

---

## Open questions

### 1. Drag-and-drop or buttons only?
Acceptance criteria says "drag-drop ou boutons up/down". Design decision:
- **Buttons** are simpler, no extra library, accessible by default
- **Drag-drop** requires `@hello-pangea/dnd` or similar

**Recommendation**: Start with buttons (up/down arrows). Drag-drop can be added later as polish. Buttons fully satisfy the acceptance criteria.

### 2. Inline editing or modal for rename?
Options:
- **Inline edit**: click title → input appears → blur/enter saves
- **Modal/dialog**: click edit icon → dialog opens → save button

**Recommendation**: Inline edit is faster UX, follows Podia pattern. Use `Input` with local state.

### 3. Where does the Module section appear on the edit page?
Below the CourseForm, in its own Card. Section title: "Modules" or "Structure du cours".

### 4. Should the Module model include Lesson[] now?
Per trap #4, recommend **no** — add Lesson relation in s05-video-lessons. Keeps this story focused.
