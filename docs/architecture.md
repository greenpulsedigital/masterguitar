# Architecture — MasterGuitar

## Stack

| Layer | Technology | Version |
|-------|------------|---------|
| Framework | Next.js (App Router) | 16.x |
| Language | TypeScript | 5.x |
| UI | React + shadcn/ui (base-nova) | React 19.x |
| Styling | Tailwind CSS v4 | 4.x |
| Database | PostgreSQL + Prisma | Prisma 7.x |
| Auth | NextAuth.js (Auth.js v5 beta) | 5.x |
| Payments | Stripe (Checkout + Subscriptions) | stripe 22.x |
| Icons | Lucide React | 1.x |

## Repo structure

```
/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── (auth)/             # Auth routes group (login, signup)
│   │   ├── (dashboard)/        # Prof dashboard routes
│   │   ├── (public)/           # Public routes (sales pages)
│   │   ├── apprendre/          # Student course player
│   │   ├── api/                # API routes (webhooks, etc.)
│   │   ├── layout.tsx          # Root layout
│   │   └── globals.css         # Tailwind + shadcn theme
│   ├── components/
│   │   ├── ui/                 # shadcn/ui primitives
│   │   └── [feature]/          # Feature-specific components
│   ├── lib/
│   │   ├── utils.ts            # shadcn cn() helper
│   │   ├── prisma.ts           # Prisma client singleton
│   │   ├── auth.ts             # NextAuth config
│   │   └── stripe.ts           # Stripe client
│   ├── generated/
│   │   └── prisma/             # Prisma generated client
│   └── hooks/                  # Custom React hooks
├── prisma/
│   └── schema.prisma           # Data model
├── public/                     # Static assets
├── docs/                       # Pipeline docs (PRD, stories, plans, reviews)
├── templates/                  # killer-saas templates
└── .claude/                    # Commands, skills, agents
```

## Patterns & conventions

### Naming

| Item | Convention | Example |
|------|------------|---------|
| Files (components) | kebab-case | `course-card.tsx` |
| Files (routes) | Next.js conventions | `page.tsx`, `layout.tsx` |
| Components | PascalCase | `CourseCard` |
| Functions | camelCase | `getCourseBySlug` |
| DB tables | PascalCase (Prisma) | `Course`, `Module`, `Lesson` |
| DB fields | camelCase | `createdAt`, `videoUrl` |
| CSS variables | kebab-case | `--color-primary` |
| Route groups | parentheses | `(auth)`, `(dashboard)` |

### Organization

- **Colocation**: components used by one route live in that route's folder
- **Shared components**: `src/components/` for cross-route components
- **Server-first**: default to Server Components, use `"use client"` only when needed
- **Data fetching**: Server Components fetch directly, no client-side fetching for initial data
- **Forms**: Server Actions for mutations, progressive enhancement

### Rules

1. **Mobile-first**: all layouts start from mobile, use `md:` / `lg:` breakpoints up
2. **Dark mode default**: the "studio" theme means dark by default, light as fallback
3. **No barrel exports**: import directly from file, not from `index.ts`
4. **Absolute imports**: use `@/` alias, never relative `../../../`
5. **Type safety**: no `any`, no `// @ts-ignore` without justification

## Data model

```prisma
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  passwordHash  String
  name          String?
  role          Role      @default(STUDENT)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  courses       Course[]      // as prof
  purchases     Purchase[]    // as student
  progress      Progress[]
  posts         Post[]
  subscriptions Subscription[]
}

enum Role {
  STUDENT
  PROF
}

model Course {
  id           String   @id @default(cuid())
  slug         String   @unique
  title        String
  description  String?
  price        Int      // cents
  thumbnailUrl String?
  status       CourseStatus @default(DRAFT)
  pricingMode  PricingMode  @default(ONE_SHOT)
  monthlyPrice Int?     // cents, for subscriptions
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  profId       String
  prof         User     @relation(fields: [profId], references: [id])

  modules      Module[]
  purchases    Purchase[]
  posts        Post[]
  subscriptions Subscription[]

  // Affiliation
  affiliationEnabled Boolean @default(false)
  commissionPercent  Int?

  // Upsell
  upsellCourseId String?
}

enum CourseStatus {
  DRAFT
  PUBLISHED
}

enum PricingMode {
  ONE_SHOT
  SUBSCRIPTION
}

model Module {
  id        String   @id @default(cuid())
  title     String
  order     Int
  courseId  String
  course    Course   @relation(fields: [courseId], references: [id], onDelete: Cascade)
  lessons   Lesson[]
}

model Lesson {
  id          String   @id @default(cuid())
  title       String
  description String?
  videoUrl    String?
  tabUrl      String?  // PDF or image URL for tablature
  order       Int
  moduleId    String
  module      Module   @relation(fields: [moduleId], references: [id], onDelete: Cascade)
  progress    Progress[]
}

model Purchase {
  id              String   @id @default(cuid())
  amount          Int      // cents
  stripePaymentId String
  createdAt       DateTime @default(now())

  userId   String
  user     User   @relation(fields: [userId], references: [id])
  courseId String
  course   Course @relation(fields: [courseId], references: [id])

  // Affiliation tracking
  affiliateId String?
}

model Subscription {
  id                   String   @id @default(cuid())
  stripeSubscriptionId String   @unique
  status               SubscriptionStatus @default(ACTIVE)
  currentPeriodEnd     DateTime
  createdAt            DateTime @default(now())

  userId   String
  user     User   @relation(fields: [userId], references: [id])
  courseId String
  course   Course @relation(fields: [courseId], references: [id])
}

enum SubscriptionStatus {
  ACTIVE
  CANCELED
  PAST_DUE
}

model Progress {
  id          String   @id @default(cuid())
  completedAt DateTime @default(now())

  userId   String
  user     User   @relation(fields: [userId], references: [id])
  lessonId String
  lesson   Lesson @relation(fields: [lessonId], references: [id], onDelete: Cascade)

  @@unique([userId, lessonId])
}

model Post {
  id        String   @id @default(cuid())
  content   String
  createdAt DateTime @default(now())
  deletedAt DateTime? // soft delete

  userId    String
  user      User   @relation(fields: [userId], references: [id])
  courseId  String
  course    Course @relation(fields: [courseId], references: [id])
  parentId  String? // for replies
}

model Affiliate {
  id              String   @id @default(cuid())
  code            String   @unique
  commissionRate  Int      // percentage
  createdAt       DateTime @default(now())

  userId String
  conversions AffiliateConversion[]
}

model AffiliateConversion {
  id          String   @id @default(cuid())
  amount      Int      // commission earned in cents
  createdAt   DateTime @default(now())

  affiliateId String
  affiliate   Affiliate @relation(fields: [affiliateId], references: [id])
  purchaseId  String
}

model Bundle {
  id          String   @id @default(cuid())
  slug        String   @unique
  title       String
  description String?
  price       Int      // cents
  createdAt   DateTime @default(now())

  profId String
  courseIds  String[] // array of course IDs
}
```

## Integration points

### Auth (NextAuth.js v5)

- **Provider**: Credentials (email + password)
- **Session strategy**: JWT
- **Protected routes**: middleware checks session, redirects to `/login`
- **Roles**: `STUDENT` (default), `PROF` — stored in JWT

### Payments (Stripe)

- **Checkout**: Stripe Checkout (hosted) for one-shot purchases
- **Subscriptions**: Stripe Billing for monthly access
- **Webhooks**: `/api/webhooks/stripe` handles:
  - `checkout.session.completed` → create Purchase
  - `customer.subscription.created` → create Subscription
  - `customer.subscription.deleted` → revoke access
  - `invoice.payment_failed` → mark PAST_DUE
- **Connect**: NOT used — profs receive payments directly, platform charges a flat SaaS fee

### Video hosting (external)

- **Embed**: YouTube, Vimeo, Bunny Stream, Mux — just a URL
- **Player**: native embed or custom wrapper for playback controls
- **No self-hosting**: video storage/transcoding out of scope

### Tablatures

- **Format**: PDF or image URL
- **Display**: simple viewer (PDF.js or `<img>`)
- **No parsing**: Guitar Pro / ASCII rendering is future scope

## Design / UX

See `docs/design-system.md` for the full design system.

Key flows:
1. **Prof onboarding**: signup → dashboard → create course → add modules/lessons → publish → share link
2. **Student purchase**: sales page → Stripe Checkout → confirmation → my courses
3. **Student learning**: my courses → course player (sidebar + video) → mark complete → progress

Mobile-first: all flows designed for phone first, enhanced for desktop.
