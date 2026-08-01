"use client"

import { useState } from "react"
import { ChevronUp, ChevronDown, ChevronRight, Trash2, Plus } from "lucide-react"
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
import { updateModule, deleteModule, reorderModule, createLesson } from "@/app/(dashboard)/dashboard/courses/actions"
import { LessonList } from "@/components/lesson-list"

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
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set())

  const handleStartEdit = (module: Module) => {
    setEditingId(module.id)
    setEditingTitle(module.title)
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setEditingTitle("")
  }

  const handleSaveEdit = async (moduleId: string) => {
    if (editingTitle.trim() === "") {
      return
    }

    // Optimistic update
    setItems(prev => prev.map(m => m.id === moduleId ? { ...m, title: editingTitle } : m))
    setEditingId(null)

    const formData = new FormData()
    formData.set("id", moduleId)
    formData.set("title", editingTitle)

    await updateModule(formData)
  }

  const handleReorder = async (moduleId: string, direction: "up" | "down") => {
    const currentIndex = items.findIndex(m => m.id === moduleId)
    const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1

    if (targetIndex < 0 || targetIndex >= items.length) {
      return
    }

    // Optimistic reorder
    const newItems = [...items]
    const temp = newItems[currentIndex]
    newItems[currentIndex] = newItems[targetIndex]
    newItems[targetIndex] = temp
    setItems(newItems)

    const formData = new FormData()
    formData.set("id", moduleId)
    formData.set("direction", direction)

    await reorderModule(formData)
  }

  const handleDeleteClick = (moduleId: string) => {
    setModuleToDelete(moduleId)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!moduleToDelete) return

    // Optimistic delete
    setItems(prev => prev.filter(m => m.id !== moduleToDelete))
    setDeleteDialogOpen(false)

    const formData = new FormData()
    formData.set("id", moduleToDelete)

    await deleteModule(formData)
    setModuleToDelete(null)
  }

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false)
    setModuleToDelete(null)
  }

  const toggleExpanded = (moduleId: string) => {
    setExpandedModules(prev => {
      const next = new Set(prev)
      if (next.has(moduleId)) {
        next.delete(moduleId)
      } else {
        next.add(moduleId)
      }
      return next
    })
  }

  const handleAddLesson = async (moduleId: string) => {
    const formData = new FormData()
    formData.set("moduleId", moduleId)

    await createLesson(formData)
  }

  return (
    <>
      <div className="space-y-2">
        {items.map((module, index) => {
          const isExpanded = expandedModules.has(module.id)
          const ExpandIcon = isExpanded ? ChevronDown : ChevronRight

          return (
            <div key={module.id} className="border rounded-lg bg-card">
              <div className="flex items-center gap-2 p-3">
                <div className="flex flex-col gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => handleReorder(module.id, "up")}
                    disabled={index === 0}
                    aria-label="Déplacer le module vers le haut"
                  >
                    <ChevronUp className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => handleReorder(module.id, "down")}
                    disabled={index === items.length - 1}
                    aria-label="Déplacer le module vers le bas"
                  >
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </div>

                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => toggleExpanded(module.id)}
                >
                  <ExpandIcon className="h-4 w-4" />
                </Button>

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

              {isExpanded && (
                <div className="px-3 pb-3 border-t">
                  <div className="flex items-center justify-between py-3">
                    <h4 className="text-sm font-medium">Leçons</h4>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleAddLesson(module.id)}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Ajouter
                    </Button>
                  </div>
                  <LessonList lessons={module.lessons} moduleId={module.id} />
                </div>
              )}
            </div>
          )
        })}
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
