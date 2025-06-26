import { type NextRequest, NextResponse } from "next/server"
import { updateClause, deleteClause } from "@/lib/db/iso"
import { verifyToken } from "@/lib/auth-utils"

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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
    const { number, title, description, requirements } = data

    if (!number || !title || !description || !requirements) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const updatedClause = await updateClause(id, { number, title, description, requirements })
    return NextResponse.json(updatedClause)
  } catch (error) {
    console.error("Error updating clause:", error)
    return NextResponse.json(
      {
        error: "Failed to update clause",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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

    await deleteClause(id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting clause:", error)
    return NextResponse.json(
      {
        error: "Failed to delete clause",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
