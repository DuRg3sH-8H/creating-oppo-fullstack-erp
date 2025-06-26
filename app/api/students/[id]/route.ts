import { type NextRequest, NextResponse } from "next/server"
import { getStudentById, updateStudent, deleteStudent } from "@/lib/db/students"
import { verifyToken } from "@/lib/jwt"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = request.cookies.get("auth-token")?.value
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const student = await getStudentById(params.id)
    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 })
    }

    // Check if user has access to this student's school
    if (decoded.role !== "school" && student._id !== decoded.schoolId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    return NextResponse.json(student)
  } catch (error) {
    console.error("Error in GET /api/students/[id]:", error)
    return NextResponse.json({ error: "Failed to fetch student" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = request.cookies.get("auth-token")?.value
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const body = await request.json()

    // Get current student to check permissions
    const currentStudent = await getStudentById(params.id)
    if (!currentStudent) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 })
    }

    // Check if user has access to this student's school
    if (decoded.role !== "school" && (currentStudent as any).schoolId !== decoded.schoolId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const student = await updateStudent(params.id, body)
    return NextResponse.json(student)
  } catch (error) {
    console.error("Error in PUT /api/students/[id]:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update student" },
      { status: 500 },
    )
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = request.cookies.get("auth-token")?.value
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    // Get current student to check permissions
    const currentStudent = await getStudentById(params.id)
    if (!currentStudent) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 })
    }

    // Check if user has access to this student's school
    if (decoded.role !== "super_admin" && (currentStudent as any).schoolId !== decoded.schoolId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    await deleteStudent(params.id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in DELETE /api/students/[id]:", error)
    return NextResponse.json({ error: "Failed to delete student" }, { status: 500 })
  }
}
