import { type NextRequest, NextResponse } from "next/server"
import { addClubActivity, getClubById } from "@/lib/db/clubs"
import { verifyToken } from "@/lib/jwt"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const club = await getClubById(params.id)

    if (!club) {
      return NextResponse.json({ success: false, error: "Club not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: club.activities || [],
    })
  } catch (error) {
    console.error("Error fetching club activities:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch activities" }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Verify authentication using cookies instead of authorization header
    const token = request.cookies.get("auth-token")?.value
    if (!token) {
      return NextResponse.json({ success: false, error: "Authentication required" }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded || decoded.role !== "super-admin") {
      return NextResponse.json({ success: false, error: "Admin access required" }, { status: 403 })
    }

    const body = await request.json()

    // Validate required fields
    if (!body.title || !body.date || !body.description) {
      return NextResponse.json({ success: false, error: "Title, date, and description are required" }, { status: 400 })
    }

    // Generate unique activity ID
    const activityId = `activity-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

    const activityData = {
      id: activityId,
      title: body.title,
      date: body.date,
      description: body.description,
      images: body.images || [],
      minutesUrl: body.minutesUrl || null,
    }

    const success = await addClubActivity(params.id, activityData)

    if (!success) {
      return NextResponse.json({ success: false, error: "Club not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: activityData,
      message: "Activity added successfully",
    })
  } catch (error) {
    console.error("Error adding club activity:", error)
    return NextResponse.json({ success: false, error: "Failed to add activity" }, { status: 500 })
  }
}
