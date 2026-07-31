# Research — Story s02-prof-auth

## Target story

**As a** prof de guitare **I want** créer un compte et me connecter **so that** je peux accéder à mon espace de création de cours.

### Acceptance criteria
- [ ] Un prof peut s'inscrire avec email + mot de passe
- [ ] Un prof peut se connecter
- [ ] Un prof peut se déconnecter
- [ ] Les routes `/dashboard/*` sont protégées (redirect si non connecté)
- [ ] Le prof voit son email dans le header une fois connecté

## Current state of the code

### Already exists
| Item | Location | Notes |
|------|----------|-------|
| NextAuth.js v5 | `package.json` | `next-auth@^5.0.0-beta.32` installed |
| User model | `prisma/schema.prisma` | `id`, `email`, `passwordHash`, `name`, `role`, `createdAt`, `updatedAt` |
| Role enum | `prisma/schema.prisma` | `STUDENT`, `PROF` |
| Prisma client | `src/lib/prisma.ts` | Singleton pattern, needs adapter config |
| Header component | `src/components/header.tsx` | Has nav placeholder for auth links |
| Generated Prisma | `src/generated/prisma/` | Client generated with User model |

### Not yet implemented
| Item | Notes |
|------|-------|
| NextAuth config | `src/lib/auth.ts` — Credentials provider, JWT strategy |
| Auth middleware | `middleware.ts` — protect `/dashboard/*` |
| Signup page | `src/app/(auth)/signup/page.tsx` |
| Login page | `src/app/(auth)/login/page.tsx` |
| Dashboard page | `src/app/(dashboard)/dashboard/page.tsx` |
| Password hashing | bcrypt or argon2 — need to install |
| Header auth display | Show email + logout button when logged in |

## Anchor points

### NextAuth v5 setup
Per ADR 003, use:
- Credentials provider (email + password)
- JWT session strategy
- Middleware for route protection

NextAuth v5 API (Auth.js):
```ts
// src/lib/auth.ts
import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [Credentials({...})],
  session: { strategy: "jwt" },
  callbacks: {
    jwt({ token, user }) { ... },
    session({ session, token }) { ... },
  },
})
```

### Route structure (per architecture)
```
src/app/
├── (auth)/           # Auth route group
│   ├── login/page.tsx
│   └── signup/page.tsx
├── (dashboard)/      # Protected route group
│   └── dashboard/page.tsx
└── api/
    └── auth/[...nextauth]/route.ts   # NextAuth API route
```

### Middleware location
File: `middleware.ts` (root of project, NOT in src/)
```ts
export { auth as middleware } from "@/lib/auth"
export const config = {
  matcher: ["/dashboard/:path*"]
}
```

### Header integration
File: `src/components/header.tsx`
- Import `auth` from `@/lib/auth`
- If session exists: show email + logout button
- If no session: show login/signup links

## Verified APIs / functions

### NextAuth v5 exports
Package: `next-auth@5.0.0-beta.32`
- `NextAuth(config)` → returns `{ handlers, signIn, signOut, auth }`
- `auth()` → returns session or null (for Server Components)
- `signIn(provider, options)` → initiates sign-in
- `signOut(options)` → signs out

### Credentials provider
```ts
import Credentials from "next-auth/providers/credentials"
Credentials({
  credentials: {
    email: { label: "Email", type: "email" },
    password: { label: "Password", type: "password" },
  },
  authorize: async (credentials) => { ... }
})
```

### Prisma User model
Location: `prisma/schema.prisma:20-28`
```prisma
model User {
  id           String   @id @default(cuid())
  email        String   @unique
  passwordHash String
  name         String?
  role         Role     @default(STUDENT)
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
}
```

### Password hashing
Need to install: `bcryptjs` (pure JS, no native deps) or `bcrypt`
```ts
import bcrypt from "bcryptjs"
const hash = await bcrypt.hash(password, 10)
const valid = await bcrypt.compare(password, hash)
```

## Traps & constraints

### NextAuth v5 breaking changes
- v5 is still beta — API may differ from v4 docs
- Uses `auth()` instead of `getServerSession()`
- Middleware export pattern changed
- Route handler: `export { GET, POST } from "@/lib/auth"`

### Prisma adapter not used
Per ADR 003, we use JWT sessions, NOT database sessions. No `@next-auth/prisma-adapter` needed.

### Prisma client @ts-nocheck
File `src/lib/prisma.ts` has `@ts-nocheck` — this story should properly configure the adapter or keep the nocheck with justification.

### Route groups don't affect URL
- `(auth)` group → `/login` not `/auth/login`
- `(dashboard)` group → `/dashboard` not `/dashboard/dashboard`

### Form handling
Use Server Actions for signup/login forms per architecture (ADR 002).

### Signup role selection
Per ADR 003: "Le rôle PROF est attribué à l'inscription si l'utilisateur choisit 'Je suis prof'". Need a checkbox or toggle on signup form.

## Open questions

1. **Password library**: bcryptjs (pure JS, no native compile issues) vs bcrypt (faster but needs build tools). **Recommendation: bcryptjs** for simplicity.

2. **Form validation**: Use Zod for schema validation? Already a dependency of shadcn. **Recommendation: Yes**, add `zod` for form validation.

3. **shadcn components needed**: Input, Label, Card for forms. **Action**: Add them via `npx shadcn add input label card`.

4. **Error handling UI**: How to display auth errors (wrong password, email taken)? **Recommendation**: Inline error below form, use `text-destructive`.
