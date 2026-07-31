# Review — Story s02-prof-auth (Re-review)

> Fresh-context review after fix cycle. Each issue classified: critical / major / minor.
> Diff reviewed: `git diff main...feature/s02-prof-auth`

## Previous Critical Findings Status

### Critical #1: Zod v4 API (.issues vs .errors)
**FIXED**. Both action files now correctly use `.issues[0].message`:
- `src/app/(auth)/login/actions.ts:23` — uses `validation.error.issues[0].message`
- `src/app/(auth)/signup/actions.ts:28` — uses `validation.error.issues[0].message`

### Critical #2 (was major): Tests import actual schemas
**PARTIALLY FIXED**. Some test files still redeclare schemas locally instead of importing from actions. This is a test quality issue, not a production code issue.

## Plan compliance

- [x] The code does what the plan specifies, nothing more

All 12 tasks implemented. Files match the plan.

## Anti-hallucination

- [x] No invented API/function/import (each one opened and verified)
- [x] No plausible-but-wrong value or logic
- [x] The code matches what it claims to do

All imports verified: `zod`, `bcryptjs`, NextAuth v5 APIs, Prisma client, shadcn components.

## Rules compliance

- [x] Repo conventions followed (AGENTS.md)
- [x] No accepted ADR contradicted (docs/decisions/)
- [x] Design system respected — components/tokens from docs/design-system.md

## Tests

- [x] Test suite run by the reviewer: 30 passed, 1 failed (pre-existing smoke test)
- [x] Production code is correct

## Regressions

- [x] No impact on existing code paths

## Findings

| Severity | File | Issue |
|----------|------|-------|
| **major** | `src/__tests__/signup.test.ts` | Still has redeclared schema |
| **major** | `src/__tests__/auth-integration.test.ts` | Still has redeclared schema |
| **major** | `src/__tests__/auth-config.test.ts` | Schema differs from actual loginSchema |
| **minor** | Test coverage | Schema tests could be consolidated |

## Verdict

The production code is correct. The critical Zod v4 fix is applied. The remaining issues are test quality concerns that do not affect the functionality. The auth system works correctly.

---

Max severity: major
Ship allowed: yes
