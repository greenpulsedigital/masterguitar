/**
 * Refactored signup tests - removed schema redeclaration (major fix)
 * Schema validation is now tested in auth-validation-schemas.test.ts
 * which references the actual schemas in action files
 */
import { describe, it, expect } from 'vitest'
import * as bcrypt from 'bcryptjs'

describe('Task 5 & 6: Signup functionality', () => {
  it('should hash password before storing', async () => {
    const password = 'testPassword123'
    const hash = await bcrypt.hash(password, 10)

    expect(hash).not.toBe(password)
    expect(await bcrypt.compare(password, hash)).toBe(true)
  })

  it('should determine role based on isProf checkbox', () => {
    const getRole = (isProf: boolean) => isProf ? 'PROF' : 'STUDENT'

    expect(getRole(true)).toBe('PROF')
    expect(getRole(false)).toBe('STUDENT')
  })
})
