import { type NextRequest, NextResponse } from "next/server"
import { toggleUserStatus } from "@/lib/db/users"
import { verifyToken } from "@/lib/jwt"

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Verify authentication
    const token = request.cookies.get("auth-token")?.value
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const decoded = await verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    // Check permissions
    if (decoded.role !== "super-admin") {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 })
    }

    const result = await toggleUserStatus(params.id)

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "User status updated successfully" })
  } catch (error: any) {
    console.error("Error toggling user status:", error)
    return NextResponse.json({ error: error.message || "Failed to update user status" }, { status: 500 })
  }
}
