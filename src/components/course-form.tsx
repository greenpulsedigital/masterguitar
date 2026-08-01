"use client"

import { useState } from "react"
import { Button, buttonVariants } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import Link from "next/link"
import type { Course } from "@/generated/prisma/client"

interface CourseFormProps {
  course?: Course
  action: (formData: FormData) => Promise<{ error?: string } | void>
}

export function CourseForm({ course, action }: CourseFormProps) {
  const [error, setError] = useState<string>()
  const [isPending, setIsPending] = useState(false)

  async function handleSubmit(formData: FormData) {
    setError(undefined)
    setIsPending(true)

    try {
      const result = await action(formData)
      if (result && "error" in result) {
        setError(result.error)
      }
    } finally {
      setIsPending(false)
    }
  }

  return (
    <form action={handleSubmit} className="flex flex-col gap-4">
      {course && <input type="hidden" name="id" value={course.id} />}
      <div>
        <Label htmlFor="title">Titre</Label>
        <Input
          id="title"
          name="title"
          type="text"
          placeholder="Ex: Débuter la guitare"
          defaultValue={course?.title}
          required
        />
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          placeholder="Décrivez votre cours..."
          rows={4}
          defaultValue={course?.description || ""}
        />
      </div>

      <div>
        <Label htmlFor="price">Prix (€)</Label>
        <Input
          id="price"
          name="price"
          type="number"
          min="0"
          step="0.01"
          placeholder="49.99"
          defaultValue={course ? (course.price / 100).toFixed(2) : ""}
        />
        <p className="text-xs text-muted-foreground mt-1">
          Prix en euros, laissez 0 pour gratuit
        </p>
      </div>

      <div>
        <Label htmlFor="thumbnailUrl">Image de couverture (URL)</Label>
        <Input
          id="thumbnailUrl"
          name="thumbnailUrl"
          type="url"
          placeholder="https://..."
          defaultValue={course?.thumbnailUrl || ""}
        />
        <p className="text-xs text-muted-foreground mt-1">
          Collez l'URL d'une image hébergée
        </p>
      </div>

      {error && (
        <div className="text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="flex gap-3 justify-end mt-2">
        <Link href="/dashboard/courses" className={buttonVariants({ variant: "outline" })}>
          Annuler
        </Link>
        <Button type="submit" disabled={isPending}>
          {isPending ? "En cours..." : course ? "Enregistrer" : "Créer le cours"}
        </Button>
      </div>
    </form>
  )
}
