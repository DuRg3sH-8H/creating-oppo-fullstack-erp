import { type NextRequest, NextResponse } from "next/server"
import { getSchoolById, updateSchool, deleteSchool } from "@/lib/db/schools"
import { verifyToken } from "@/lib/jwt"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const school = await getSchoolById(id)

    if (!school) {
      return NextResponse.json({ error: "School not found" }, { status: 404 })
    }

    return NextResponse.json({ school })
  } catch (error) {
    console.error("Error fetching school:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    // Verify authentication
    const token = request.cookies.get("auth-token")?.value
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded || decoded.role !== "super-admin") {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 })
    }

    const body = await request.json()

    const updateData = {
      name: body.name,
      address: body.address,
      phone: body.phone,
      email: body.email,
      website: body.website,
      logo: body.logo,
      theme: {
        primary: body.primaryColor,
        secondary: body.secondaryColor,
        accent: body.accentColor,
        background: body.backgroundColor || "#ffffff",
        foreground: body.darkColor,
      },
    }

    const result = await updateSchool(id, updateData)

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "School not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "School updated successfully" })
  } catch (error) {
    console.error("Error updating school:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    // Verify authentication
    const token = request.cookies.get("auth-token")?.value
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded || decoded.role !== "super-admin") {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 })
    }

    // Hard delete from database
    const result = await deleteSchool(id, true) // true for hard delete

    if ('deletedCount' in result && result.deletedCount === 0) {
      return NextResponse.json({ error: "School not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "School permanently deleted" })
  } catch (error) {
    console.error("Error deleting school:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
