import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { buttonVariants } from "@/components/ui/button"
import Link from "next/link"
import { BookOpen } from "lucide-react"

export default async function DashboardPage() {
  const session = await auth()

  if (!session) {
    redirect("/login")
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-semibold mb-2">Tableau de bord</h1>
      <p className="text-muted-foreground mb-8">
        Bienvenue, {session.user.email}
      </p>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="size-5" />
              Mes cours
            </CardTitle>
            <CardDescription>
              Gérez vos cours et leur contenu
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard/courses" className={buttonVariants()}>
              Voir mes cours
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
