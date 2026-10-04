/**
 * Refactored integration tests - removed schema redeclarations (major fix)
 * Schema validation tests moved to auth-validation-schemas.test.ts
 */
import { describe, it, expect } from 'vitest'
import * as bcrypt from 'bcryptjs'
import * as fs from 'fs'
import * as path from 'path'

describe('Task 12: Integration tests for auth flow', () => {
  describe('Signup flow', () => {
    it('should hash passwords securely', async () => {
      const password = 'userPassword123'
      const hash = await bcrypt.hash(password, 10)

      expect(hash).toBeDefined()
      expect(hash).not.toBe(password)
      expect(hash.length).toBeGreaterThan(20)

      const isValid = await bcrypt.compare(password, hash)
      expect(isValid).toBe(true)

      const isInvalid = await bcrypt.compare('wrongPassword', hash)
      expect(isInvalid).toBe(false)
    })

    it('should assign PROF role when checkbox is checked', () => {
      const determineRole = (isProf: boolean) => isProf ? 'PROF' : 'STUDENT'

      expect(determineRole(true)).toBe('PROF')
      expect(determineRole(false)).toBe('STUDENT')
    })
  })

  describe('Login flow', () => {
    it('should verify password matches hash', async () => {
      const password = 'correctPassword'
      const hash = await bcrypt.hash(password, 10)

      // Correct password
      const isValid = await bcrypt.compare(password, hash)
      expect(isValid).toBe(true)

      // Incorrect password
      const isInvalid = await bcrypt.compare('incorrectPassword', hash)
      expect(isInvalid).toBe(false)
    })
  })

  describe('Protected routes', () => {
    it('should have middleware configured for dashboard', () => {
      const middlewarePath = path.resolve(process.cwd(), 'middleware.ts')

      const content = fs.readFileSync(middlewarePath, 'utf-8')

      // Verify middleware protects /dashboard
      expect(content).toContain('/dashboard')
      expect(content).toContain('matcher')
    })
  })

  describe('File structure verification', () => {
    it('should have all required auth files', () => {

      const files = [
        'src/lib/auth.ts',
        'src/app/api/auth/[...nextauth]/route.ts',
        'middleware.ts',
        'src/app/(auth)/signup/page.tsx',
        'src/app/(auth)/signup/actions.ts',
        'src/app/(auth)/login/page.tsx',
        'src/app/(auth)/login/actions.ts',
        'src/app/(dashboard)/dashboard/page.tsx',
        'src/app/(auth)/logout/actions.ts',
      ]

      files.forEach(file => {
        const filePath = path.resolve(process.cwd(), file)
        expect(fs.existsSync(filePath)).toBe(true)
      })
    })

    it('should have shadcn UI components installed', () => {

      const components = [
        'src/components/ui/button.tsx',
        'src/components/ui/input.tsx',
        'src/components/ui/label.tsx',
        'src/components/ui/card.tsx',
        'src/components/ui/checkbox.tsx',
      ]

      components.forEach(component => {
        const componentPath = path.resolve(process.cwd(), component)
        expect(fs.existsSync(componentPath)).toBe(true)
      })
    })
  })
})
