import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { verifyToken } from "@/lib/jwt"
import { findUserById } from "@/lib/db/users"
import { getConversationsByUser, createConversation } from "@/lib/db/messages"

export async function GET(_request: NextRequest) {
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


    // Get conversations for the user
    const conversations = await getConversationsByUser(userId, user.role, user.schoolId)


    return NextResponse.json({
      success: true,
      conversations: conversations.map((conv) => ({
        id: conv.id || conv._id?.toString(),
        participants: conv.participants,
        title: conv.title,
        lastMessage: conv.lastMessage,
        lastMessageTime: conv.lastMessageTime,
        unreadCount: conv.unreadCount[userId] || 0,
        createdAt: conv.createdAt,
        updatedAt: conv.updatedAt,
      })),
    })
  } catch (error) {
    console.error("Error in conversations API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
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

    const { participantIds, title } = await request.json()

    if (!participantIds || !Array.isArray(participantIds) || participantIds.length === 0) {
      return NextResponse.json({ error: "Participant IDs are required" }, { status: 400 })
    }

    // Get participant details
    const participants = []

    // Add current user as participant
    participants.push({
      userId: user._id.toString(),
      userName: user.name,
      userRole: user.role,
      schoolId: user.schoolId,
      schoolName: user.schoolName,
      joinedAt: new Date(),
      isActive: true,
    })

    // Add other participants
    for (const participantId of participantIds) {
      const participant = await findUserById(participantId)
      if (participant) {
        participants.push({
          userId: participant._id.toString(),
          userName: participant.name,
          userRole: participant.role,
          schoolId: participant.schoolId,
          schoolName: participant.schoolName,
          joinedAt: new Date(),
          isActive: true,
        })
      }
    }

    const conversationId = await createConversation(user._id.toString(), participants, title)

    return NextResponse.json({
      success: true,
      conversationId,
      message: "Conversation created successfully",
    })
  } catch (error) {
    console.error("Error creating conversation:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
