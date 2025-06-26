import { type NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/jwt"
import { markNotificationAsRead } from "@/lib/db/notifications"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
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

    const notificationId = params.id
    const success = await markNotificationAsRead(notificationId, userId)

    if (!success) {
      return NextResponse.json({ error: "Notification not found or already read" }, { status: 404 })
    }

    return NextResponse.json({ message: "Notification marked as read" })
  } catch (error) {
    console.error("Error in POST /api/notifications/[id]/read:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to mark notification as read" },
      { status: 500 },
    )
  }
}
