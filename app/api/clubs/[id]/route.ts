import { type NextRequest, NextResponse } from "next/server"
import { getClubById, updateClub, deleteClub } from "@/lib/db/clubs"
import { cookies } from "next/headers"
import { verifyToken } from "@/lib/jwt"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const club = await getClubById(params.id)

    if (!club) {
      return NextResponse.json({ success: false, error: "Club not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: club,
    })
  } catch (error) {
    console.error("Error fetching club:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch club" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
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
    const updatedClub = await updateClub(params.id, body)

    if (!updatedClub) {
      return NextResponse.json({ success: false, error: "Club not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: updatedClub,
      message: "Club updated successfully",
    })
  } catch (error) {
    console.error("Error updating club:", error)
    return NextResponse.json({ success: false, error: "Failed to update club" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
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

    const success = await deleteClub(params.id)

    if (!success) {
      return NextResponse.json({ success: false, error: "Club not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: "Club deleted successfully",
    })
  } catch (error) {
    console.error("Error deleting club:", error)
    return NextResponse.json({ success: false, error: "Failed to delete club" }, { status: 500 })
  }
}
