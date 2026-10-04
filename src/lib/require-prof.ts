import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

/**
 * Garde pour les actions sensibles (gestion du compte Stripe) : le rôle est relu en base,
 * car celui du JWT peut être périmé (changement de rôle, utilisateur supprimé).
 *
 * Retourne `null` si l'appelant n'est pas un prof : c'est à l'action de rediriger,
 * en dehors de tout `try/catch` (redirect() lève une exception).
 */
export async function requireProf(): Promise<{ userId: string } | null> {
  const session = await auth()
  const userId = session?.user?.id
  if (!userId) return null

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, role: true },
  })

  if (!user || user.role !== "PROF") return null

  return { userId: user.id }
}
