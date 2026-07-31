import { describe, it, expect } from 'vitest'
import { z } from 'zod'

describe('Critical: Zod v4 API compatibility', () => {
  it('should use .issues not .errors on ZodError', () => {
    const schema = z.object({
      email: z.string().email("Email invalide"),
    })

    const result = schema.safeParse({ email: 'invalid' })

    expect(result.success).toBe(false)

    if (!result.success) {
      // Zod v4 uses .issues, not .errors
      expect(result.error.issues).toBeDefined()
      expect(result.error.issues[0]).toBeDefined()
      expect(result.error.issues[0].message).toBe("Email invalide")

      // This should NOT exist in Zod v4
      // @ts-expect-error - .errors doesn't exist in Zod v4
      expect(result.error.errors).toBeUndefined()
    }
  })

  it('should correctly extract first error message from validation', () => {
    const loginSchema = z.object({
      email: z.string().email("Email invalide"),
      password: z.string().min(1, "Le mot de passe est requis"),
    })

    const result = loginSchema.safeParse({ email: 'bad', password: '' })

    if (!result.success) {
      // Correct Zod v4 API
      const firstErrorMessage = result.error.issues[0].message
      expect(firstErrorMessage).toBeTruthy()
      expect(typeof firstErrorMessage).toBe('string')
    }
  })
})
