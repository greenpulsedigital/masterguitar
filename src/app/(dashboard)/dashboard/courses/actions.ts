"use server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { generateSlug } from "@/lib/slug"
import { redirect } from "next/navigation"
import { z } from "zod"

const courseSchema = z.object({
  title: z.string().min(1, "Le titre est requis"),
  description: z.string().optional(),
  price: z.number().min(0, "Le prix doit être positif ou nul"),
  thumbnailUrl: z.string().url().optional().or(z.literal("")),
})

export async function createCourse(formData: FormData) {
  const session = await auth()

  if (!session || session.user.role !== "PROF") {
    redirect("/login")
  }

  // Extract and parse form data
  const title = formData.get("title") as string
  const description = (formData.get("description") as string) || ""
  const priceStr = formData.get("price") as string
  const thumbnailUrl = (formData.get("thumbnailUrl") as string) || ""

  // Convert price from EUR string to cents
  const price = priceStr ? Math.round(parseFloat(priceStr) * 100) : 0

  // Validate input
  const validation = courseSchema.safeParse({
    title,
    description: description || undefined,
    price,
    thumbnailUrl: thumbnailUrl || undefined,
  })

  if (!validation.success) {
    return { error: validation.error.issues[0].message }
  }

  // Generate slug from title
  const slug = generateSlug(title)

  try {
    // Create course
    const course = await prisma.course.create({
      data: {
        title,
        slug,
        description: description || null,
        price,
        thumbnailUrl: thumbnailUrl || null,
        status: "DRAFT",
        profId: session.user.id,
      },
    })

    redirect(`/dashboard/courses/${course.id}`)
  } catch (error) {
    return { error: "Erreur lors de la création du cours" }
  }
}

export async function updateCourse(formData: FormData) {
  const session = await auth()

  if (!session || session.user.role !== "PROF") {
    redirect("/login")
  }

  const id = formData.get("id") as string
  const title = formData.get("title") as string
  const description = (formData.get("description") as string) || ""
  const priceStr = formData.get("price") as string
  const thumbnailUrl = (formData.get("thumbnailUrl") as string) || ""

  // Convert price from EUR string to cents
  const price = priceStr ? Math.round(parseFloat(priceStr) * 100) : 0

  // Validate input
  const validation = courseSchema.safeParse({
    title,
    description: description || undefined,
    price,
    thumbnailUrl: thumbnailUrl || undefined,
  })

  if (!validation.success) {
    return { error: validation.error.issues[0].message }
  }

  // Check ownership
  const existingCourse = await prisma.course.findUnique({
    where: { id },
  })

  if (!existingCourse) {
    return { error: "Cours introuvable" }
  }

  if (existingCourse.profId !== session.user.id) {
    return { error: "Vous n'êtes pas autorisé à modifier ce cours" }
  }

  // Generate slug from title
  const slug = generateSlug(title)

  try {
    await prisma.course.update({
      where: { id },
      data: {
        title,
        slug,
        description: description || null,
        price,
        thumbnailUrl: thumbnailUrl || null,
      },
    })

    redirect("/dashboard/courses")
  } catch (error) {
    return { error: "Erreur lors de la mise à jour du cours" }
  }
}

export async function deleteCourse(formData: FormData) {
  const session = await auth()

  if (!session || session.user.role !== "PROF") {
    redirect("/login")
  }

  const id = formData.get("id") as string

  // Check ownership
  const existingCourse = await prisma.course.findUnique({
    where: { id },
  })

  if (!existingCourse) {
    return { error: "Cours introuvable" }
  }

  if (existingCourse.profId !== session.user.id) {
    return { error: "Vous n'êtes pas autorisé à supprimer ce cours" }
  }

  try {
    await prisma.course.delete({
      where: { id },
    })

    redirect("/dashboard/courses")
  } catch (error) {
    return { error: "Erreur lors de la suppression du cours" }
  }
}
