import { type NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/jwt"
import { trackAction } from "@/lib/gamification-tracker"
import { createEvent, getEvents } from "@/lib/db/events"

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("auth-token")?.value
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded || typeof decoded !== "object" || !decoded.id) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const schoolId = searchParams.get("schoolId") || decoded.schoolId

    const events = await getEvents(schoolId)
    return NextResponse.json({ events })
  } catch (error) {
    console.error("Events API Error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get("auth-token")?.value
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded || typeof decoded !== "object" || !decoded.id) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const body = await request.json()

    const event = await createEvent({
      ...body,
      createdBy: decoded.id,
      schoolId: decoded.schoolId,
    })

    // Track gamification action
    await trackAction(decoded.id, "event_create", {
      eventId: event.id,
      title: event.title,
      type: event.type,
      startDate: event.startDate,
    })

    return NextResponse.json({ event })
  } catch (error) {
    console.error("Event creation error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 },
    )
  }
}
