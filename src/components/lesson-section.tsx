"use client"

import { useState } from "react"
import { Video } from "lucide-react"
import { Button } from "@/components/ui/button"
import { LessonList } from "@/components/lesson-list"
import { LessonFormDialog } from "@/components/lesson-form-dialog"

interface Lesson {
  id: string
  title: string
  description: string | null
  videoUrl: string | null
  order: number
  moduleId: string
}

interface LessonSectionProps {
  lessons: Lesson[]
  moduleId: string
}

export function LessonSection({ lessons, moduleId }: LessonSectionProps) {
  const [addDialogOpen, setAddDialogOpen] = useState(false)

  return (
    <div className="border rounded-lg p-3 bg-background">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-sm font-medium">Leçons</h4>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setAddDialogOpen(true)}
        >
          Ajouter une leçon
        </Button>
      </div>

      {lessons.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-4 text-muted-foreground">
          <Video className="h-8 w-8 mb-2" />
          <p className="text-sm font-medium">Aucune leçon</p>
          <p className="text-xs">Ajoutez des leçons vidéo à ce module.</p>
        </div>
      ) : (
        <LessonList lessons={lessons} moduleId={moduleId} />
      )}

      <LessonFormDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        moduleId={moduleId}
      />
    </div>
  )
}
