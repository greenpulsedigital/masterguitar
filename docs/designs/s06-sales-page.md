# Design — Story s06-sales-page

## Screen(s)

### Sales Page (`/cours/[slug]`)

Single-page layout with vertical sections, mobile-first.

**Layout (mobile → desktop)**:
```
┌─────────────────────────────────────┐
│ [Header - shared]                   │
├─────────────────────────────────────┤
│                                     │
│  ┌─────────────────────────────┐    │
│  │      THUMBNAIL / HERO       │    │
│  │      (16:9 aspect ratio)    │    │
│  └─────────────────────────────┘    │
│                                     │
│  TITLE (text-3xl, font-bold)        │
│  by PROF NAME (text-muted-foreground)│
│                                     │
│  ┌─────────────────────────────┐    │
│  │ PRICE        [ACHETER btn]  │    │  ← sticky on mobile
│  └─────────────────────────────┘    │
│                                     │
│  ─────────────────────────────────  │
│                                     │
│  DESCRIPTION                        │
│  (text-base, prose-like spacing)    │
│                                     │
│  ─────────────────────────────────  │
│                                     │
│  CURRICULUM                         │
│  ┌─────────────────────────────┐    │
│  │ Module 1                    │    │
│  ├─────────────────────────────┤    │
│  │ Module 2                    │    │
│  ├─────────────────────────────┤    │
│  │ Module 3                    │    │
│  └─────────────────────────────┘    │
│                                     │
├─────────────────────────────────────┤
│ [Footer - shared]                   │
└─────────────────────────────────────┘
```

**Desktop enhancement (lg:)**:
- Two-column layout: content left (60%), sticky sidebar right (40%)
- Sidebar contains: price, CTA button, prof info
- Thumbnail spans full width above columns

### Sections

1. **Hero / Thumbnail**
   - Full-width image (16:9 aspect ratio)
   - Gradient placeholder if no thumbnail: dark gradient with subtle texture
   - Rounded corners (`rounded-lg`)

2. **Title + Prof**
   - Course title: `text-3xl md:text-4xl font-bold`
   - Prof name: `text-muted-foreground` with "par" prefix
   - Spacing: `gap-2`

3. **Price + CTA (sticky on mobile)**
   - Price badge: large, prominent (`text-2xl font-semibold`)
   - Format: "49,00 €" (French locale)
   - Button: `variant="default" size="lg"` full-width on mobile
   - On mobile: sticky bottom bar with blur backdrop

4. **Description**
   - Prose styling: `text-base leading-relaxed`
   - Whitespace preserved (newlines → paragraphs)
   - Max-width for readability on desktop

5. **Curriculum**
   - Section title: "Programme du cours" (`text-2xl font-semibold`)
   - Module list in Card
   - Each module: title + order badge
   - Numbered list styling

---

## Mockup

`docs/designs/s06-sales-page.html` — visual reference. DO NOT copy into production: Execute builds with the real components.

---

## Reused components (from the design system)

| Component | Where | Why |
|-----------|-------|-----|
| `Button` | CTA "Acheter" | Primary action, `variant="default" size="lg"` |
| `Card` | Curriculum section | Groups module list |
| `Badge` | Module numbers | Visual order indicator |

---

## States

### Normal (happy path)
- Course found, PUBLISHED status
- All data displayed (thumbnail, title, description, modules)

### Empty curriculum
- No modules yet → show message: "Le programme sera bientôt disponible"
- Still show title, description, price, CTA

### No thumbnail
- Gradient placeholder with course initials or generic icon
- Dark gradient: `bg-gradient-to-br from-muted to-background`

### 404 (not found / draft)
- Course doesn't exist OR status is DRAFT
- Next.js `notFound()` → standard 404 page
- No custom design needed

### Loading
- Server Component renders on server → no loading state needed
- If client navigation, Next.js shows loading.tsx (out of scope)

---

## Design system gaps

**None identified.** All needs covered by existing tokens and components:
- Colors: background, foreground, card, muted-foreground, primary
- Typography: text-3xl, text-2xl, text-base, font-bold, font-semibold
- Components: Button, Card, Badge
- Spacing: gap-4, gap-6, p-4, p-6
