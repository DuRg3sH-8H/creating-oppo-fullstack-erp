import { type NextRequest, NextResponse } from "next/server"
import { getStudents, createStudent } from "@/lib/db/students"
import { verifyToken } from "@/lib/jwt"
import { trackAction } from "@/lib/gamification-tracker"

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

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const schoolId = searchParams.get("schoolId") || decoded.schoolId
    const filters = {
      class: searchParams.get("class") || undefined,
      section: searchParams.get("section") || undefined,
      status: searchParams.get("status") || undefined,
      search: searchParams.get("search") || undefined,
    }

    if (!schoolId) {
      return NextResponse.json({ error: "School ID is required" }, { status: 400 })
    }

    const students = await getStudents(schoolId, filters)

    return NextResponse.json({ students })
  } catch (error) {
    console.error("Students API Error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // Fix: Look for 'auth-token' instead of 'token'
    const token = request.cookies.get("auth-token")?.value
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded || typeof decoded !== "object" || !decoded.id || decoded.role !== "school") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()

    const student = await createStudent({
      ...body,
      schoolId: decoded.schoolId,
    })

    // Track gamification action
    await trackAction(decoded.id, "student_add", {
      studentId: student._id,
      studentName: student.name,
      class: student.class,
      section: student.section,
    })

    return NextResponse.json({ student })
  } catch (error) {
    console.error("Students API Error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 },
    )
  }
}
