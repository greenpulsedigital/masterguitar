import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import { resolve } from 'path'

/**
 * Test that schemas are exported from dedicated schema files, not the "use server"
 * action files. Next.js requires every export of a "use server" file to be an
 * async function, so schemas live in a sibling schema.ts and are imported by
 * the action. This allows tests to import actual schemas instead of redeclaring them.
 */
describe('Major: Schemas are exported from dedicated schema files', () => {
  it('login schema file exports loginSchema', () => {
    const loginPath = resolve(process.cwd(), 'src/app/(auth)/login/schema.ts')
    const content = readFileSync(loginPath, 'utf-8')

    expect(content).toContain('export const loginSchema')
  })

  it('signup schema file exports signupSchema', () => {
    const signupPath = resolve(process.cwd(), 'src/app/(auth)/signup/schema.ts')
    const content = readFileSync(signupPath, 'utf-8')

    expect(content).toContain('export const signupSchema')
  })

  it('login actions file does not export non-function values ("use server" constraint)', () => {
    const loginPath = resolve(process.cwd(), 'src/app/(auth)/login/actions.ts')
    const content = readFileSync(loginPath, 'utf-8')

    expect(content).not.toContain('export const loginSchema')
  })

  it('signup actions file does not export non-function values ("use server" constraint)', () => {
    const signupPath = resolve(process.cwd(), 'src/app/(auth)/signup/actions.ts')
    const content = readFileSync(signupPath, 'utf-8')

    expect(content).not.toContain('export const signupSchema')
  })
})
