import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect, notFound } from "next/navigation"
import { CourseForm } from "@/components/course-form"
import { ModuleSection } from "@/components/module-section"
import { PublishBlockedNotice } from "@/components/publish-blocked-notice"
import { getProfStripeStatus, type ProfStripeStatus } from "@/lib/prof-stripe-account"
import { updateCourse, deleteCourse, toggleCourseStatus } from "../actions"
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
import { Badge } from "@/components/ui/badge"
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
        include: {
          lessons: {
            orderBy: { order: "asc" },
          },
        },
      },
    },
  })

  if (!course) {
    notFound()
  }

  if (course.profId !== session.user.id) {
    redirect("/dashboard/courses")
  }

  // Un brouillon ne peut être publié qu'avec un compte Stripe actif. Le serveur reste l'autorité :
  // si le statut est illisible, on n'affirme rien et le bouton reste actif.
  let stripeStatus: ProfStripeStatus | null = null
  try {
    stripeStatus = await getProfStripeStatus(session.user.id)
  } catch (error) {
    const code = (error as { code?: unknown })?.code
    console.error("stripe status unavailable on course page", typeof code === "string" ? code : undefined)
  }
  const publishBlocked =
    course.status === "DRAFT" && stripeStatus !== null && stripeStatus.status !== "ACTIVE"

  return (
    <div className="container mx-auto p-4 md:p-6 max-w-2xl">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-semibold">Modifier le cours</h1>
          <Badge variant={course.status === "PUBLISHED" ? "default" : "secondary"}>
            {course.status === "PUBLISHED" ? "PUBLIÉ" : "DRAFT"}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <PublishButton
            courseId={course.id}
            currentStatus={course.status}
            disabled={publishBlocked}
          />
          <DeleteCourseDialog courseId={course.id} courseTitle={course.title} />
        </div>
      </div>
      {publishBlocked && <PublishBlockedNotice />}
      <div className="space-y-6">
        <CourseForm course={course} action={updateCourse} />
        <ModuleSection modules={course.modules} courseId={course.id} />
      </div>
    </div>
  )
}

function PublishButton({
  courseId,
  currentStatus,
  disabled = false,
}: {
  courseId: string
  currentStatus: string
  disabled?: boolean
}) {
  async function handleToggle() {
    "use server"
    const formData = new FormData()
    formData.set("id", courseId)
    await toggleCourseStatus(formData)
  }

  return (
    <form action={handleToggle}>
      <Button
        type="submit"
        variant={currentStatus === "PUBLISHED" ? "outline" : "default"}
        size="sm"
        disabled={disabled}
      >
        {currentStatus === "PUBLISHED" ? "Dépublier" : "Publier"}
      </Button>
    </form>
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
            Êtes-vous sûr de vouloir supprimer le cours &quot;{courseTitle}&quot; ?
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
