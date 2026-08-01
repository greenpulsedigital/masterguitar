import { describe, it, expect } from 'vitest'
import { existsSync, readFileSync } from 'fs'
import { resolve } from 'path'

describe('Task 4: Middleware for route protection', () => {
  it('should have middleware file at project root', () => {
    const middlewarePath = resolve(process.cwd(), 'middleware.ts')
    expect(existsSync(middlewarePath)).toBe(true)
  })

  it('should export auth as middleware', () => {
    const middlewarePath = resolve(process.cwd(), 'middleware.ts')
    const content = readFileSync(middlewarePath, 'utf-8')

    // Verify it imports auth from lib/auth
    expect(content).toContain('@/lib/auth')

    // Verify it exports auth as middleware
    expect(content).toContain('middleware')
  })

  it('should have config with dashboard matcher', () => {
    const middlewarePath = resolve(process.cwd(), 'middleware.ts')
    const content = readFileSync(middlewarePath, 'utf-8')

    // Verify config exports matcher for /dashboard/*
    expect(content).toContain('config')
    expect(content).toContain('matcher')
    expect(content).toContain('/dashboard')
  })
})
