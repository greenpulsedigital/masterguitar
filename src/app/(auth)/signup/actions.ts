"use server"

import { z } from "zod"
import * as bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { signIn } from "@/lib/auth"

export const signupSchema = z.object({
  name: z.string().min(1, "Le nom est requis"),
  email: z.string().email("Email invalide"),
  password: z.string().min(8, "Le mot de passe doit contenir au moins 8 caractères"),
  isProf: z.boolean().default(false),
})

export async function signup(formData: FormData) {
  const rawData = {
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    isProf: formData.get("isProf") === "on",
  }

  const validation = signupSchema.safeParse(rawData)

  if (!validation.success) {
    return {
      error: validation.error.issues[0].message,
    }
  }

  const { name, email, password, isProf } = validation.data

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email },
  })

  if (existingUser) {
    return {
      error: "Un compte avec cet email existe déjà",
    }
  }

  // Hash password
  const passwordHash = await bcrypt.hash(password, 10)

  // Create user
  await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
      role: isProf ? "PROF" : "STUDENT",
    },
  })

  // Auto-login after signup
  await signIn("credentials", {
    email,
    password,
    redirect: false,
  })

  redirect("/dashboard")
}
