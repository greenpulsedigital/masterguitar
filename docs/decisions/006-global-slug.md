# ADR 006: Global Course Slug Uniqueness

## Status
Accepted

## Context

The current schema defines course slug as unique per prof:
```prisma
@@unique([profId, slug])
```

This means two different profs could create courses with the same slug (e.g., both have `/cours/guitare-debutant`).

Story s06-sales-page requires a public sales page at `/cours/[slug]`. With the current constraint, this URL cannot reliably resolve to a single course.

## Decision

Change the slug constraint to be globally unique:
```prisma
slug String @unique
```

Remove the composite unique constraint `@@unique([profId, slug])`.

## Consequences

### Positive
- Simple, SEO-friendly URLs: `/cours/guitare-debutant`
- No ambiguity when resolving course by slug
- Easier to share and remember course URLs

### Negative
- Slug collisions between profs: second prof cannot use a slug that exists
- Requires migration of existing data (if any duplicate slugs exist)

### Mitigation
- For MVP, the number of profs is small and collisions are unlikely
- Future: slug suggestions with availability check, or append prof handle on collision

## Alternatives Considered

| Option | Rejected because |
|--------|-----------------|
| `/cours/[courseId]` | Ugly URLs (cuid), poor SEO |
| `/prof/[profSlug]/[courseSlug]` | Requires User.slug field, more complex |
| Query first matching published course | Ambiguous if collision ever happens |
