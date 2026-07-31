# ADR 002 — SQLite for local development

- Status: accepted
- Date: 2026-07-31
- Scope: framing
- Supersedes: ADR 001 (database section only)

## Context

ADR 001 specified PostgreSQL as the database. During s01 implementation, SQLite was chosen instead for local development.

Forces at play:
- **Zero setup**: PostgreSQL requires installing and running a server, managing credentials, ensuring the service is up. SQLite is a single file.
- **Solo developer**: No team coordination needed, local-first workflow.
- **Portability**: Clone + `npm install` + `npm run dev` should work immediately.
- **Prisma compatibility**: Prisma supports both PostgreSQL and SQLite with minimal schema differences.

## Decision

Use **SQLite via LibSQL adapter** for local development:
- `prisma/schema.prisma`: `provider = "sqlite"`
- `src/lib/prisma.ts`: `PrismaLibSql` adapter with `file:./prisma/dev.db`
- Production: Can migrate to PostgreSQL or Turso (LibSQL-compatible) when deploying

## Considered options

- **PostgreSQL locally** — rejected. Requires Docker or native install, service management, connection string setup. Overkill for solo MVP development.
- **SQLite (native)** — rejected in favor of LibSQL. LibSQL provides better edge compatibility and a migration path to Turso.
- **LibSQL/Turso** — retained. File-based locally, can scale to hosted Turso in production. Prisma adapter available.

## Consequences

### What becomes easier
- Onboarding: `npm install && npm run dev` works without DB setup
- CI: No need to provision PostgreSQL for tests
- Backups: Copy the `.db` file

### What becomes harder
- PostgreSQL-specific features (JSONB, arrays, full-text search) are unavailable
- Production migration requires testing the PostgreSQL path separately

### What to watch
- If production targets PostgreSQL, add a `DATABASE_PROVIDER` env var and conditional schema
- Test migrations on PostgreSQL before production deploy
- LibSQL/Turso is the natural production path if staying with SQLite semantics
