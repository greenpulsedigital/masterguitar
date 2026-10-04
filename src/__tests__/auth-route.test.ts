import { describe, it, expect } from 'vitest'
import { existsSync } from 'fs'
import { resolve } from 'path'
import * as fs from 'fs'

describe('Task 3: Auth API route', () => {
  it('should have auth route file at correct location', () => {
    const routePath = resolve(
      process.cwd(),
      'src/app/api/auth/[...nextauth]/route.ts'
    )

    expect(existsSync(routePath)).toBe(true)
  })

  it('should export handlers from auth lib', () => {
    // This verifies the route is structured correctly
    // Full HTTP testing would require a running Next.js server
    const routePath = resolve(
      process.cwd(),
      'src/app/api/auth/[...nextauth]/route.ts'
    )

    const content = fs.readFileSync(routePath, 'utf-8')

    // Verify it imports from the auth lib
    expect(content).toContain('from "@/lib/auth"')

    // Verify it exports GET and POST
    expect(content).toContain('GET')
    expect(content).toContain('POST')
  })
})
