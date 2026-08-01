import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Card } from "@/components/ui/card"

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

      <Card className="p-6">
        <p className="text-muted-foreground">
          Vos cours apparaîtront ici.
        </p>
      </Card>
    </div>
  )
}
