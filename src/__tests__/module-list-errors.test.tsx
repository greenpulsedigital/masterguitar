import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { ModuleList } from "@/components/module-list"

vi.mock("@/app/(dashboard)/dashboard/courses/actions", () => ({
  updateModule: vi.fn(),
  deleteModule: vi.fn(),
  reorderModule: vi.fn(),
  createModule: vi.fn(),
}))

import { updateModule, deleteModule, reorderModule } from "@/app/(dashboard)/dashboard/courses/actions"

const modules = [
  { id: "mod-1", title: "Module 1", order: 1, courseId: "course-1", lessons: [] },
  { id: "mod-2", title: "Module 2", order: 2, courseId: "course-1", lessons: [] },
]

function titles() {
  return screen.getAllByRole("button", { name: /^Module \d$/ }).map((b) => b.textContent)
}

describe("ModuleList error handling", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("rolls back a failed reorder and shows the error", async () => {
    vi.mocked(reorderModule).mockResolvedValue({ error: "Erreur lors du réordonnancement du module" })
    render(<ModuleList modules={modules} courseId="course-1" />)

    fireEvent.click(screen.getAllByRole("button", { name: "Descendre le module" })[0])

    expect(await screen.findByRole("alert")).toHaveTextContent("réordonnancement")
    await waitFor(() => expect(titles()).toEqual(["Module 1", "Module 2"]))
  })

  it("restores a module whose deletion failed", async () => {
    vi.mocked(deleteModule).mockResolvedValue({ error: "Erreur lors de la suppression du module" })
    render(<ModuleList modules={modules} courseId="course-1" />)

    fireEvent.click(screen.getAllByRole("button", { name: "Supprimer le module" })[0])
    fireEvent.click(await screen.findByRole("button", { name: "Supprimer" }))

    expect(await screen.findByRole("alert")).toHaveTextContent("suppression")
    expect(screen.getByText("Module 1")).toBeInTheDocument()
  })

  it("restores the previous title when the rename fails", async () => {
    vi.mocked(updateModule).mockResolvedValue({ error: "Erreur lors de la mise à jour du module" })
    render(<ModuleList modules={modules} courseId="course-1" />)

    fireEvent.click(screen.getByText("Module 1"))
    const input = screen.getByLabelText("Titre du module")
    fireEvent.change(input, { target: { value: "  Renommé  " } })
    fireEvent.blur(input)

    expect(await screen.findByRole("alert")).toHaveTextContent("mise à jour")
    expect(screen.getByText("Module 1")).toBeInTheDocument()
    const sent = vi.mocked(updateModule).mock.calls[0][0] as FormData
    expect(sent.get("title")).toBe("Renommé")
  })
})
