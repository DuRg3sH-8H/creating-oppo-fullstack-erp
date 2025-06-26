import { type NextRequest, NextResponse } from "next/server"
import { reviewSubmission } from "@/lib/db/iso"
import { verifyToken } from "@/lib/auth-utils"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authResult = await verifyToken(request)
    if (!authResult.success || !authResult.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (authResult.user.role !== "super-admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const data = await request.json()
    const { status, comments } = data

    if (!status || !["approved", "rejected"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 })
    }

    const updatedSubmission = await reviewSubmission(params.id, status, comments, authResult.user.id)

    return NextResponse.json(updatedSubmission)
  } catch (error) {
    console.error("Error reviewing submission:", error)
    return NextResponse.json({ error: "Failed to review submission" }, { status: 500 })
  }
}
