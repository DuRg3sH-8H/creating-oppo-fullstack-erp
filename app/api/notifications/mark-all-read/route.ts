import { type NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/jwt"
import { markAllNotificationsAsRead } from "@/lib/db/notifications"

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

    const userId = decoded.userId || decoded.id

    if (!userId) {
      return NextResponse.json({ error: "User ID not found in token" }, { status: 401 })
    }

    const markedCount = await markAllNotificationsAsRead(userId)

    return NextResponse.json({
      message: `${markedCount} notifications marked as read`,
      count: markedCount,
    })
  } catch (error) {
    console.error("Error in POST /api/notifications/mark-all-read:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to mark all notifications as read" },
      { status: 500 },
    )
  }
}
