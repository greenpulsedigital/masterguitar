"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { VideoPreview } from "@/components/video-preview"
import { updateLesson } from "@/app/(dashboard)/dashboard/courses/actions"

interface Lesson {
  id: string
  title: string
  description: string | null
  videoUrl: string | null
  order: number
  moduleId: string
}

interface LessonEditDialogProps {
  lesson: Lesson
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: () => void
}

export function LessonEditDialog({ lesson, open, onOpenChange, onSave }: LessonEditDialogProps) {
  const [title, setTitle] = useState(lesson.title)
  const [description, setDescription] = useState(lesson.description || "")
  const [videoUrl, setVideoUrl] = useState(lesson.videoUrl || "")

  const handleSave = async () => {
    if (!title.trim()) {
      return
    }

    const formData = new FormData()
    formData.set("id", lesson.id)
    formData.set("title", title)
    formData.set("description", description)
    formData.set("videoUrl", videoUrl)

    await updateLesson(formData)
    onSave()
  }

  const handleCancel = () => {
    // Reset to original values
    setTitle(lesson.title)
    setDescription(lesson.description || "")
    setVideoUrl(lesson.videoUrl || "")
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Modifier la leçon</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">Titre</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Titre de la leçon"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (optionnel)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description de la leçon"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="videoUrl">URL vidéo</Label>
            <Input
              id="videoUrl"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="https://youtube.com/watch?v=..."
            />
          </div>

          <div className="space-y-2">
            <Label>Aperçu vidéo</Label>
            <VideoPreview url={videoUrl} />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            Annuler
          </Button>
          <Button onClick={handleSave}>
            Enregistrer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
