import { type NextRequest, NextResponse } from "next/server"
import { changeUserPassword } from "@/lib/db/users"
import { verifyToken } from "@/lib/jwt"

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get("auth-token")?.value

    if (!token) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const { currentPassword, newPassword, confirmPassword } = await request.json()

    if (!currentPassword || !newPassword || !confirmPassword) {
      return NextResponse.json({ error: "All password fields are required" }, { status: 400 })
    }

    if (newPassword !== confirmPassword) {
      return NextResponse.json({ error: "New passwords do not match" }, { status: 400 })
    }

    await changeUserPassword(decoded.userId, currentPassword, newPassword)

    return NextResponse.json({ message: "Password changed successfully" })
  } catch (error) {
    console.error("Error in POST /api/profile/password:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to change password" },
      { status: 500 },
    )
  }
}
