"use client"

import { useState } from "react"
import { ChevronUp, ChevronDown, Pencil, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { LessonFormDialog } from "@/components/lesson-form-dialog"
import { deleteLesson, reorderLesson } from "@/app/(dashboard)/dashboard/courses/actions"

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
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [lessonToEdit, setLessonToEdit] = useState<Lesson | undefined>(undefined)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [lessonToDelete, setLessonToDelete] = useState<string | null>(null)

  const handleReorder = async (lessonId: string, direction: "up" | "down") => {
    const currentIndex = items.findIndex(l => l.id === lessonId)
    const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1

    if (targetIndex < 0 || targetIndex >= items.length) {
      return
    }

    const previousItems = items

    // Optimistic reorder
    const newItems = [...items]
    const temp = newItems[currentIndex]
    newItems[currentIndex] = newItems[targetIndex]
    newItems[targetIndex] = temp
    setItems(newItems)

    const formData = new FormData()
    formData.set("id", lessonId)
    formData.set("direction", direction)

    // On success the action redirects; a returned value means it failed
    const result = await reorderLesson(formData)
    if (result?.error) {
      setItems(previousItems)
    }
  }

  const handleEditClick = (lesson: Lesson) => {
    setLessonToEdit(lesson)
    setEditDialogOpen(true)
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

  return (
    <>
      <div className="space-y-2">
        {items.map((lesson, index) => (
          <div
            key={lesson.id}
            className="flex items-center gap-2 p-2 border rounded-lg bg-card"
          >
            <div className="flex flex-col gap-1">
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={() => handleReorder(lesson.id, "up")}
                disabled={index === 0}
              >
                <ChevronUp className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={() => handleReorder(lesson.id, "down")}
                disabled={index === items.length - 1}
              >
                <ChevronDown className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex-1">{lesson.title}</div>

            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={() => handleEditClick(lesson)}
            >
              <Pencil className="h-4 w-4" />
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={() => handleDeleteClick(lesson.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>

      <LessonFormDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        lesson={lessonToEdit}
        moduleId={moduleId}
      />

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
    </>
  )
}
