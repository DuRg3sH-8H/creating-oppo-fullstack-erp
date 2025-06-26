import { type NextRequest, NextResponse } from "next/server"
import { addGuidelinesToClause } from "@/lib/db/iso"
import { verifyToken } from "@/lib/auth-utils"

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authResult = await verifyToken(request)
    if (!authResult.success || !authResult.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (authResult.user.role !== "super-admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Await params as required by Next.js 15
    const { id } = await params

    const data = await request.json()
    const { guidelines } = data

    if (!guidelines) {
      return NextResponse.json({ error: "Missing guidelines" }, { status: 400 })
    }



    const updatedClause = await addGuidelinesToClause(id, guidelines)
    return NextResponse.json(updatedClause)
  } catch (error) {
    console.error("Error adding guidelines:", error)
    return NextResponse.json(
      {
        error: "Failed to add guidelines",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
