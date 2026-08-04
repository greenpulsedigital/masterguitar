import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { ModuleList } from "@/components/module-list"
import { ModuleSection } from "@/components/module-section"

// Mock server actions
vi.mock("@/app/(dashboard)/dashboard/courses/actions", () => ({
  updateModule: vi.fn(),
  deleteModule: vi.fn(),
  reorderModule: vi.fn(),
  createModule: vi.fn(),
}))

import { updateModule, deleteModule, reorderModule } from "@/app/(dashboard)/dashboard/courses/actions"

describe("Module UI Integration", () => {
  const mockModules = [
    { id: "mod-1", title: "Module 1", order: 1, courseId: "course-1", lessons: [] },
    { id: "mod-2", title: "Module 2", order: 2, courseId: "course-1", lessons: [] },
    { id: "mod-3", title: "Module 3", order: 3, courseId: "course-1", lessons: [] },
  ]

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe("ModuleList", () => {
    it("should render all modules", () => {
      render(<ModuleList modules={mockModules} courseId="course-1" />)

      expect(screen.getByText("Module 1")).toBeInTheDocument()
      expect(screen.getByText("Module 2")).toBeInTheDocument()
      expect(screen.getByText("Module 3")).toBeInTheDocument()
    })

    it("should allow renaming a module", async () => {
      render(<ModuleList modules={mockModules} courseId="course-1" />)

      // Click on module title to edit
      const moduleTitle = screen.getByText("Module 1")
      fireEvent.click(moduleTitle)

      // Find the input and change value
      const input = screen.getByDisplayValue("Module 1")
      fireEvent.change(input, { target: { value: "Updated Module 1" } })

      // Blur to save
      fireEvent.blur(input)

      await waitFor(() => {
        expect(updateModule).toHaveBeenCalledWith(expect.any(FormData))
      })

      // Check optimistic update
      expect(screen.getByText("Updated Module 1")).toBeInTheDocument()
    })

    it("should save on Enter key", async () => {
      render(<ModuleList modules={mockModules} courseId="course-1" />)

      const moduleTitle = screen.getByText("Module 1")
      fireEvent.click(moduleTitle)

      const input = screen.getByDisplayValue("Module 1")
      fireEvent.change(input, { target: { value: "New Title" } })
      fireEvent.keyDown(input, { key: "Enter" })

      await waitFor(() => {
        expect(updateModule).toHaveBeenCalled()
      })
    })

    it("should cancel edit on Escape key", async () => {
      render(<ModuleList modules={mockModules} courseId="course-1" />)

      const moduleTitle = screen.getByText("Module 1")
      fireEvent.click(moduleTitle)

      const input = screen.getByDisplayValue("Module 1")
      fireEvent.change(input, { target: { value: "New Title" } })
      fireEvent.keyDown(input, { key: "Escape" })

      // Should not call updateModule
      expect(updateModule).not.toHaveBeenCalled()
      // Original title should still be visible
      expect(screen.getByText("Module 1")).toBeInTheDocument()
    })

    it("should reorder modules up", async () => {
      render(<ModuleList modules={mockModules} courseId="course-1" />)

      // Get all buttons with ChevronUp - should be 3 (one per module)
      const allButtons = screen.getAllByRole("button")
      const upButtons = allButtons.filter(btn => {
        const svg = btn.querySelector('.lucide-chevron-up')
        return svg !== null
      })

      // Click the second module's up button (Module 2, index 1)
      fireEvent.click(upButtons[1])

      await waitFor(() => {
        expect(reorderModule).toHaveBeenCalledWith(expect.any(FormData))
      })
    })

    it("should reorder modules down", async () => {
      render(<ModuleList modules={mockModules} courseId="course-1" />)

      // Get all buttons with ChevronDown
      const allButtons = screen.getAllByRole("button")
      const downButtons = allButtons.filter(btn => {
        const svg = btn.querySelector('.lucide-chevron-down')
        return svg !== null
      })

      // Click the first module's down button (Module 1, index 0)
      fireEvent.click(downButtons[0])

      await waitFor(() => {
        expect(reorderModule).toHaveBeenCalledWith(expect.any(FormData))
      })
    })

    it("should disable up button for first module", () => {
      render(<ModuleList modules={mockModules} courseId="course-1" />)

      const allButtons = screen.getAllByRole("button")
      const upButtons = allButtons.filter(btn => {
        const svg = btn.querySelector('.lucide-chevron-up')
        return svg !== null
      })

      // First module's up button should be disabled
      expect(upButtons[0]).toBeDisabled()
    })

    it("should disable down button for last module", () => {
      render(<ModuleList modules={mockModules} courseId="course-1" />)

      const allButtons = screen.getAllByRole("button")
      const downButtons = allButtons.filter(btn => {
        const svg = btn.querySelector('.lucide-chevron-down')
        return svg !== null
      })

      // Last module's down button (index 2 for 3 modules) should be disabled
      expect(downButtons[2]).toBeDisabled()
    })

    it("should open delete confirmation dialog", async () => {
      render(<ModuleList modules={mockModules} courseId="course-1" />)

      // Find and click a delete button (Trash2 icon)
      const deleteButtons = screen.getAllByRole("button")
        .filter(btn => btn.querySelector('[class*="lucide-trash"]'))

      fireEvent.click(deleteButtons[0])

      // Dialog should appear
      await waitFor(() => {
        expect(screen.getByText("Supprimer le module")).toBeInTheDocument()
        expect(screen.getByText(/irréversible/)).toBeInTheDocument()
      })
    })

    it("should delete module on confirmation", async () => {
      render(<ModuleList modules={mockModules} courseId="course-1" />)

      // Click delete button
      const deleteButtons = screen.getAllByRole("button")
        .filter(btn => btn.querySelector('[class*="lucide-trash"]'))
      fireEvent.click(deleteButtons[0])

      // Confirm deletion
      const confirmButton = await screen.findByRole("button", { name: /Supprimer/i })
      fireEvent.click(confirmButton)

      await waitFor(() => {
        expect(deleteModule).toHaveBeenCalledWith(expect.any(FormData))
      })
    })

    it("should cancel deletion", async () => {
      render(<ModuleList modules={mockModules} courseId="course-1" />)

      // Click delete button
      const deleteButtons = screen.getAllByRole("button")
        .filter(btn => btn.querySelector('[class*="lucide-trash"]'))
      fireEvent.click(deleteButtons[0])

      // Cancel deletion
      const cancelButton = await screen.findByRole("button", { name: /Annuler/i })
      fireEvent.click(cancelButton)

      // Should not call deleteModule
      expect(deleteModule).not.toHaveBeenCalled()
    })
  })

  describe("ModuleSection", () => {
    it("should show empty state when no modules", () => {
      render(<ModuleSection modules={[]} courseId="course-1" />)

      expect(screen.getByText("Aucun module")).toBeInTheDocument()
    })

    it("should show modules when they exist", () => {
      render(<ModuleSection modules={mockModules} courseId="course-1" />)

      expect(screen.getByText("Module 1")).toBeInTheDocument()
      expect(screen.getByText("Module 2")).toBeInTheDocument()
      expect(screen.getByText("Module 3")).toBeInTheDocument()
    })

    it("should have add module button", () => {
      render(<ModuleSection modules={mockModules} courseId="course-1" />)

      expect(screen.getByText("Ajouter un module")).toBeInTheDocument()
    })

    it("should call createModule action when add button is clicked", async () => {
      const { createModule } = await import("@/app/(dashboard)/dashboard/courses/actions")

      render(<ModuleSection modules={mockModules} courseId="course-1" />)

      const addButton = screen.getByText("Ajouter un module")
      fireEvent.click(addButton)

      await waitFor(() => {
        expect(createModule).toHaveBeenCalled()
      })
    })

    it("should use icon-sm size for reorder buttons per design spec", () => {
      render(<ModuleSection modules={mockModules} courseId="course-1" />)

      const allButtons = screen.getAllByRole("button")
      const upButtons = allButtons.filter(btn => {
        const svg = btn.querySelector('.lucide-chevron-up')
        return svg !== null
      })

      // Reorder buttons should not have custom h-6 w-6 classes
      // They should use the icon-sm size variant (28px, not 24px)
      upButtons.forEach(btn => {
        const classes = btn.className
        // Should not have h-6 w-6 override
        expect(classes).not.toContain('h-6')
        expect(classes).not.toContain('w-6')
      })
    })
  })
})
