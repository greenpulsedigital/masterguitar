import Link from "next/link"
import { auth } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { logout } from "@/app/(auth)/logout/actions"

export async function Header() {
  const session = await auth()

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="flex items-center gap-2">
          <Link href="/" className="font-bold text-lg">
            MasterGuitar
          </Link>
        </div>
        <nav className="ml-auto flex items-center gap-4">
          {session ? (
            <>
              <Link href="/dashboard">
                <Button variant="ghost" size="sm">
                  Tableau de bord
                </Button>
              </Link>
              <span className="text-sm text-muted-foreground">
                {session.user.email}
              </span>
              <form action={logout}>
                <Button type="submit" variant="ghost" size="sm">
                  Déconnexion
                </Button>
              </form>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  Se connecter
                </Button>
              </Link>
              <Link href="/signup">
                <Button variant="default" size="sm">
                  S&apos;inscrire
                </Button>
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}
