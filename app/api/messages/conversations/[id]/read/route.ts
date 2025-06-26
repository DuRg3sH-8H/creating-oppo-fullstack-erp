import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { verifyToken } from "@/lib/jwt"
import { findUserById } from "@/lib/db/users"
import { markConversationAsRead } from "@/lib/db/messages"

export async function PUT(_request: NextRequest, { params }: { params: { id: string } }) {
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

    await markConversationAsRead(params.id, userId)

    return NextResponse.json({
      success: true,
      message: "Conversation marked as read",
    })
  } catch (error) {
    console.error("Error marking conversation as read:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
