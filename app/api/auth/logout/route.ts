import { NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function POST() {
  try {
    const cookieStore = await cookies()

    // Clear the auth token cookie
    cookieStore.delete("auth-token")
    cookieStore.delete("isAuthenticated")

    return NextResponse.json({ success: true, message: "Logged out successfully" })
  } catch (error) {
    console.error("Logout error:", error)
    return NextResponse.json({ success: false, message: "An error occurred during logout" }, { status: 500 })
  }
}
