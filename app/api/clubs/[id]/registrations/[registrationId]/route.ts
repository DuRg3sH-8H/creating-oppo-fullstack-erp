import { type NextRequest, NextResponse } from "next/server"
import { updateSchoolRegistration, removeSchoolRegistration } from "@/lib/db/clubs"
import { cookies } from "next/headers"
import { verifyToken } from "@/lib/jwt"

export async function PUT(request: NextRequest, { params }: { params: { id: string; registrationId: string } }) {
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

    const success = await updateSchoolRegistration(params.id, params.registrationId, body)

    if (!success) {
      return NextResponse.json({ success: false, error: "Club or registration not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: "Registration updated successfully",
    })
  } catch (error) {
    console.error("Error updating registration:", error)
    return NextResponse.json({ success: false, error: "Failed to update registration" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string; registrationId: string } }) {
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

    const success = await removeSchoolRegistration(params.id, params.registrationId)

    if (!success) {
      return NextResponse.json({ success: false, error: "Club or registration not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: "Registration removed successfully",
    })
  } catch (error) {
    console.error("Error removing registration:", error)
    return NextResponse.json({ success: false, error: "Failed to remove registration" }, { status: 500 })
  }
}
