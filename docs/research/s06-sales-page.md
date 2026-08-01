# Research — Story s06-sales-page

## Target story

**As a** prof **I want** une page de vente publique pour mon cours **so that** les élèves potentiels peuvent découvrir et acheter.

### Acceptance criteria
- [ ] Chaque cours publié a une URL publique `/cours/[slug]`
- [ ] La page affiche: titre, description, thumbnail, prix, curriculum (modules)
- [ ] Un bouton "Acheter" est visible
- [ ] La page est mobile-first et design "studio"
- [ ] Un cours en draft n'est pas accessible publiquement

### Dependencies
- s03-course-crud (completed on main)

### Agentic notes
- Route publique: `/cours/[slug]`
- Pas de paiement ici — juste la page, le bouton mène à checkout (s07)
- Design premium: typographie soignée, espaces, ambiance sombre
- Référence Podia: page de vente d'un produit

---

## Current state of the code

### Route structure
```
src/app/
├── (auth)/          # Login, signup
├── (dashboard)/     # Prof dashboard (protected)
├── api/             # API routes
├── layout.tsx       # Root layout (dark mode, Geist fonts)
├── globals.css      # Tailwind v4 + shadcn tokens
└── page.tsx         # Home page
```

**No `(public)` group exists yet.** The `/cours/[slug]` route must be created.

### Prisma schema (current)
```prisma
model Course {
  id           String       @id @default(cuid())
  slug         String
  title        String
  description  String?
  price        Int          // cents
  thumbnailUrl String?
  status       CourseStatus @default(DRAFT)
  profId       String
  prof         User         @relation(...)
  modules      Module[]

  @@unique([profId, slug])  // slug unique per prof, NOT globally
}

enum CourseStatus {
  DRAFT
  PUBLISHED
}

model Module {
  id       String @id @default(cuid())
  title    String
  order    Int
  courseId String
  course   Course @relation(...)
}
```

**Note**: `Lesson` model exists in s05-video-lessons branch but NOT on main. This story depends only on s03, so we work with modules only (no lessons in curriculum display).

### Existing components
| Component | Path | Relevance |
|-----------|------|-----------|
| `Header` | `src/components/header.tsx` | Shared, includes auth state |
| `Footer` | `src/components/footer.tsx` | Shared |
| `Button` | `src/components/ui/button.tsx` | CTA "Acheter" |
| `Card` | `src/components/ui/card.tsx` | Content sections |
| `Badge` | `src/components/ui/badge.tsx` | Status indicators |

### Design tokens (globals.css)
- Dark mode default: `html` has `className="dark"`
- Primary (electric blue): `oklch(0.65 0.25 250)`
- Background: `oklch(0.145 0 0)`
- Card: `oklch(0.205 0 0)`
- Muted foreground: `oklch(0.708 0 0)`

---

## Anchor points

### Route location
Create: `src/app/cours/[slug]/page.tsx`

No route group needed — `/cours` is a public route at app root level.

### Data fetching
Server Component fetches course by slug:
```ts
const course = await prisma.course.findFirst({
  where: {
    slug,
    status: "PUBLISHED"  // enforce published-only
  },
  include: {
    modules: { orderBy: { order: "asc" } },
    prof: { select: { name: true } }  // optional: show prof name
  }
})
```

### Layout
Uses root `layout.tsx` (Header + Footer shared).

---

## Verified APIs / functions

### Prisma Course model
- Location: `prisma/schema.prisma:37-54`
- Fields: id, slug, title, description, price, thumbnailUrl, status, profId
- Status enum: `DRAFT | PUBLISHED`
- Modules relation: `modules Module[]`

### Prisma client
- Location: `src/lib/prisma.ts`
- Import: `import { prisma } from "@/lib/prisma"`

### Slug generation (for reference)
- Location: `src/lib/slug.ts`
- Function: `generateSlug(text: string): string`
- Note: French accents are stripped (e.g., "Débuter" → "dbuter")

### Button component
- Location: `src/components/ui/button.tsx`
- Variants: default, secondary, outline, ghost, destructive, link
- Sizes: xs, sm, default, lg, icon, icon-xs, icon-sm, icon-lg

### Card component
- Location: `src/components/ui/card.tsx`
- Parts: Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter

---

## Traps & constraints

### 1. Slug uniqueness issue (CRITICAL)
**Problem**: `@@unique([profId, slug])` means two profs can have courses with the same slug.

**Impact**: A simple `/cours/[slug]` route cannot guarantee uniqueness.

**Options**:
| Option | Pros | Cons |
|--------|------|------|
| A. Make slug globally unique (schema change) | Simple URL, SEO-friendly | Requires migration, slug collisions |
| B. Use `/cours/[courseId]` | Guaranteed unique | Ugly URLs, poor SEO |
| C. Use `/prof/[profSlug]/[courseSlug]` | Namespace clarity | Requires User.slug field |
| D. Query first matching published course | Works now | Ambiguous if collision |

**Recommendation**: Option A (make slug globally unique) is the cleanest for a sales page. This requires a schema migration and an ADR.

### 2. No publishCourse action yet
The dashboard has no UI to toggle course status (DRAFT → PUBLISHED). This story needs:
- Either a `publishCourse` server action
- Or we test with direct DB seeding

**Decision for plan**: Add a `toggleCourseStatus` action in this story (minor scope creep but necessary for the feature to be usable).

### 3. Price formatting
Course.price is stored in **cents** (e.g., 4900 = 49.00€). Need a `formatPrice(cents: number): string` helper.

### 4. No lessons yet (main branch)
On main, Module has no `lessons` relation. The curriculum section shows modules only.

When s05 merges, the sales page could be enhanced to show lessons count per module — but that's future scope.

### 5. Existing tests
23 test files exist. Key ones to not break:
- `course-crud.test.ts` — CRUD actions
- `course-validation.test.ts` — schema validation
- `module-crud.test.ts` — module actions

New tests needed:
- `sales-page.test.tsx` — page rendering
- `getCourseBySlug.test.ts` — data fetching logic

### 6. Mobile-first requirement
Design system specifies:
- Start at 375px width
- Breakpoints: `md:` (768px), `lg:` (1024px)
- Touch targets: min 44x44px
- Stack layouts on mobile

---

## Open questions

### 1. Slug uniqueness decision
**Question**: Should we make slug globally unique (schema change + migration)?

**Recommendation**: Yes. A sales page URL must be stable and unambiguous. Two profs with `/cours/guitare-debutant` would be a UX disaster.

**Action**: Create ADR 006-global-slug.md documenting this decision.

### 2. Where does "Acheter" button link?
**Story says**: Button leads to checkout (s07).

**For now**: Link to `#` or `/checkout/[courseId]` (404 until s07). The button must exist and be visible per acceptance criteria.

### 3. Prof name display?
**Question**: Should the sales page show the prof's name?

**Recommendation**: Yes — adds trust. User.name is optional, fallback to email prefix or "Instructeur".

### 4. Thumbnail placeholder?
**Question**: What to show if `thumbnailUrl` is null?

**Recommendation**: A gradient placeholder with course title, or a generic guitar image. Not a broken image.

---

## Summary for planning

**Must do**:
1. Schema migration: make slug globally unique (`@@unique` on slug alone)
2. Create route `src/app/cours/[slug]/page.tsx`
3. Create `getCourseBySlug` query (published only, include modules)
4. Create `formatPrice` helper
5. Add `toggleCourseStatus` action (draft ↔ published)
6. Build sales page UI (hero, description, curriculum, CTA)
7. Handle 404 for draft or non-existent courses
8. Write tests

**Design system components to use**:
- Card (hero section, curriculum)
- Button (CTA)
- Badge (status, price)

**No new components needed** — compose from existing primitives.
