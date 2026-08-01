import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { CourseForm } from "@/components/course-form"
import { createCourse } from "../actions"

export default async function NewCoursePage() {
  const session = await auth()

  if (!session || session.user.role !== "PROF") {
    redirect("/login")
  }

  return (
    <div className="container mx-auto p-4 md:p-6 max-w-2xl">
      <h1 className="text-3xl font-semibold mb-6">Créer un nouveau cours</h1>
      <CourseForm action={createCourse} />
    </div>
  )
}
