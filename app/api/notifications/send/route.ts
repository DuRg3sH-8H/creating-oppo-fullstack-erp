import { type NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/jwt"
import { NotificationService } from "@/lib/services/notification-service"
import type { NotificationType, NotificationCategory, NotificationPriority } from "@/models/notification"

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

    const currentUserId = decoded.userId || decoded.id

    if (!currentUserId) {
      return NextResponse.json({ error: "User ID not found in token" }, { status: 401 })
    }

    const { userId, userIds, title, message, type, category, priority, data, actionUrl, expiresAt } =
      await request.json()

    // Validate required fields
    if (!title || !message || !type || !category) {
      return NextResponse.json({ error: "Missing required fields: title, message, type, category" }, { status: 400 })
    }

    let result

    if (userIds && Array.isArray(userIds)) {
      // Send bulk notification
      result = await NotificationService.sendBulkNotification(userIds, {
        title,
        message,
        type: type as NotificationType,
        category: category as NotificationCategory,
        priority: priority as NotificationPriority,
        data,
        actionUrl,
        expiresAt: expiresAt ? new Date(expiresAt) : undefined,
      })
    } else if (userId) {
      // Send single notification
      const success = await NotificationService.sendNotification({
        userId,
        title,
        message,
        type: type as NotificationType,
        category: category as NotificationCategory,
        priority: priority as NotificationPriority,
        data,
        actionUrl,
        expiresAt: expiresAt ? new Date(expiresAt) : undefined,
      })

      result = { sent: success ? 1 : 0, failed: success ? 0 : 1 }
    } else {
      return NextResponse.json({ error: "Either userId or userIds must be provided" }, { status: 400 })
    }

    return NextResponse.json({
      message: "Notification(s) sent successfully",
      result,
    })
  } catch (error) {
    console.error("Error in POST /api/notifications/send:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to send notification" },
      { status: 500 },
    )
  }
}
