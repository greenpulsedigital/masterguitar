import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { LessonList } from "@/components/lesson-list"
import { LessonSection } from "@/components/lesson-section"

// Mock server actions
vi.mock("@/app/(dashboard)/dashboard/courses/actions", () => ({
  createLesson: vi.fn(),
  updateLesson: vi.fn(),
  deleteLesson: vi.fn(),
  reorderLesson: vi.fn(),
}))

import {
  createLesson,
  updateLesson,
  deleteLesson,
  reorderLesson,
} from "@/app/(dashboard)/dashboard/courses/actions"

describe("Lesson UI Integration", () => {
  const mockLessons = [
    {
      id: "les-1",
      title: "Comment tenir sa guitare",
      description: "Introduction",
      videoUrl: "https://www.youtube.com/embed/abc",
      order: 1,
      moduleId: "mod-1",
    },
    {
      id: "les-2",
      title: "Les premières notes",
      description: null,
      videoUrl: null,
      order: 2,
      moduleId: "mod-1",
    },
  ]

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe("LessonSection", () => {
    it("should show the empty state when the module has no lessons", () => {
      render(<LessonSection lessons={[]} moduleId="mod-1" />)

      expect(screen.getByText("Aucune leçon")).toBeInTheDocument()
    })

    it("should render lesson rows when lessons exist", () => {
      render(<LessonSection lessons={mockLessons} moduleId="mod-1" />)

      expect(screen.getByText("Comment tenir sa guitare")).toBeInTheDocument()
      expect(screen.getByText("Les premières notes")).toBeInTheDocument()
    })

    it("should open the add dialog with empty fields", async () => {
      render(<LessonSection lessons={mockLessons} moduleId="mod-1" />)

      fireEvent.click(screen.getByText("Ajouter une leçon"))

      await waitFor(() => {
        expect(screen.getByText("Ajouter une leçon", { selector: "h2, [data-slot='dialog-title']" })).toBeInTheDocument()
      })

      const titleInput = screen.getByLabelText("Titre") as HTMLInputElement
      expect(titleInput.value).toBe("")
    })
  })

  describe("LessonList", () => {
    it("should render all lessons", () => {
      render(<LessonList lessons={mockLessons} moduleId="mod-1" />)

      expect(screen.getByText("Comment tenir sa guitare")).toBeInTheDocument()
      expect(screen.getByText("Les premières notes")).toBeInTheDocument()
    })

    it("should disable up button for first lesson and down button for last lesson", () => {
      render(<LessonList lessons={mockLessons} moduleId="mod-1" />)

      const allButtons = screen.getAllByRole("button")
      const upButtons = allButtons.filter(btn => btn.querySelector(".lucide-chevron-up"))
      const downButtons = allButtons.filter(btn => btn.querySelector(".lucide-chevron-down"))

      expect(upButtons[0]).toBeDisabled()
      expect(downButtons[downButtons.length - 1]).toBeDisabled()
    })

    it("should reorder a lesson", async () => {
      render(<LessonList lessons={mockLessons} moduleId="mod-1" />)

      const allButtons = screen.getAllByRole("button")
      const downButtons = allButtons.filter(btn => btn.querySelector(".lucide-chevron-down"))

      fireEvent.click(downButtons[0])

      await waitFor(() => {
        expect(reorderLesson).toHaveBeenCalledWith(expect.any(FormData))
      })
    })

    it("should open the edit dialog pre-filled with the lesson's data", async () => {
      render(<LessonList lessons={mockLessons} moduleId="mod-1" />)

      const editButtons = screen.getAllByRole("button")
        .filter(btn => btn.querySelector(".lucide-pencil"))

      fireEvent.click(editButtons[0])

      await waitFor(() => {
        expect(screen.getByText("Modifier la leçon")).toBeInTheDocument()
      })

      const titleInput = screen.getByLabelText("Titre") as HTMLInputElement
      expect(titleInput.value).toBe("Comment tenir sa guitare")
    })

    it("should open the delete confirmation dialog before calling deleteLesson", async () => {
      render(<LessonList lessons={mockLessons} moduleId="mod-1" />)

      const deleteButtons = screen.getAllByRole("button")
        .filter(btn => btn.querySelector(".lucide-trash-2"))

      fireEvent.click(deleteButtons[0])

      await waitFor(() => {
        expect(screen.getByText("Supprimer la leçon")).toBeInTheDocument()
      })

      expect(deleteLesson).not.toHaveBeenCalled()

      const confirmButton = await screen.findByRole("button", { name: /Supprimer/i })
      fireEvent.click(confirmButton)

      await waitFor(() => {
        expect(deleteLesson).toHaveBeenCalledWith(expect.any(FormData))
      })
    })
  })
})
