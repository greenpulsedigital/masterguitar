import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen } from "@testing-library/react"

vi.mock("@/lib/auth", () => ({ auth: vi.fn() }))
vi.mock("@/lib/prisma", () => ({ prisma: { course: { findUnique: vi.fn() } } }))
vi.mock("@/lib/prof-stripe-account", () => ({ getProfStripeStatus: vi.fn() }))
vi.mock("@/components/course-form", () => ({ CourseForm: () => <div>course form</div> }))
vi.mock("@/components/module-section", () => ({ ModuleSection: () => <div>module section</div> }))
vi.mock("../app/(dashboard)/dashboard/courses/actions", () => ({
  updateCourse: vi.fn(),
  deleteCourse: vi.fn(),
  toggleCourseStatus: vi.fn(),
}))
vi.mock("next/navigation", () => ({
  redirect: vi.fn((url: string) => {
    throw new Error(`NEXT_REDIRECT:${url}`)
  }),
  notFound: vi.fn(() => {
    throw new Error("NEXT_NOT_FOUND")
  }),
}))

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { getProfStripeStatus } from "@/lib/prof-stripe-account"
import EditCoursePage from "@/app/(dashboard)/dashboard/courses/[id]/page"
import { PublishBlockedNotice } from "@/components/publish-blocked-notice"
import { PUBLISH_BLOCKED_MESSAGE } from "@/lib/payments-messages"

const params = Promise.resolve({ id: "course-1" })

function mockCourse(status: "DRAFT" | "PUBLISHED") {
  vi.mocked(prisma.course.findUnique).mockResolvedValue({
    id: "course-1",
    profId: "prof-1",
    title: "Guitare",
    status,
    modules: [],
  } as never)
}

describe("course edit page: publication blocked without a Stripe account", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(auth).mockResolvedValue({ user: { id: "prof-1", role: "PROF" } } as never)
    vi.spyOn(console, "error").mockImplementation(() => {})
  })

  it.each([
    [{ status: "NOT_CONFIGURED" } as const],
    [{ status: "INVALID", mode: "TEST", keyLast4: "1234", reconcileUntil: null } as const],
    [{ status: "DISCONNECTING", mode: "TEST", keyLast4: "1234", reconcileUntil: new Date() } as const],
  ])("disables « Publier » and explains why for a draft (%#)", async (status) => {
    mockCourse("DRAFT")
    vi.mocked(getProfStripeStatus).mockResolvedValue(status)

    render(await EditCoursePage({ params }))

    expect(screen.getByRole("alert")).toHaveTextContent(PUBLISH_BLOCKED_MESSAGE)
    expect(screen.getByRole("link", { name: "Configurer les paiements" })).toHaveAttribute(
      "href",
      "/dashboard/settings/payments"
    )
    expect(screen.getByRole("button", { name: "Publier" })).toBeDisabled()
  })

  it("keeps « Publier » enabled and shows no notice with an ACTIVE account", async () => {
    mockCourse("DRAFT")
    vi.mocked(getProfStripeStatus).mockResolvedValue({
      status: "ACTIVE",
      mode: "TEST",
      keyLast4: "1234",
      reconcileUntil: null,
    })

    render(await EditCoursePage({ params }))

    expect(screen.queryByRole("alert")).not.toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Publier" })).toBeEnabled()
  })

  it("never blocks unpublishing, whatever the Stripe account", async () => {
    mockCourse("PUBLISHED")
    vi.mocked(getProfStripeStatus).mockResolvedValue({ status: "NOT_CONFIGURED" })

    render(await EditCoursePage({ params }))

    expect(screen.queryByRole("alert")).not.toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Dépublier" })).toBeEnabled()
  })

  it("claims nothing and leaves the button enabled when the status cannot be read", async () => {
    mockCourse("DRAFT")
    vi.mocked(getProfStripeStatus).mockRejectedValue(new Error("db down"))

    render(await EditCoursePage({ params }))

    expect(screen.queryByRole("alert")).not.toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Publier" })).toBeEnabled()
  })
})

describe("PublishBlockedNotice", () => {
  it("is an alert with the message and a link to the settings", () => {
    render(<PublishBlockedNotice />)

    expect(screen.getByRole("alert")).toHaveTextContent(PUBLISH_BLOCKED_MESSAGE)
    expect(screen.getByRole("link", { name: "Configurer les paiements" })).toBeInTheDocument()
  })
})
