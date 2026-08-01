import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { LessonList } from "@/components/lesson-list"
import { VideoPreview } from "@/components/video-preview"

// Mock server actions
vi.mock("@/app/(dashboard)/dashboard/courses/actions", () => ({
  updateLesson: vi.fn(),
  deleteLesson: vi.fn(),
  reorderLesson: vi.fn(),
}))

import { updateLesson, deleteLesson, reorderLesson } from "@/app/(dashboard)/dashboard/courses/actions"

describe("Lesson UI Integration", () => {
  const mockLessons = [
    { id: "lesson-1", title: "Lesson 1", description: "Desc 1", videoUrl: "https://youtube.com/watch?v=abc123", order: 1, moduleId: "module-1" },
    { id: "lesson-2", title: "Lesson 2", description: null, videoUrl: null, order: 2, moduleId: "module-1" },
    { id: "lesson-3", title: "Lesson 3", description: "Desc 3", videoUrl: "https://vimeo.com/123456", order: 3, moduleId: "module-1" },
  ]

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe("LessonList", () => {
    it("should render all lessons", () => {
      render(<LessonList lessons={mockLessons} moduleId="module-1" />)

      expect(screen.getByText("Lesson 1")).toBeInTheDocument()
      expect(screen.getByText("Lesson 2")).toBeInTheDocument()
      expect(screen.getByText("Lesson 3")).toBeInTheDocument()
    })

    it("should show empty state when no lessons", () => {
      render(<LessonList lessons={[]} moduleId="module-1" />)

      expect(screen.getByText("Aucune leçon")).toBeInTheDocument()
    })

    it("should open edit dialog when clicking lesson title", async () => {
      render(<LessonList lessons={mockLessons} moduleId="module-1" />)

      const lessonTitle = screen.getByText("Lesson 1")
      fireEvent.click(lessonTitle)

      // Dialog should open with lesson details
      await waitFor(() => {
        expect(screen.getByText("Modifier la leçon")).toBeInTheDocument()
      })

      // Form fields should be populated
      expect(screen.getByDisplayValue("Lesson 1")).toBeInTheDocument()
      expect(screen.getByDisplayValue("Desc 1")).toBeInTheDocument()
      expect(screen.getByDisplayValue("https://youtube.com/watch?v=abc123")).toBeInTheDocument()
    })

    it("should save lesson changes", async () => {
      render(<LessonList lessons={mockLessons} moduleId="module-1" />)

      // Open dialog
      const lessonTitle = screen.getByText("Lesson 1")
      fireEvent.click(lessonTitle)

      await waitFor(() => {
        expect(screen.getByText("Modifier la leçon")).toBeInTheDocument()
      })

      // Modify title
      const titleInput = screen.getByDisplayValue("Lesson 1")
      fireEvent.change(titleInput, { target: { value: "Updated Lesson 1" } })

      // Save
      const saveButton = screen.getByRole("button", { name: /enregistrer/i })
      fireEvent.click(saveButton)

      await waitFor(() => {
        expect(updateLesson).toHaveBeenCalledWith(expect.any(FormData))
      })
    })

    it("should cancel edit without saving", async () => {
      render(<LessonList lessons={mockLessons} moduleId="module-1" />)

      // Open dialog
      const lessonTitle = screen.getByText("Lesson 1")
      fireEvent.click(lessonTitle)

      await waitFor(() => {
        expect(screen.getByText("Modifier la leçon")).toBeInTheDocument()
      })

      // Modify title
      const titleInput = screen.getByDisplayValue("Lesson 1")
      fireEvent.change(titleInput, { target: { value: "Updated Lesson 1" } })

      // Cancel
      const cancelButton = screen.getByRole("button", { name: /annuler/i })
      fireEvent.click(cancelButton)

      // Dialog should close without calling updateLesson
      await waitFor(() => {
        expect(screen.queryByText("Modifier la leçon")).not.toBeInTheDocument()
      })
      expect(updateLesson).not.toHaveBeenCalled()
    })

    it("should reorder lessons up", async () => {
      render(<LessonList lessons={mockLessons} moduleId="module-1" />)

      // Get all buttons with ChevronUp
      const allButtons = screen.getAllByRole("button")
      const upButtons = allButtons.filter(btn => {
        const svg = btn.querySelector('.lucide-chevron-up')
        return svg !== null
      })

      // Click the second lesson's up button (Lesson 2, index 1)
      fireEvent.click(upButtons[1])

      await waitFor(() => {
        expect(reorderLesson).toHaveBeenCalledWith(expect.any(FormData))
      })

      // Check FormData contains correct values
      const formData = vi.mocked(reorderLesson).mock.calls[0][0]
      expect(formData.get("id")).toBe("lesson-2")
      expect(formData.get("direction")).toBe("up")
    })

    it("should reorder lessons down", async () => {
      render(<LessonList lessons={mockLessons} moduleId="module-1" />)

      // Get all buttons with ChevronDown
      const allButtons = screen.getAllByRole("button")
      const downButtons = allButtons.filter(btn => {
        const svg = btn.querySelector('.lucide-chevron-down')
        return svg !== null
      })

      // Click the second lesson's down button (Lesson 2, index 1)
      fireEvent.click(downButtons[1])

      await waitFor(() => {
        expect(reorderLesson).toHaveBeenCalledWith(expect.any(FormData))
      })

      // Check FormData contains correct values
      const formData = vi.mocked(reorderLesson).mock.calls[0][0]
      expect(formData.get("id")).toBe("lesson-2")
      expect(formData.get("direction")).toBe("down")
    })

    it("should disable up button on first lesson", () => {
      render(<LessonList lessons={mockLessons} moduleId="module-1" />)

      const allButtons = screen.getAllByRole("button")
      const upButtons = allButtons.filter(btn => {
        const svg = btn.querySelector('.lucide-chevron-up')
        return svg !== null
      })

      // First lesson's up button should be disabled
      expect(upButtons[0]).toBeDisabled()
    })

    it("should disable down button on last lesson", () => {
      render(<LessonList lessons={mockLessons} moduleId="module-1" />)

      const allButtons = screen.getAllByRole("button")
      const downButtons = allButtons.filter(btn => {
        const svg = btn.querySelector('.lucide-chevron-down')
        return svg !== null
      })

      // Last lesson's down button should be disabled
      expect(downButtons[downButtons.length - 1]).toBeDisabled()
    })

    it("should delete lesson after confirmation", async () => {
      render(<LessonList lessons={mockLessons} moduleId="module-1" />)

      // Get all trash buttons
      const allButtons = screen.getAllByRole("button")
      const trashButtons = allButtons.filter(btn => {
        const svg = btn.querySelector('.lucide-trash-2')
        return svg !== null
      })

      // Click first lesson's delete button
      fireEvent.click(trashButtons[0])

      // Confirmation dialog should appear
      await waitFor(() => {
        expect(screen.getByText("Supprimer la leçon")).toBeInTheDocument()
      })

      // Confirm delete
      const confirmButton = screen.getByRole("button", { name: /supprimer/i })
      fireEvent.click(confirmButton)

      await waitFor(() => {
        expect(deleteLesson).toHaveBeenCalledWith(expect.any(FormData))
      })

      // Check FormData contains correct lesson id
      const formData = vi.mocked(deleteLesson).mock.calls[0][0]
      expect(formData.get("id")).toBe("lesson-1")

      // Lesson should be removed from list (optimistic update)
      expect(screen.queryByText("Lesson 1")).not.toBeInTheDocument()
    })

    it("should cancel delete without removing lesson", async () => {
      render(<LessonList lessons={mockLessons} moduleId="module-1" />)

      // Get all trash buttons
      const allButtons = screen.getAllByRole("button")
      const trashButtons = allButtons.filter(btn => {
        const svg = btn.querySelector('.lucide-trash-2')
        return svg !== null
      })

      // Click first lesson's delete button
      fireEvent.click(trashButtons[0])

      // Confirmation dialog should appear
      await waitFor(() => {
        expect(screen.getByText("Supprimer la leçon")).toBeInTheDocument()
      })

      // Cancel delete
      const cancelButton = screen.getByRole("button", { name: /annuler/i })
      fireEvent.click(cancelButton)

      // Dialog should close without calling deleteLesson
      await waitFor(() => {
        expect(screen.queryByText("Supprimer la leçon")).not.toBeInTheDocument()
      })
      expect(deleteLesson).not.toHaveBeenCalled()

      // Lesson should still be in list
      expect(screen.getByText("Lesson 1")).toBeInTheDocument()
    })
  })

  describe("VideoPreview", () => {
    it("should show iframe for valid YouTube URL", () => {
      const { container } = render(<VideoPreview url="https://youtube.com/watch?v=abc123" />)

      const iframe = container.querySelector("iframe")
      expect(iframe).toBeInTheDocument()
      expect(iframe?.src).toContain("youtube.com/embed/abc123")
    })

    it("should show iframe for valid Vimeo URL", () => {
      const { container } = render(<VideoPreview url="https://vimeo.com/123456" />)

      const iframe = container.querySelector("iframe")
      expect(iframe).toBeInTheDocument()
      expect(iframe?.src).toContain("player.vimeo.com/video/123456")
    })

    it("should show placeholder for empty URL", () => {
      render(<VideoPreview url={null} />)

      expect(screen.getByText("Aucune vidéo ajoutée")).toBeInTheDocument()
    })

    it("should show error for invalid URL", () => {
      render(<VideoPreview url="not-a-valid-url" />)

      expect(screen.getByText("URL invalide")).toBeInTheDocument()
    })
  })
})
