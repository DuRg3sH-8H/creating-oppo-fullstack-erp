import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { getClubById } from "@/lib/db/clubs"
import { verifyToken } from "@/lib/jwt"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Get auth token from cookies
    const cookieStore = await cookies()
    const token = cookieStore.get("auth-token")?.value

    if (!token) {
      return NextResponse.json({ success: false, error: "Authentication required" }, { status: 401 })
    }

    // Verify token
    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ success: false, error: "Invalid token" }, { status: 401 })
    }

    // Check if user has permission (super-admin or school-admin)
    if (decoded.role !== "super-admin" && decoded.role !== "school") {
      return NextResponse.json({ success: false, error: "Admin access required" }, { status: 403 })
    }

    const club = await getClubById(params.id)

    if (!club) {
      return NextResponse.json({ success: false, error: "Club not found" }, { status: 404 })
    }

    // Return registrations
    return NextResponse.json({
      success: true,
      data: club.registrations || [],
    })
  } catch (error) {
    console.error("Error fetching club registrations:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch registrations" }, { status: 500 })
  }
}
