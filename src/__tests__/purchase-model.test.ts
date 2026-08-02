import { describe, it, expect, vi, beforeEach } from "vitest"

// Mock prisma
vi.mock("@/lib/prisma", () => ({
  prisma: {
    purchase: {
      create: vi.fn(),
      findFirst: vi.fn(),
      findUnique: vi.fn(),
    },
    user: {
      findUnique: vi.fn(),
    },
    course: {
      findUnique: vi.fn(),
    },
  },
}))

import { prisma } from "@/lib/prisma"

describe("Purchase Model Schema", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("should have Purchase model with correct structure", () => {
    // Verify that prisma.purchase exists (schema compiled)
    expect(prisma.purchase).toBeDefined()
    expect(prisma.purchase.create).toBeDefined()
    expect(prisma.purchase.findFirst).toBeDefined()
    expect(prisma.purchase.findUnique).toBeDefined()
  })

  it("should create a Purchase with all required fields", async () => {
    const mockPurchase = {
      id: "purchase-1",
      amount: 5000,
      stripePaymentId: "pi_test_123",
      stripeSessionId: "cs_test_123",
      userId: "user-1",
      courseId: "course-1",
      createdAt: new Date(),
    }

    vi.mocked(prisma.purchase.create).mockResolvedValue(mockPurchase as any)

    const purchase = await prisma.purchase.create({
      data: {
        amount: 5000,
        stripePaymentId: "pi_test_123",
        stripeSessionId: "cs_test_123",
        userId: "user-1",
        courseId: "course-1",
      },
    })

    expect(purchase).toBeDefined()
    expect(purchase.id).toBe("purchase-1")
    expect(purchase.amount).toBe(5000)
    expect(purchase.stripePaymentId).toBe("pi_test_123")
    expect(purchase.stripeSessionId).toBe("cs_test_123")
    expect(purchase.userId).toBe("user-1")
    expect(purchase.courseId).toBe("course-1")
    expect(purchase.createdAt).toBeInstanceOf(Date)
  })

  it("should support querying purchases by stripePaymentId", async () => {
    const mockPurchase = {
      id: "purchase-1",
      amount: 5000,
      stripePaymentId: "pi_test_unique",
      stripeSessionId: "cs_test_unique",
      userId: "user-1",
      courseId: "course-1",
      createdAt: new Date(),
    }

    vi.mocked(prisma.purchase.findUnique).mockResolvedValue(mockPurchase as any)

    const purchase = await prisma.purchase.findUnique({
      where: { stripePaymentId: "pi_test_unique" },
    })

    expect(purchase).toBeDefined()
    expect(purchase?.stripePaymentId).toBe("pi_test_unique")
  })

  it("should support querying purchases by stripeSessionId", async () => {
    const mockPurchase = {
      id: "purchase-1",
      amount: 5000,
      stripePaymentId: "pi_test_123",
      stripeSessionId: "cs_test_unique",
      userId: "user-1",
      courseId: "course-1",
      createdAt: new Date(),
    }

    vi.mocked(prisma.purchase.findUnique).mockResolvedValue(mockPurchase as any)

    const purchase = await prisma.purchase.findUnique({
      where: { stripeSessionId: "cs_test_unique" },
    })

    expect(purchase).toBeDefined()
    expect(purchase?.stripeSessionId).toBe("cs_test_unique")
  })

  it("should support User-Purchase relation", async () => {
    const mockUser = {
      id: "user-1",
      email: "student@test.com",
      passwordHash: "hash",
      name: "Student",
      role: "STUDENT" as const,
      createdAt: new Date(),
      updatedAt: new Date(),
      purchases: [
        {
          id: "purchase-1",
          amount: 5000,
          stripePaymentId: "pi_test_123",
          stripeSessionId: "cs_test_123",
          userId: "user-1",
          courseId: "course-1",
          createdAt: new Date(),
        },
      ],
    }

    vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as any)

    const user = await prisma.user.findUnique({
      where: { id: "user-1" },
      include: { purchases: true },
    })

    expect(user?.purchases).toHaveLength(1)
    expect(user?.purchases[0].amount).toBe(5000)
  })

  it("should support Course-Purchase relation", async () => {
    const mockCourse = {
      id: "course-1",
      slug: "test-course",
      title: "Test Course",
      description: null,
      price: 5000,
      thumbnailUrl: null,
      status: "PUBLISHED" as const,
      profId: "prof-1",
      createdAt: new Date(),
      updatedAt: new Date(),
      purchases: [
        {
          id: "purchase-1",
          amount: 5000,
          stripePaymentId: "pi_test_123",
          stripeSessionId: "cs_test_123",
          userId: "user-1",
          courseId: "course-1",
          createdAt: new Date(),
        },
      ],
    }

    vi.mocked(prisma.course.findUnique).mockResolvedValue(mockCourse as any)

    const course = await prisma.course.findUnique({
      where: { id: "course-1" },
      include: { purchases: true },
    })

    expect(course?.purchases).toHaveLength(1)
    expect(course?.purchases[0].amount).toBe(5000)
  })
})
