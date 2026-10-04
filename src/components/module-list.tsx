"use client"

import { useState } from "react"
import { ChevronUp, ChevronDown, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { updateModule, deleteModule, reorderModule } from "@/app/(dashboard)/dashboard/courses/actions"
import { LessonSection } from "@/components/lesson-section"

interface Lesson {
  id: string
  title: string
  description: string | null
  videoUrl: string | null
  order: number
  moduleId: string
}

interface Module {
  id: string
  title: string
  order: number
  courseId: string
  lessons: Lesson[]
}

interface ModuleListProps {
  modules: Module[]
  courseId: string
}

export function ModuleList({ modules, courseId }: ModuleListProps) {
  const [items, setItems] = useState(modules)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingTitle, setEditingTitle] = useState("")
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [moduleToDelete, setModuleToDelete] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleStartEdit = (module: Module) => {
    setEditingId(module.id)
    setEditingTitle(module.title)
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setEditingTitle("")
  }

  const handleSaveEdit = async (moduleId: string) => {
    const title = editingTitle.trim()
    if (title === "") {
      return
    }

    const previousItems = items

    // Optimistic update
    setError(null)
    setItems(prev => prev.map(m => m.id === moduleId ? { ...m, title } : m))
    setEditingId(null)

    const formData = new FormData()
    formData.set("id", moduleId)
    formData.set("title", title)

    // On success the action redirects; a returned value means it failed
    const result = await updateModule(formData)
    if (result?.error) {
      setItems(previousItems)
      setError(result.error)
    }
  }

  const handleReorder = async (moduleId: string, direction: "up" | "down") => {
    const currentIndex = items.findIndex(m => m.id === moduleId)
    const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1

    if (targetIndex < 0 || targetIndex >= items.length) {
      return
    }

    const previousItems = items

    // Optimistic reorder
    setError(null)
    const newItems = [...items]
    const temp = newItems[currentIndex]
    newItems[currentIndex] = newItems[targetIndex]
    newItems[targetIndex] = temp
    setItems(newItems)

    const formData = new FormData()
    formData.set("id", moduleId)
    formData.set("direction", direction)

    const result = await reorderModule(formData)
    if (result?.error) {
      setItems(previousItems)
      setError(result.error)
    }
  }

  const handleDeleteClick = (moduleId: string) => {
    setModuleToDelete(moduleId)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!moduleToDelete) return

    const previousItems = items

    // Optimistic delete
    setError(null)
    setItems(prev => prev.filter(m => m.id !== moduleToDelete))
    setDeleteDialogOpen(false)

    const formData = new FormData()
    formData.set("id", moduleToDelete)

    const result = await deleteModule(formData)
    if (result?.error) {
      setItems(previousItems)
      setError(result.error)
    }
    setModuleToDelete(null)
  }

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false)
    setModuleToDelete(null)
  }

  return (
    <>
      {error && (
        <div role="alert" className="mb-2 text-sm text-destructive">
          {error}
        </div>
      )}
      <div className="space-y-2">
        {items.map((module, index) => (
          <div
            key={module.id}
            className="border rounded-lg bg-card overflow-hidden"
          >
            <div className="flex items-center gap-2 p-3">
              <div className="flex flex-col gap-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => handleReorder(module.id, "up")}
                  aria-label="Monter le module"
                  disabled={index === 0}
                >
                  <ChevronUp className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => handleReorder(module.id, "down")}
                  aria-label="Descendre le module"
                  disabled={index === items.length - 1}
                >
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex-1">
                {editingId === module.id ? (
                  <Input
                    value={editingTitle}
                    onChange={(e) => setEditingTitle(e.target.value)}
                    onBlur={() => handleSaveEdit(module.id)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleSaveEdit(module.id)
                      } else if (e.key === "Escape") {
                        handleCancelEdit()
                      }
                    }}
                    autoFocus
                    aria-label="Titre du module"
                    className="h-8"
                  />
                ) : (
                  <button
                    type="button"
                    onClick={() => handleStartEdit(module)}
                    className="text-left w-full hover:text-primary transition-colors"
                  >
                    {module.title}
                  </button>
                )}
              </div>

              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => handleDeleteClick(module.id)}
                aria-label="Supprimer le module"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>

            <div className="px-3 pb-3">
              <LessonSection lessons={module.lessons} moduleId={module.id} />
            </div>
          </div>
        ))}
      </div>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Supprimer le module</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer ce module ? Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={handleDeleteCancel}>
              Annuler
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm}>
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
