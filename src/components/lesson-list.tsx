"use client"

import { useState } from "react"
import { ChevronUp, ChevronDown, Trash2, Video } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { deleteLesson, reorderLesson } from "@/app/(dashboard)/dashboard/courses/actions"
import { LessonEditDialog } from "@/components/lesson-edit-dialog"

interface Lesson {
  id: string
  title: string
  description: string | null
  videoUrl: string | null
  order: number
  moduleId: string
}

interface LessonListProps {
  lessons: Lesson[]
  moduleId: string
}

export function LessonList({ lessons, moduleId }: LessonListProps) {
  const [items, setItems] = useState(lessons)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [lessonToDelete, setLessonToDelete] = useState<string | null>(null)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [lessonToEdit, setLessonToEdit] = useState<Lesson | null>(null)

  const handleReorder = async (lessonId: string, direction: "up" | "down") => {
    const currentIndex = items.findIndex(l => l.id === lessonId)
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
    formData.set("id", lessonId)
    formData.set("direction", direction)

    await reorderLesson(formData)
  }

  const handleDeleteClick = (lessonId: string) => {
    setLessonToDelete(lessonId)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!lessonToDelete) return

    // Optimistic delete
    setItems(prev => prev.filter(l => l.id !== lessonToDelete))
    setDeleteDialogOpen(false)

    const formData = new FormData()
    formData.set("id", lessonToDelete)

    await deleteLesson(formData)
    setLessonToDelete(null)
  }

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false)
    setLessonToDelete(null)
  }

  const handleEditClick = (lesson: Lesson) => {
    setLessonToEdit(lesson)
    setEditDialogOpen(true)
  }

  const handleEditSave = () => {
    setEditDialogOpen(false)
    setLessonToEdit(null)
  }

  // Empty state
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
        <Video className="w-12 h-12 mb-2" />
        <p>Aucune leçon</p>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-2">
        {items.map((lesson, index) => (
          <div
            key={lesson.id}
            className="flex items-center gap-2 p-3 border rounded-lg bg-card"
          >
            <div className="flex flex-col gap-1">
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={() => handleReorder(lesson.id, "up")}
                disabled={index === 0}
                aria-label="Déplacer la leçon vers le haut"
              >
                <ChevronUp className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={() => handleReorder(lesson.id, "down")}
                disabled={index === items.length - 1}
                aria-label="Déplacer la leçon vers le bas"
              >
                <ChevronDown className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex-1">
              <button
                type="button"
                onClick={() => handleEditClick(lesson)}
                className="text-left w-full hover:text-primary transition-colors"
              >
                {lesson.title}
              </button>
            </div>

            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => handleDeleteClick(lesson.id)}
              aria-label="Supprimer la leçon"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>

      {/* Delete confirmation dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Supprimer la leçon</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer cette leçon ? Cette action est irréversible.
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

      {/* Edit dialog */}
      {lessonToEdit && (
        <LessonEditDialog
          lesson={lessonToEdit}
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          onSave={handleEditSave}
        />
      )}
    </>
  )
}
