import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen } from "@testing-library/react"

vi.mock("@/lib/queries/course", () => ({
  getCourseBySlug: vi.fn(),
}))

vi.mock("next/navigation", () => ({
  notFound: vi.fn(() => {
    throw new Error("NEXT_NOT_FOUND")
  }),
}))

import { getCourseBySlug } from "@/lib/queries/course"
import CourseSalesPage, { generateMetadata } from "@/app/cours/[slug]/page"

const baseCourse = {
  id: "course-1",
  slug: "guitare-debutant",
  title: "Guitare Débutant",
  description: "Apprenez les bases de la guitare",
  price: 4900,
  thumbnailUrl: "https://example.com/thumb.jpg",
  prof: { name: "Jean Dupont" },
  modules: [
    { id: "m1", title: "Les accords", order: 1 },
    { id: "m2", title: "Le rythme", order: 2 },
  ],
}

const params = Promise.resolve({ slug: "guitare-debutant" })

async function renderPage(course: unknown) {
  vi.mocked(getCourseBySlug).mockResolvedValue(course as any)
  render(await CourseSalesPage({ params }))
}

describe("CourseSalesPage rendering", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("renders title, author, formatted price and curriculum", async () => {
    await renderPage(baseCourse)

    expect(screen.getByRole("heading", { level: 1, name: "Guitare Débutant" })).toBeInTheDocument()
    expect(screen.getByText("par Jean Dupont")).toBeInTheDocument()
    expect(screen.getByRole("heading", { level: 2, name: "Programme du cours" })).toBeInTheDocument()
    expect(screen.getByText("Les accords")).toBeInTheDocument()
    expect(screen.getByText("Le rythme")).toBeInTheDocument()
    expect(screen.getAllByText(/49,00/).length).toBeGreaterThan(0)
  })

  it("links every buy button to the checkout of the course", async () => {
    await renderPage(baseCourse)

    const links = screen.getAllByRole("link", { name: "Acheter" })
    expect(links.length).toBeGreaterThan(0)
    for (const link of links) {
      expect(link).toHaveAttribute("href", "/checkout/course-1")
    }
  })

  it("renders the thumbnail with an alt text", async () => {
    await renderPage(baseCourse)

    expect(screen.getByRole("img", { name: "Guitare Débutant" })).toBeInTheDocument()
  })

  it("falls back to a generic author name", async () => {
    await renderPage({ ...baseCourse, prof: { name: null } })

    expect(screen.getByText("par Instructeur")).toBeInTheDocument()
  })

  it("handles a course without description, thumbnail or modules", async () => {
    await renderPage({ ...baseCourse, description: null, thumbnailUrl: null, modules: [] })

    expect(screen.getByText("Le programme sera bientôt disponible")).toBeInTheDocument()
    expect(screen.queryByRole("img")).not.toBeInTheDocument()
  })

  it("calls notFound() for an unknown or unpublished course", async () => {
    vi.mocked(getCourseBySlug).mockResolvedValue(null)

    await expect(CourseSalesPage({ params })).rejects.toThrow("NEXT_NOT_FOUND")
  })
})

describe("generateMetadata", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("exposes title, description and Open Graph data", async () => {
    vi.mocked(getCourseBySlug).mockResolvedValue(baseCourse as any)

    const metadata = await generateMetadata({ params })

    expect(metadata.title).toBe("Guitare Débutant")
    expect(metadata.description).toBe("Apprenez les bases de la guitare")
    expect(metadata.openGraph).toMatchObject({
      title: "Guitare Débutant",
      images: [{ url: "https://example.com/thumb.jpg" }],
    })
    expect(metadata.twitter).toMatchObject({ card: "summary_large_image" })
  })

  it("truncates a long description to 160 characters", async () => {
    vi.mocked(getCourseBySlug).mockResolvedValue({
      ...baseCourse,
      description: "mot ".repeat(100),
    } as any)

    const metadata = await generateMetadata({ params })

    expect(metadata.description!.length).toBeLessThanOrEqual(160)
    expect(metadata.description!.endsWith("…")).toBe(true)
  })

  it("uses a default description and no image when the course has neither", async () => {
    vi.mocked(getCourseBySlug).mockResolvedValue({
      ...baseCourse,
      description: null,
      thumbnailUrl: null,
    } as any)

    const metadata = await generateMetadata({ params })

    expect(metadata.description).toContain("Guitare Débutant")
    expect((metadata.openGraph as any).images).toBeUndefined()
    expect(metadata.twitter).toMatchObject({ card: "summary" })
  })

  it("does not throw for an unknown course", async () => {
    vi.mocked(getCourseBySlug).mockResolvedValue(null)

    const metadata = await generateMetadata({ params })

    expect(metadata.title).toBe("Cours introuvable")
  })
})
