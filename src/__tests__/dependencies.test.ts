import { describe, it, expect } from 'vitest'

describe('Task 1: Dependencies', () => {
  it('should have bcryptjs installed', async () => {
    const bcrypt = await import('bcryptjs')
    expect(bcrypt).toBeDefined()
    expect(bcrypt.hash).toBeDefined()
    expect(bcrypt.compare).toBeDefined()
  })

  it('should have zod installed', async () => {
    const zod = await import('zod')
    expect(zod).toBeDefined()
    expect(zod.z).toBeDefined()
  })

  it('should have shadcn Input component', async () => {
    const { Input } = await import('@/components/ui/input')
    expect(Input).toBeDefined()
  })

  it('should have shadcn Label component', async () => {
    const { Label } = await import('@/components/ui/label')
    expect(Label).toBeDefined()
  })

  it('should have shadcn Card components', async () => {
    const card = await import('@/components/ui/card')
    expect(card.Card).toBeDefined()
    expect(card.CardHeader).toBeDefined()
    expect(card.CardContent).toBeDefined()
    expect(card.CardFooter).toBeDefined()
  })

  it('should have shadcn Checkbox component', async () => {
    const { Checkbox } = await import('@/components/ui/checkbox')
    expect(Checkbox).toBeDefined()
  })
})
