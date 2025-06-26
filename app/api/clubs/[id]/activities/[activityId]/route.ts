import { type NextRequest, NextResponse } from "next/server"
import { updateClubActivity, deleteClubActivity } from "@/lib/db/clubs"
import { cookies } from "next/headers"
import { verifyToken } from "@/lib/jwt"

export async function PUT(request: NextRequest, { params }: { params: { id: string; activityId: string } }) {
  try {
    // Get auth token from cookies
    const cookieStore = await cookies()
    const authToken = cookieStore.get("auth-token")?.value

    if (!authToken) {
      return NextResponse.json({ success: false, error: "Authentication required" }, { status: 401 })
    }

    const decoded = verifyToken(authToken)
    if (!decoded || decoded.role !== "super-admin") {
      return NextResponse.json({ success: false, error: "Admin access required" }, { status: 403 })
    }

    const body = await request.json()

    const success = await updateClubActivity(params.id, params.activityId, body)

    if (!success) {
      return NextResponse.json({ success: false, error: "Club or activity not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: "Activity updated successfully",
    })
  } catch (error) {
    console.error("Error updating club activity:", error)
    return NextResponse.json({ success: false, error: "Failed to update activity" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string; activityId: string } }) {
  try {
    // Get auth token from cookies
    const cookieStore = await cookies()
    const authToken = cookieStore.get("auth-token")?.value

    if (!authToken) {
      return NextResponse.json({ success: false, error: "Authentication required" }, { status: 401 })
    }

    const decoded = verifyToken(authToken)
    if (!decoded || decoded.role !== "super-admin") {
      return NextResponse.json({ success: false, error: "Admin access required" }, { status: 403 })
    }

    const success = await deleteClubActivity(params.id, params.activityId)

    if (!success) {
      return NextResponse.json({ success: false, error: "Club or activity not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: "Activity deleted successfully",
    })
  } catch (error) {
    console.error("Error deleting club activity:", error)
    return NextResponse.json({ success: false, error: "Failed to delete activity" }, { status: 500 })
  }
}
