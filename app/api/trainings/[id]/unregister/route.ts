import { type NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/auth-utils"
import { unregisterFromTraining } from "@/lib/db/trainings"

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  try {
    // Verify authentication
    const authResult = await verifyToken(request)
    if (!authResult.success) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Only school and eca users can unregister
    if (!authResult.user || !["school", "eca"].includes(authResult.user.role)) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }


    const result = await unregisterFromTraining(id, authResult.user.id)

    if (!result) {
      return NextResponse.json({ error: "Unregistration failed" }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
