import { describe, it, expect } from 'vitest'
import { z } from 'zod'
import * as bcrypt from 'bcryptjs'

describe('Task 2: NextAuth configuration', () => {
  it('should hash passwords with bcrypt', async () => {
    const password = 'testPassword123'
    const hash = await bcrypt.hash(password, 10)

    expect(hash).toBeDefined()
    expect(hash).not.toBe(password)

    const isValid = await bcrypt.compare(password, hash)
    expect(isValid).toBe(true)

    const isInvalid = await bcrypt.compare('wrongPassword', hash)
    expect(isInvalid).toBe(false)
  })

  it('should validate credentials with Zod', () => {
    const credentialsSchema = z.object({
      email: z.string().email(),
      password: z.string().min(8),
    })

    // Valid credentials
    const validResult = credentialsSchema.safeParse({
      email: 'test@example.com',
      password: 'password123',
    })
    expect(validResult.success).toBe(true)

    // Invalid email
    const invalidEmail = credentialsSchema.safeParse({
      email: 'notanemail',
      password: 'password123',
    })
    expect(invalidEmail.success).toBe(false)

    // Password too short
    const invalidPassword = credentialsSchema.safeParse({
      email: 'test@example.com',
      password: 'short',
    })
    expect(invalidPassword.success).toBe(false)
  })
})
