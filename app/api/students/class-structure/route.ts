import { type NextRequest, NextResponse } from "next/server"
import { getClassStructure } from "@/lib/db/students"
import { verifyToken } from "@/lib/jwt"

export async function GET(request: NextRequest) {
  try {

    // Fix: Look for 'auth-token' instead of 'token'
    const token = request.cookies.get("auth-token")?.value
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded || typeof decoded !== "object" || !decoded.id) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const schoolId = searchParams.get("schoolId") || decoded.schoolId

    if (!schoolId) {
      return NextResponse.json({ error: "School ID is required" }, { status: 400 })
    }

    const classes = await getClassStructure(schoolId)

    return NextResponse.json({ classes })
  } catch (error) {
    console.error("Class Structure API Error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 },
    )
  }
}
