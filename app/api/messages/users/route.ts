import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { verifyToken } from "@/lib/jwt"
import { findUserById } from "@/lib/db/users"
import { getAvailableUsers } from "@/lib/db/messages"

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("auth-token")

    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const decoded = verifyToken(token.value)
    if (!decoded || typeof decoded !== "object" || (!decoded.userId && !decoded.id)) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const userId = decoded.userId || decoded.id
    const user = await findUserById(userId)
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const availableUsers = await getAvailableUsers(user._id.toString(), user.role, user.schoolId)

    return NextResponse.json({
      success: true,
      users: availableUsers,
    })
  } catch (error) {
    console.error("Error getting available users:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
