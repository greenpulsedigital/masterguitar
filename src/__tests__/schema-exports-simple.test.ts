import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import { resolve } from 'path'

/**
 * Test that schemas are exported from action files (major fix requirement).
 * This allows tests to import actual schemas instead of redeclaring them.
 */
describe('Major: Schemas are exported from action files', () => {
  it('login actions file exports loginSchema', () => {
    const loginPath = resolve(process.cwd(), 'src/app/(auth)/login/actions.ts')
    const content = readFileSync(loginPath, 'utf-8')

    // Should export the schema
    expect(content).toContain('export const loginSchema')
  })

  it('signup actions file exports signupSchema', () => {
    const signupPath = resolve(process.cwd(), 'src/app/(auth)/signup/actions.ts')
    const content = readFileSync(signupPath, 'utf-8')

    expect(content).toContain('export const signupSchema')
  })
})
