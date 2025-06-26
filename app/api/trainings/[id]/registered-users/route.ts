import { type NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/utils/auth"
import { getTrainingRegisteredUsers } from "@/utils/training"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  try {
    // Verify authentication
    const authResult = await verifyToken(request)
    if (!authResult.success) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Only super-admin can view registered users
    if (!authResult.user || authResult.user.role !== "super-admin") {
      return NextResponse.json({ error: "Access denied. Super-admin role required." }, { status: 403 })
    }

    const users = await getTrainingRegisteredUsers(id)

    return NextResponse.json({
      success: true,
      users,
      count: users.length,
    })
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
