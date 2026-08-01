# Research — Story s03-course-crud

## Target story

**As a** prof **I want** créer, modifier et supprimer mes cours **so that** je peux organiser mon catalogue.

### Acceptance criteria
- [ ] Le prof peut créer un cours (titre, description, prix, thumbnail)
- [ ] Le prof peut voir la liste de ses cours
- [ ] Le prof peut modifier un cours existant
- [ ] Le prof peut supprimer un cours (soft delete ou confirmation)
- [ ] Le cours a un slug unique pour l'URL publique

## Current state of the code

### Already exists
| Item | Location | Notes |
|------|----------|-------|
| User model | `prisma/schema.prisma:20-28` | Has id, email, passwordHash, name, role, timestamps |
| NextAuth config | `src/lib/auth.ts` | Credentials provider, JWT strategy, role in session |
| Route protection | `middleware.ts` | Protects `/dashboard/*` |
| Dashboard page | `src/app/(dashboard)/dashboard/page.tsx` | Shows welcome + placeholder "Vos cours apparaîtront ici" |
| Server Actions pattern | `src/app/(auth)/{login,signup}/actions.ts` | Zod validation + error handling established |
| shadcn/ui components | `src/components/ui/{button,input,label,card,checkbox}.tsx` | Base-UI available |
| Prisma client singleton | `src/lib/prisma.ts` | Ready: `import { prisma } from "@/lib/prisma"` |
| Design system | `docs/design-system.md` | Studio theme (dark), electric blue accent |

### Not yet implemented
| Item | Notes |
|------|-------|
| Course model | Defined in architecture.md but NOT in prisma/schema.prisma |
| Course CRUD routes | No `/dashboard/courses` or `/dashboard/courses/[id]` |
| Course actions | No Server Actions for create/update/delete |
| Slug generation | Need utility for URL-safe slugs |
| Dialog component | Not installed — needed for delete confirmation |
| Textarea component | Not installed — needed for description field |

## Anchor points

### Prisma schema extension
Location: `prisma/schema.prisma` (add after User model)

Per `docs/architecture.md:103-130`, add:
```prisma
model Course {
  id           String   @id @default(cuid())
  slug         String
  title        String
  description  String?
  price        Int      // cents
  thumbnailUrl String?
  status       CourseStatus @default(DRAFT)
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  profId       String
  prof         User     @relation(fields: [profId], references: [id])

  @@unique([profId, slug])  // scoped uniqueness
}

enum CourseStatus {
  DRAFT
  PUBLISHED
}
```

Note: Use `@@unique([profId, slug])` instead of global `slug @unique` — allows same slug for different profs.

### Route structure
```
src/app/(dashboard)/dashboard/
├── page.tsx              [MODIFY] — add course list or link to courses
└── courses/              [NEW]
    ├── page.tsx          — list user's courses
    ├── new/
    │   └── page.tsx      — create form
    └── [id]/
        └── page.tsx      — edit form
```

### Server Actions location
File: `src/app/(dashboard)/dashboard/courses/actions.ts`
- `createCourse(formData: FormData)`
- `updateCourse(id: string, formData: FormData)`
- `deleteCourse(id: string)`

### Auth in Server Actions
Pattern established in s02:
```ts
import { auth } from "@/lib/auth"

const session = await auth()
if (!session || session.user.role !== "PROF") {
  return { error: "Non autorisé" }
}
// session.user = { id, email, role, name }
```

### Slug generation utility
Location: `src/lib/slug.ts`
```ts
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}
```

## Verified APIs / functions

### NextAuth session
From `src/lib/auth.ts`:
```ts
export const { handlers, signIn, signOut, auth } = NextAuth({...})
```
Usage: `const session = await auth()` returns `{ user: { id, email, role, name }, expires }` or null.

### Zod validation (s02 pattern)
```ts
import { z } from "zod"
const schema = z.object({...})
const validation = schema.safeParse(data)
if (!validation.success) {
  return { error: validation.error.issues[0].message }
}
```

### Prisma operations
```ts
import { prisma } from "@/lib/prisma"
await prisma.course.create({ data: {...} })
await prisma.course.findMany({ where: { profId } })
await prisma.course.update({ where: { id }, data: {...} })
await prisma.course.delete({ where: { id } })
```

### Redirect (Next.js)
```ts
import { redirect } from "next/navigation"
// At end of Server Action:
redirect(`/dashboard/courses/${course.id}`)
```

## Traps & constraints

### 1. Slug uniqueness scope
Constraint: `@@unique([profId, slug])` means slug is unique per prof, not globally. This allows two profs to have a course named "mon-cours".

### 2. Role verification required
Middleware protects routes but doesn't check role. Server Actions MUST verify `session.user.role === "PROF"` before mutation.

### 3. Price in cents
Schema: `price Int` stores cents (9999 = €99.99). Form accepts euros, convert: `Math.round(parseFloat(input) * 100)`.

### 4. No file upload (MVP)
Thumbnail is an external URL (text input), not file upload. Prof pastes URL.

### 5. Status field
`status` defaults to DRAFT. This story creates courses in DRAFT. Publishing is story s06-sales-page.

### 6. PricingMode not needed yet
Architecture defines `pricingMode` enum, but s03 only needs ONE_SHOT. Subscriptions come in s13. Either omit the field for now or include with default.

### 7. Relations to future tables
Architecture shows Course relating to modules, purchases, posts, subscriptions. For s03, only the `prof` relation is needed. Other relations added in later stories.

### 8. Dialog + Textarea not installed
Need to add shadcn components: `npx shadcn add dialog textarea`.

## Open questions

1. **Delete behavior**: Hard delete vs soft delete? Architecture mentions `deletedAt`, but acceptance criteria says "soft delete OR confirmation". Recommend hard delete + confirmation dialog for MVP simplicity.

2. **Course list UI**: Cards (visual, mobile-friendly) vs table (scannable)? Recommend cards, responsive grid.

3. **Edit UX**: Separate `/courses/[id]/edit` page or same `/courses/[id]` as edit form? Recommend `/courses/[id]` doubles as edit page (Server Component fetches course, renders form).

4. **Minimal Course model**: Include only fields needed for s03 (title, slug, description, price, thumbnailUrl, status, profId) or the full architecture model? Recommend minimal — add fields as needed in later stories.
