import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { verifyToken } from "@/lib/jwt"
import { findUserById } from "@/lib/db/users"
import { getConversationById } from "@/lib/db/messages"

export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
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

    const conversation = await getConversationById(params.id, userId)
    if (!conversation) {
      return NextResponse.json({ error: "Conversation not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      conversation: {
        id: conversation.id || conversation._id?.toString(),
        participants: conversation.participants,
        title: conversation.title,
        lastMessage: conversation.lastMessage,
        lastMessageTime: conversation.lastMessageTime,
        unreadCount: conversation.unreadCount[userId] || 0,
        createdAt: conversation.createdAt,
        updatedAt: conversation.updatedAt,
      },
    })
  } catch (error) {
    console.error("Error getting conversation:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
