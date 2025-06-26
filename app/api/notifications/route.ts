import { type NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/jwt"
import { getUserNotifications, getUnreadCount } from "@/lib/db/notifications"

export async function GET(request: NextRequest) {
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

    const url = new URL(request.url)
    const limit = Number.parseInt(url.searchParams.get("limit") || "20")
    const skip = Number.parseInt(url.searchParams.get("skip") || "0")
    const unreadOnly = url.searchParams.get("unreadOnly") === "true"
    const category = url.searchParams.get("category") || undefined

    const { notifications, total } = await getUserNotifications(userId, {
      limit,
      skip,
      unreadOnly,
      category,
    })

    const unreadCount = await getUnreadCount(userId)

    return NextResponse.json({
      notifications,
      total,
      unreadCount,
      pagination: {
        limit,
        skip,
        hasMore: skip + limit < total,
      },
    })
  } catch (error) {
    console.error("Error in GET /api/notifications:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch notifications" },
      { status: 500 },
    )
  }
}
