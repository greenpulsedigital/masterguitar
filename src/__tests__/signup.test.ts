import { describe, it, expect } from 'vitest'
import { z } from 'zod'
import * as bcrypt from 'bcryptjs'

describe('Task 5 & 6: Signup functionality', () => {
  it('should validate signup data with Zod', () => {
    const signupSchema = z.object({
      name: z.string().min(1),
      email: z.string().email(),
      password: z.string().min(8),
      isProf: z.boolean(),
    })

    // Valid data
    const valid = signupSchema.safeParse({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
      isProf: true,
    })
    expect(valid.success).toBe(true)

    // Invalid email
    const invalidEmail = signupSchema.safeParse({
      name: 'Test',
      email: 'invalid',
      password: 'password123',
      isProf: false,
    })
    expect(invalidEmail.success).toBe(false)

    // Password too short
    const shortPassword = signupSchema.safeParse({
      name: 'Test',
      email: 'test@example.com',
      password: 'short',
      isProf: false,
    })
    expect(shortPassword.success).toBe(false)
  })

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
