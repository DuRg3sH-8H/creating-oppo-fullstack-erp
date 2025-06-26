import { type NextRequest, NextResponse } from "next/server"
import { toggleSchoolStatus } from "@/lib/db/schools"
import { verifyToken } from "@/lib/jwt"

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    // Verify authentication
    const token = request.cookies.get("auth-token")?.value
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded || decoded.role !== "super-admin") {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 })
    }

    const result = await toggleSchoolStatus(id)

    if (!result.success) {
      return NextResponse.json({ error: result.error || "School not found" }, { status: 404 })
    }

    return NextResponse.json({
      message: `School ${result.isActive ? "activated" : "deactivated"} successfully`,
      isActive: result.isActive,
    })
  } catch (error) {
    console.error("Error toggling school status:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
