import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import { resolve } from 'path'

/**
 * This test exposes the critical bug: login and signup actions use
 * validation.error.errors[0] but Zod v4 uses .issues not .errors
 */
describe('Critical: Action files use correct Zod v4 API', () => {
  it('login action should use .issues not .errors', () => {
    const loginPath = resolve(process.cwd(), 'src/app/(auth)/login/actions.ts')
    const content = readFileSync(loginPath, 'utf-8')

    // The bug: using .errors instead of .issues
    const hasErrorsUsage = content.includes('validation.error.errors[0]')
    const hasIssuesUsage = content.includes('validation.error.issues[0]')

    // Should use .issues (Zod v4 API)
    expect(hasIssuesUsage).toBe(true)
    // Should NOT use .errors (incorrect API)
    expect(hasErrorsUsage).toBe(false)
  })

  it('signup action should use .issues not .errors', () => {
    const signupPath = resolve(process.cwd(), 'src/app/(auth)/signup/actions.ts')
    const content = readFileSync(signupPath, 'utf-8')

    const hasErrorsUsage = content.includes('validation.error.errors[0]')
    const hasIssuesUsage = content.includes('validation.error.issues[0]')

    expect(hasIssuesUsage).toBe(true)
    expect(hasErrorsUsage).toBe(false)
  })
})
