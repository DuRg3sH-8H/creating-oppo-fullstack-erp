import { type NextRequest, NextResponse } from "next/server"
import { createClause, getClauses } from "@/lib/db/iso"
import { verifyToken } from "@/lib/auth-utils"

/**
 * API route to handle ISO clauses.
 * - GET: Fetch all clauses
 * - POST: Create a new clause (only accessible by super-admin)
 */

export async function GET(request: NextRequest) {
  try {

    const authResult = await verifyToken(request)

    if (!authResult.success || !authResult.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const result = await getClauses()

    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to fetch clauses",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}


export async function POST(request: NextRequest) {
  try {
    const authResult = await verifyToken(request)
    if (!authResult.success || !authResult.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (authResult.user.role !== "super-admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const data = await request.json()
    const { number, title, description, requirements } = data

    if (!number || !title || !description || !requirements) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const clause = await createClause({ number, title, description, requirements }, authResult.user.id)

    return NextResponse.json(clause, { status: 201 })
  } catch (error: any) {
    console.error("Error creating clause:", error)

    if (error.code === 11000) {
      return NextResponse.json({ error: "Clause number already exists" }, { status: 409 })
    }

    return NextResponse.json({ error: "Failed to create clause" }, { status: 500 })
  }
}
