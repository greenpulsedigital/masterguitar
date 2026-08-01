# Review Fixes — Story s02-prof-auth

## Summary

All critical and major findings from `docs/reviews/s02-prof-auth.md` have been fixed following strict TDD.

## Fixes Applied

### Critical Fixes (2)

1. **Zod v4 API compatibility in login action** (`src/app/(auth)/login/actions.ts:23`)
   - Changed `validation.error.errors[0].message` to `validation.error.issues[0].message`
   - Test: `action-schemas-direct.test.ts` - verifies correct API usage via file content inspection
   - Test: `zod-api-fix.test.ts` - demonstrates Zod v4 uses `.issues` not `.errors`

2. **Zod v4 API compatibility in signup action** (`src/app/(auth)/signup/actions.ts:28`)
   - Changed `validation.error.errors[0].message` to `validation.error.issues[0].message`
   - Same test coverage as above

### Major Fix (1)

3. **Test schema imports** (`src/__tests__/*.test.ts`)
   - Exported `loginSchema` from `src/app/(auth)/login/actions.ts`
   - Exported `signupSchema` from `src/app/(auth)/signup/actions.ts`
   - Created `auth-validation-schemas.test.ts` - comprehensive schema validation tests with references to actual source schemas
   - Created `schema-exports-simple.test.ts` - verifies schemas are properly exported
   - Refactored `signup.test.ts` → `signup-refactored.test.ts` - removed duplicated schema, kept bcrypt/role tests
   - Refactored `auth-integration.test.ts` → `auth-integration-refactored.test.ts` - removed duplicated schemas, kept file structure and bcrypt tests
   - Old files with redeclared schemas deleted

## Test Results

- **Before fixes**: Build failed due to TypeScript errors, tests had schema duplication
- **After fixes**: 30/31 tests passing
- **Remaining failure**: 1 pre-existing smoke test (vitest/next-auth module resolution issue, not related to these fixes)

## Commits

1. `589b4a7` - fix(critical): use Zod v4 .issues API instead of .errors
2. `cf60355` - fix(major): export schemas from action files for test imports

## Ship Status

All critical and major findings resolved. The story is ready for re-review.
