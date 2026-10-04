"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { createLesson, updateLesson } from "@/app/(dashboard)/dashboard/courses/actions"

interface Lesson {
  id: string
  title: string
  description: string | null
  videoUrl: string | null
  order: number
  moduleId: string
}

interface LessonFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  lesson?: Lesson
  moduleId: string
}

export function LessonFormDialog({
  open,
  onOpenChange,
  lesson,
  moduleId,
}: LessonFormDialogProps) {
  const resetKey = [
    open,
    lesson?.id,
    lesson?.title,
    lesson?.description,
    lesson?.videoUrl,
  ].join(":")

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <LessonFormFields
        key={resetKey}
        lesson={lesson}
        moduleId={moduleId}
        onOpenChange={onOpenChange}
      />
    </Dialog>
  )
}

interface LessonFormFieldsProps {
  onOpenChange: (open: boolean) => void
  lesson?: Lesson
  moduleId: string
}

function LessonFormFields({
  onOpenChange,
  lesson,
  moduleId,
}: LessonFormFieldsProps) {
  const [title, setTitle] = useState(lesson?.title ?? "")
  const [description, setDescription] = useState(lesson?.description ?? "")
  const [videoUrl, setVideoUrl] = useState(lesson?.videoUrl ?? "")
  const [error, setError] = useState<string>()
  const [isPending, setIsPending] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(undefined)
    setIsPending(true)

    const formData = new FormData()
    if (lesson) {
      formData.set("id", lesson.id)
    } else {
      formData.set("moduleId", moduleId)
    }
    formData.set("title", title)
    formData.set("description", description)
    formData.set("videoUrl", videoUrl)

    try {
      const result = lesson
        ? await updateLesson(formData)
        : await createLesson(formData)

      if (result && "error" in result) {
        setError(result.error)
        return
      }

      onOpenChange(false)
    } finally {
      setIsPending(false)
    }
  }

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>
          {lesson ? "Modifier la leçon" : "Ajouter une leçon"}
        </DialogTitle>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <Label htmlFor="lesson-title">Titre</Label>
          <Input
            id="lesson-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        <div>
          <Label htmlFor="lesson-description">Description</Label>
          <Textarea
            id="lesson-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
          />
        </div>

        <div>
          <Label htmlFor="lesson-video-url">URL vidéo</Label>
          <Input
            id="lesson-video-url"
            type="url"
            placeholder="https://..."
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
          />
        </div>

        <div>
          <Label>Aperçu</Label>
          {videoUrl ? (
            <iframe
              src={videoUrl}
              sandbox="allow-scripts allow-same-origin allow-presentation"
              allow="fullscreen"
              referrerPolicy="strict-origin-when-cross-origin"
              className="aspect-video w-full rounded-md border"
            />
          ) : (
            <div className="aspect-video w-full rounded-md border bg-muted flex items-center justify-center text-sm text-muted-foreground text-center px-4">
              Ajoutez une URL vidéo pour voir l&apos;aperçu
            </div>
          )}
        </div>

        {error && <div className="text-sm text-destructive">{error}</div>}

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Annuler
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending ? "En cours..." : "Enregistrer"}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  )
}
