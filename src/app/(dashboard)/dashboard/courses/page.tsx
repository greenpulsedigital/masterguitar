import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { BookOpen, Trash2 } from "lucide-react"

export default async function CoursesPage() {
  const session = await auth()

  if (!session || session.user.role !== "PROF") {
    redirect("/login")
  }

  const courses = await prisma.course.findMany({
    where: { profId: session.user.id },
    orderBy: { createdAt: "desc" },
  })

  return (
    <div className="container mx-auto p-4 md:p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-semibold">Mes cours</h1>
        <Button asChild>
          <Link href="/dashboard/courses/new">Nouveau cours</Link>
        </Button>
      </div>

      {courses.length === 0 ? (
        <Card className="p-8 text-center">
          <BookOpen className="size-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-lg font-medium mb-2">Aucun cours pour l'instant</p>
          <p className="text-muted-foreground mb-4">
            Créez votre premier cours pour commencer
          </p>
          <Button asChild>
            <Link href="/dashboard/courses/new">Créer un cours</Link>
          </Button>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <Card key={course.id} className="p-4">
              <div className="aspect-video bg-muted rounded-md mb-3 flex items-center justify-center">
                {course.thumbnailUrl ? (
                  <img
                    src={course.thumbnailUrl}
                    alt={course.title}
                    className="object-cover w-full h-full rounded-md"
                  />
                ) : (
                  <BookOpen className="size-12 text-muted-foreground" />
                )}
              </div>
              <h3 className="text-lg font-semibold truncate mb-1">{course.title}</h3>
              <p className="text-sm text-muted-foreground mb-2">
                {(course.price / 100).toFixed(2)} €
              </p>
              <Badge variant={course.status === "PUBLISHED" ? "default" : "secondary"} className="mb-3">
                {course.status === "PUBLISHED" ? "Publié" : "Brouillon"}
              </Badge>
              <div className="flex gap-2 mt-3">
                <Button asChild variant="outline" size="sm" className="flex-1">
                  <Link href={`/dashboard/courses/${course.id}`}>Modifier</Link>
                </Button>
                <Button variant="ghost" size="sm">
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
