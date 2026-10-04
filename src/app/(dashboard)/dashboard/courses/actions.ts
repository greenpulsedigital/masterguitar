"use server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { generateUniqueSlug } from "@/lib/course-slug"
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

  const slug = await generateUniqueSlug(title)

  let course
  try {
    // Create course
    course = await prisma.course.create({
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
  } catch {
    return { error: "Erreur lors de la création du cours" }
  }

  redirect(`/dashboard/courses/${course.id}`)
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

  // The slug is intentionally left untouched: renaming a course must not break its public URL
  try {
    await prisma.course.update({
      where: { id },
      data: {
        title,
        description: description || null,
        price,
        thumbnailUrl: thumbnailUrl || null,
      },
    })
  } catch {
    return { error: "Erreur lors de la mise à jour du cours" }
  }

  redirect("/dashboard/courses")
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

  const purchaseCount = await prisma.purchase.count({
    where: { courseId: id },
  })

  if (purchaseCount > 0) {
    return {
      error:
        "Ce cours a déjà été acheté et ne peut pas être supprimé. Repassez-le en brouillon pour le retirer de la vente.",
    }
  }

  try {
    await prisma.course.delete({
      where: { id },
    })
  } catch {
    return { error: "Erreur lors de la suppression du cours" }
  }

  redirect("/dashboard/courses")
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
  } catch {
    return { error: "Erreur lors de la création du module" }
  }

  redirect(`/dashboard/courses/${courseId}`)
}

export async function updateModule(formData: FormData) {
  const session = await auth()

  if (!session || session.user.role !== "PROF") {
    redirect("/login")
  }

  const id = formData.get("id") as string
  const title = ((formData.get("title") as string) || "").trim()

  if (title === "") {
    return { error: "Le titre est requis" }
  }

  // Check ownership
  const courseModule = await prisma.module.findUnique({
    where: { id },
    include: { course: true },
  })

  if (!courseModule) {
    return { error: "Module introuvable" }
  }

  if (courseModule.course.profId !== session.user.id) {
    return { error: "Vous n'êtes pas autorisé à modifier ce module" }
  }

  try {
    await prisma.module.update({
      where: { id },
      data: { title },
    })
  } catch {
    return { error: "Erreur lors de la mise à jour du module" }
  }

  redirect(`/dashboard/courses/${courseModule.courseId}`)
}

export async function deleteModule(formData: FormData) {
  const session = await auth()

  if (!session || session.user.role !== "PROF") {
    redirect("/login")
  }

  const id = formData.get("id") as string

  // Check ownership
  const courseModule = await prisma.module.findUnique({
    where: { id },
    include: { course: true },
  })

  if (!courseModule) {
    return { error: "Module introuvable" }
  }

  if (courseModule.course.profId !== session.user.id) {
    return { error: "Vous n'êtes pas autorisé à supprimer ce module" }
  }

  try {
    await prisma.module.delete({
      where: { id },
    })
  } catch {
    return { error: "Erreur lors de la suppression du module" }
  }

  redirect(`/dashboard/courses/${courseModule.courseId}`)
}

export async function reorderModule(formData: FormData) {
  const session = await auth()

  if (!session || session.user.role !== "PROF") {
    redirect("/login")
  }

  const id = formData.get("id") as string
  const direction = formData.get("direction")

  if (direction !== "up" && direction !== "down") {
    return { error: "Direction invalide" }
  }

  // Get module with course and all modules
  const courseModule = await prisma.module.findUnique({
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

  if (!courseModule) {
    return { error: "Module introuvable" }
  }

  if (courseModule.course.profId !== session.user.id) {
    return { error: "Vous n'êtes pas autorisé à modifier ce module" }
  }

  const modules = courseModule.course.modules
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

  // Swap orders atomically
  try {
    await prisma.$transaction([
      prisma.module.update({
        where: { id: courseModule.id },
        data: { order: adjacentModule.order },
      }),
      prisma.module.update({
        where: { id: adjacentModule.id },
        data: { order: courseModule.order },
      }),
    ])
  } catch {
    return { error: "Erreur lors du réordonnancement du module" }
  }

  redirect(`/dashboard/courses/${courseModule.courseId}`)
}

// Lesson actions

const lessonSchema = z.object({
  title: z.string().min(1, "Le titre est requis"),
  description: z.string().optional(),
  // External hosts are allowed (ADR 005) but only over https, so javascript:/data: URLs can't reach the iframe
  videoUrl: z
    .string()
    .url()
    .refine((value) => value.startsWith("https://"), "L'URL vidéo doit commencer par https://")
    .optional()
    .or(z.literal("")),
})

export async function createLesson(formData: FormData) {
  const session = await auth()

  if (!session || session.user.role !== "PROF") {
    redirect("/login")
  }

  const moduleId = formData.get("moduleId") as string
  const title = formData.get("title") as string
  const description = (formData.get("description") as string) || ""
  const videoUrl = (formData.get("videoUrl") as string) || ""

  // Validate input
  const validation = lessonSchema.safeParse({
    title,
    description: description || undefined,
    videoUrl: videoUrl || undefined,
  })

  if (!validation.success) {
    return { error: validation.error.issues[0].message }
  }

  // Check ownership
  const courseModule = await prisma.module.findUnique({
    where: { id: moduleId },
    include: { course: true, lessons: true },
  })

  if (!courseModule) {
    return { error: "Module introuvable" }
  }

  if (courseModule.course.profId !== session.user.id) {
    return { error: "Vous n'êtes pas autorisé à modifier ce module" }
  }

  // Calculate next order value
  const maxOrder = courseModule.lessons.length > 0
    ? Math.max(...courseModule.lessons.map(l => l.order))
    : 0
  const order = maxOrder + 1

  try {
    await prisma.lesson.create({
      data: {
        title,
        description: description || null,
        videoUrl: videoUrl || null,
        order,
        moduleId,
      },
    })
  } catch {
    return { error: "Erreur lors de la création de la leçon" }
  }

  redirect(`/dashboard/courses/${courseModule.courseId}`)
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

  // Validate input
  const validation = lessonSchema.safeParse({
    title,
    description: description || undefined,
    videoUrl: videoUrl || undefined,
  })

  if (!validation.success) {
    return { error: validation.error.issues[0].message }
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
  } catch {
    return { error: "Erreur lors de la mise à jour de la leçon" }
  }

  redirect(`/dashboard/courses/${lesson.module.courseId}`)
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
  } catch {
    return { error: "Erreur lors de la suppression de la leçon" }
  }

  redirect(`/dashboard/courses/${lesson.module.courseId}`)
}

export async function reorderLesson(formData: FormData) {
  const session = await auth()

  if (!session || session.user.role !== "PROF") {
    redirect("/login")
  }

  const id = formData.get("id") as string
  const direction = formData.get("direction")

  if (direction !== "up" && direction !== "down") {
    return { error: "Direction invalide" }
  }

  // Get lesson with module, course and all sibling lessons
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

  // Swap orders atomically
  try {
    await prisma.$transaction([
      prisma.lesson.update({
        where: { id: lesson.id },
        data: { order: adjacentLesson.order },
      }),
      prisma.lesson.update({
        where: { id: adjacentLesson.id },
        data: { order: lesson.order },
      }),
    ])
  } catch {
    return { error: "Erreur lors du réordonnancement de la leçon" }
  }

  redirect(`/dashboard/courses/${lesson.module.courseId}`)
}

export async function toggleCourseStatus(formData: FormData) {
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
    return { error: "Vous n'êtes pas autorisé à modifier ce cours" }
  }

  // Toggle status
  const newStatus = existingCourse.status === "DRAFT" ? "PUBLISHED" : "DRAFT"

  try {
    await prisma.course.update({
      where: { id },
      data: { status: newStatus },
    })
  } catch {
    return { error: "Erreur lors du changement de statut du cours" }
  }

  redirect(`/dashboard/courses/${id}`)
}
