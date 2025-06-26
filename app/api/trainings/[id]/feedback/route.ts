import { type NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/utils/auth"
import { addTrainingFeedback, getTrainingFeedback } from "@/utils/training"

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  try {
    // Verify authentication
    const authResult = await verifyToken(request)
    if (!authResult.success || !authResult.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Only school and eca users can submit feedback
    if (!["school", "eca"].includes(authResult.user.role)) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }

    const body = await request.json()
    const { feedback, rating } = body

    if (!feedback || !rating) {
      return NextResponse.json({ error: "Feedback and rating are required" }, { status: 400 })
    }


    const result = await addTrainingFeedback(id, authResult.user.id, feedback, rating)

    if (!result) {
      return NextResponse.json({ error: "Failed to submit feedback" }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  try {
    // Verify authentication
    const authResult = await verifyToken(request)
    if (!authResult.success || !authResult.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }


    const feedback = await getTrainingFeedback(id)

    return NextResponse.json({
      success: true,
      feedback,
    })
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
