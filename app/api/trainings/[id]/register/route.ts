import { type NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/auth-utils"
import { registerForTraining } from "@/lib/db/trainings"
import { trackAction } from "@/lib/gamification-tracker"

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  try {
    // Verify authentication
    const authResult = await verifyToken(request)
    if (!authResult.success || !authResult.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Only school and eca users can register
    if (!["school", "eca"].includes(authResult.user.role)) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }

    const result = await registerForTraining(id, authResult.user.id)

    if (!result) {
      return NextResponse.json({ error: "Registration failed" }, { status: 400 })
    }

    // Track gamification action
    await trackAction(authResult.user.id, "training_register", {
      trainingId: id,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
