import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect, notFound } from "next/navigation"
import { CourseForm } from "@/components/course-form"
import { ModuleSection } from "@/components/module-section"
import { updateCourse, deleteCourse } from "../actions"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"

export default async function EditCoursePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await auth()

  if (!session || session.user.role !== "PROF") {
    redirect("/login")
  }

  const { id } = await params

  const course = await prisma.course.findUnique({
    where: { id },
    include: {
      modules: {
        orderBy: { order: "asc" },
      },
    },
  })

  if (!course) {
    notFound()
  }

  if (course.profId !== session.user.id) {
    redirect("/dashboard/courses")
  }

  return (
    <div className="container mx-auto p-4 md:p-6 max-w-2xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-semibold">Modifier le cours</h1>
        <DeleteCourseDialog courseId={course.id} courseTitle={course.title} />
      </div>
      <div className="space-y-6">
        <CourseForm course={course} action={updateCourse} />
        <ModuleSection modules={course.modules} courseId={course.id} />
      </div>
    </div>
  )
}

function DeleteCourseDialog({
  courseId,
  courseTitle,
}: {
  courseId: string
  courseTitle: string
}) {
  async function handleDelete() {
    "use server"
    const formData = new FormData()
    formData.set("id", courseId)
    await deleteCourse(formData)
  }

  return (
    <Dialog>
      <DialogTrigger
        render={
          <Button variant="destructive" size="sm" />
        }
      >
        <Trash2 className="size-4 mr-2" />
        Supprimer
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Supprimer le cours</DialogTitle>
          <DialogDescription>
            Êtes-vous sûr de vouloir supprimer le cours "{courseTitle}" ?
            Cette action est irréversible.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <form action={handleDelete}>
            <Button type="submit" variant="destructive">
              Supprimer définitivement
            </Button>
          </form>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
