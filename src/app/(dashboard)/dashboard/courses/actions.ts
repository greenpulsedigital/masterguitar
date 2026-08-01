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

// Module actions

export async function createModule(formData: FormData) {
  const session = await auth()

  if (!session || session.user.role !== "PROF") {
    redirect("/login")
  }

  const courseId = formData.get("courseId") as string

  // Check ownership
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: { modules: true },
  })

  if (!course) {
    return { error: "Cours introuvable" }
  }

  if (course.profId !== session.user.id) {
    return { error: "Vous n'êtes pas autorisé à modifier ce cours" }
  }

  // Calculate next order value
  const maxOrder = course.modules.length > 0
    ? Math.max(...course.modules.map(m => m.order))
    : 0
  const order = maxOrder + 1

  try {
    await prisma.module.create({
      data: {
        title: "Nouveau module",
        order,
        courseId,
      },
    })

    redirect(`/dashboard/courses/${courseId}`)
  } catch (error) {
    return { error: "Erreur lors de la création du module" }
  }
}

export async function updateModule(formData: FormData) {
  const session = await auth()

  if (!session || session.user.role !== "PROF") {
    redirect("/login")
  }

  const id = formData.get("id") as string
  const title = formData.get("title") as string

  if (!title || title.trim() === "") {
    return { error: "Le titre est requis" }
  }

  // Check ownership
  const module = await prisma.module.findUnique({
    where: { id },
    include: { course: true },
  })

  if (!module) {
    return { error: "Module introuvable" }
  }

  if (module.course.profId !== session.user.id) {
    return { error: "Vous n'êtes pas autorisé à modifier ce module" }
  }

  try {
    await prisma.module.update({
      where: { id },
      data: { title },
    })

    redirect(`/dashboard/courses/${module.courseId}`)
  } catch (error) {
    return { error: "Erreur lors de la mise à jour du module" }
  }
}

export async function deleteModule(formData: FormData) {
  const session = await auth()

  if (!session || session.user.role !== "PROF") {
    redirect("/login")
  }

  const id = formData.get("id") as string

  // Check ownership
  const module = await prisma.module.findUnique({
    where: { id },
    include: { course: true },
  })

  if (!module) {
    return { error: "Module introuvable" }
  }

  if (module.course.profId !== session.user.id) {
    return { error: "Vous n'êtes pas autorisé à supprimer ce module" }
  }

  try {
    await prisma.module.delete({
      where: { id },
    })

    redirect(`/dashboard/courses/${module.courseId}`)
  } catch (error) {
    return { error: "Erreur lors de la suppression du module" }
  }
}

export async function reorderModule(formData: FormData) {
  const session = await auth()

  if (!session || session.user.role !== "PROF") {
    redirect("/login")
  }

  const id = formData.get("id") as string
  const direction = formData.get("direction") as "up" | "down"

  // Get module with course and all modules
  const module = await prisma.module.findUnique({
    where: { id },
    include: {
      course: {
        include: {
          modules: {
            orderBy: { order: "asc" },
          },
        },
      },
    },
  })

  if (!module) {
    return { error: "Module introuvable" }
  }

  if (module.course.profId !== session.user.id) {
    return { error: "Vous n'êtes pas autorisé à modifier ce module" }
  }

  const modules = module.course.modules
  const currentIndex = modules.findIndex(m => m.id === id)

  // Check boundaries
  if (direction === "up" && currentIndex === 0) {
    return { error: "Le module est déjà en première position" }
  }

  if (direction === "down" && currentIndex === modules.length - 1) {
    return { error: "Le module est déjà en dernière position" }
  }

  // Find adjacent module
  const adjacentIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1
  const adjacentModule = modules[adjacentIndex]

  // Swap orders
  try {
    await prisma.module.update({
      where: { id: module.id },
      data: { order: adjacentModule.order },
    })

    await prisma.module.update({
      where: { id: adjacentModule.id },
      data: { order: module.order },
    })

    redirect(`/dashboard/courses/${module.courseId}`)
  } catch (error) {
    return { error: "Erreur lors du réordonnancement du module" }
  }
}

// Lesson actions

export async function createLesson(formData: FormData) {
  const session = await auth()

  if (!session || session.user.role !== "PROF") {
    redirect("/login")
  }

  const moduleId = formData.get("moduleId") as string

  // Check ownership
  const module = await prisma.module.findUnique({
    where: { id: moduleId },
    include: { course: true, lessons: true },
  })

  if (!module) {
    return { error: "Module introuvable" }
  }

  if (module.course.profId !== session.user.id) {
    return { error: "Vous n'êtes pas autorisé à modifier ce module" }
  }

  // Calculate next order value
  const maxOrder = module.lessons.length > 0
    ? Math.max(...module.lessons.map(l => l.order))
    : 0
  const order = maxOrder + 1

  try {
    await prisma.lesson.create({
      data: {
        title: "Nouvelle leçon",
        order,
        moduleId,
      },
    })

    redirect(`/dashboard/courses/${module.courseId}`)
  } catch (error) {
    return { error: "Erreur lors de la création de la leçon" }
  }
}

export async function updateLesson(formData: FormData) {
  const session = await auth()

  if (!session || session.user.role !== "PROF") {
    redirect("/login")
  }

  const id = formData.get("id") as string
  const title = formData.get("title") as string
  const description = (formData.get("description") as string) || ""
  const videoUrl = (formData.get("videoUrl") as string) || ""

  if (!title || title.trim() === "") {
    return { error: "Le titre est requis" }
  }

  // Check ownership
  const lesson = await prisma.lesson.findUnique({
    where: { id },
    include: { module: { include: { course: true } } },
  })

  if (!lesson) {
    return { error: "Leçon introuvable" }
  }

  if (lesson.module.course.profId !== session.user.id) {
    return { error: "Vous n'êtes pas autorisé à modifier cette leçon" }
  }

  try {
    await prisma.lesson.update({
      where: { id },
      data: {
        title,
        description: description || null,
        videoUrl: videoUrl || null,
      },
    })

    redirect(`/dashboard/courses/${lesson.module.courseId}`)
  } catch (error) {
    return { error: "Erreur lors de la mise à jour de la leçon" }
  }
}

export async function deleteLesson(formData: FormData) {
  const session = await auth()

  if (!session || session.user.role !== "PROF") {
    redirect("/login")
  }

  const id = formData.get("id") as string

  // Check ownership
  const lesson = await prisma.lesson.findUnique({
    where: { id },
    include: { module: { include: { course: true } } },
  })

  if (!lesson) {
    return { error: "Leçon introuvable" }
  }

  if (lesson.module.course.profId !== session.user.id) {
    return { error: "Vous n'êtes pas autorisé à supprimer cette leçon" }
  }

  try {
    await prisma.lesson.delete({
      where: { id },
    })

    redirect(`/dashboard/courses/${lesson.module.courseId}`)
  } catch (error) {
    return { error: "Erreur lors de la suppression de la leçon" }
  }
}

export async function reorderLesson(formData: FormData) {
  const session = await auth()

  if (!session || session.user.role !== "PROF") {
    redirect("/login")
  }

  const id = formData.get("id") as string
  const direction = formData.get("direction") as "up" | "down"

  // Get lesson with module and all lessons
  const lesson = await prisma.lesson.findUnique({
    where: { id },
    include: {
      module: {
        include: {
          course: true,
          lessons: {
            orderBy: { order: "asc" },
          },
        },
      },
    },
  })

  if (!lesson) {
    return { error: "Leçon introuvable" }
  }

  if (lesson.module.course.profId !== session.user.id) {
    return { error: "Vous n'êtes pas autorisé à modifier cette leçon" }
  }

  const lessons = lesson.module.lessons
  const currentIndex = lessons.findIndex(l => l.id === id)

  // Check boundaries
  if (direction === "up" && currentIndex === 0) {
    return { error: "La leçon est déjà en première position" }
  }

  if (direction === "down" && currentIndex === lessons.length - 1) {
    return { error: "La leçon est déjà en dernière position" }
  }

  // Find adjacent lesson
  const adjacentIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1
  const adjacentLesson = lessons[adjacentIndex]

  // Swap orders
  try {
    await prisma.lesson.update({
      where: { id: lesson.id },
      data: { order: adjacentLesson.order },
    })

    await prisma.lesson.update({
      where: { id: adjacentLesson.id },
      data: { order: lesson.order },
    })

    redirect(`/dashboard/courses/${lesson.module.courseId}`)
  } catch (error) {
    return { error: "Erreur lors du réordonnancement de la leçon" }
  }
}
