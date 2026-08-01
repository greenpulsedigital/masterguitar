"use client"

import { Package } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ModuleList } from "@/components/module-list"
import { createModule } from "@/app/(dashboard)/dashboard/courses/actions"

interface Module {
  id: string
  title: string
  order: number
  courseId: string
}

interface ModuleSectionProps {
  modules: Module[]
  courseId: string
}

export function ModuleSection({ modules, courseId }: ModuleSectionProps) {
  async function handleCreateModule(formData: FormData) {
    await createModule(formData)
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Modules</CardTitle>
          <form action={handleCreateModule}>
            <input type="hidden" name="courseId" value={courseId} />
            <Button type="submit" size="sm">
              Ajouter un module
            </Button>
          </form>
        </div>
      </CardHeader>
      <CardContent>
        {modules.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
            <Package className="h-12 w-12 mb-3" />
            <p>Aucun module</p>
          </div>
        ) : (
          <ModuleList modules={modules} courseId={courseId} />
        )}
      </CardContent>
    </Card>
  )
}
