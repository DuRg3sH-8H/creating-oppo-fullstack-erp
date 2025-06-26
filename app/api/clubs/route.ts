import { type NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/jwt"
import { trackAction } from "@/lib/gamification-tracker"
import { getAllClubs, createClub } from "@/lib/db/clubs"

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("auth-token")?.value
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded || typeof decoded !== "object" || !decoded.id) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const filters = {
      category: searchParams.get("category") || undefined,
      status: searchParams.get("status") || undefined,
      search: searchParams.get("search") || undefined,
    }

    const clubs = await getAllClubs(filters)
    return NextResponse.json({ clubs })
  } catch (error) {
    console.error("Clubs API Error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get("auth-token")?.value
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded || typeof decoded !== "object" || !decoded.id) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    // Only ECA and super-admin can create clubs
    if (!["eca", "super-admin"].includes(decoded.role)) {
      return NextResponse.json({ error: "Unauthorized to create clubs" }, { status: 403 })
    }

    const body = await request.json()

    const club = await createClub({
      ...body,
      createdBy: decoded.id,
      schoolId: decoded.schoolId,
    })

    // Track gamification action
    await trackAction(decoded.id, "club_create", {
      clubId: club.id,
      name: club.name,
      category: club.category,
    })

    return NextResponse.json({ club })
  } catch (error) {
    console.error("Club creation error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 },
    )
  }
}
