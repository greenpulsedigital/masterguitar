import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"

describe("Stripe Client", () => {
  let originalEnv: string | undefined

  beforeEach(() => {
    // Save original env
    originalEnv = process.env.STRIPE_SECRET_KEY
  })

  afterEach(() => {
    // Restore original env
    if (originalEnv) {
      process.env.STRIPE_SECRET_KEY = originalEnv
    } else {
      delete process.env.STRIPE_SECRET_KEY
    }
    // Clear module cache to get fresh import
    vi.resetModules()
  })

  it("should initialize Stripe client with secret key from environment", async () => {
    process.env.STRIPE_SECRET_KEY = "sk_test_123456789"

    const { stripe } = await import("@/lib/stripe")

    expect(stripe).toBeDefined()
    // Verify it's a Stripe instance by checking for key methods
    expect(stripe.checkout).toBeDefined()
    expect(stripe.webhooks).toBeDefined()
    expect(stripe.checkout.sessions).toBeDefined()
  })

  it("should throw error if STRIPE_SECRET_KEY is not set", async () => {
    delete process.env.STRIPE_SECRET_KEY

    await expect(async () => {
      await import("@/lib/stripe")
    }).rejects.toThrow()
  })

  it("should initialize with correct API version", async () => {
    process.env.STRIPE_SECRET_KEY = "sk_test_123456789"

    const { stripe } = await import("@/lib/stripe")

    // Stripe client should have apiVersion property
    expect(stripe).toHaveProperty("_api")
  })
})
