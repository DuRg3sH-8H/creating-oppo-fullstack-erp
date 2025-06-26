"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { validateUserCredentials, updateUserLastLogin, getSchoolById } from "@/lib/db/users"
import { generateToken } from "@/lib/jwt"
import type { AuthResponse, UserCredentials } from "@/models/user"

export async function login(credentials: UserCredentials): Promise<AuthResponse> {
  try {
    const { email, password } = credentials

    // Basic validation
    if (!email || !password) {
      return {
        success: false,
        message: "Email and password are required",
      }
    }

    // Validate credentials
    const user = await validateUserCredentials({ email, password })

    if (!user) {
      return {
        success: false,
        message: "Invalid email or password",
      }
    }

    // Update last login time
    await updateUserLastLogin(user._id.toString())

    // Generate JWT token
    const token = generateToken(user)

    // Set cookie
    ;(await
      // Set cookie
      cookies()).set({
      name: "auth-token",
      value: token,
      httpOnly: true,
      path: "/",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 1 week
    })

    return {
      success: true,
      message: "Login successful",
      user,
      token,
    }
  } catch (error) {
    console.error("Login error:", error)
    return {
      success: false,
      message: "An error occurred during login",
    }
  }
}

export async function logout() {
  (await cookies()).delete("auth-token")
  redirect("/")
}

export async function getSchoolTheme(schoolId: string) {
  if (!schoolId) return null
  return getSchoolById(schoolId)
}
