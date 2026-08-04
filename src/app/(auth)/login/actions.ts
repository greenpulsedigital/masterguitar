"use server"

import { signIn } from "@/lib/auth"
import { AuthError } from "next-auth"
import { redirect } from "next/navigation"
import { loginSchema } from "./schema"

export async function login(formData: FormData) {
  const rawData = {
    email: formData.get("email"),
    password: formData.get("password"),
  }

  const validation = loginSchema.safeParse(rawData)

  if (!validation.success) {
    return {
      error: validation.error.issues[0].message,
    }
  }

  const { email, password } = validation.data

  try {
    await signIn("credentials", {
      email,
      password,
      redirect: false,
    })
  } catch (error) {
    if (error instanceof AuthError) {
      return {
        error: "Email ou mot de passe incorrect",
      }
    }
    throw error
  }

  redirect("/dashboard")
}
