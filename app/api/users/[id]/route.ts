import { type NextRequest, NextResponse } from "next/server"
import { findUserById, updateUser, deleteUser } from "@/lib/db/users"
import { verifyToken } from "@/lib/jwt"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Verify authentication
    const token = request.cookies.get("auth-token")?.value
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const decoded = await verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const user = await findUserById(params.id)
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Transform user to match frontend interface
    const transformedUser = {
      id: user._id?.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      schoolId: user.schoolId,
      schoolName: user.schoolName,
      status: user.isActive ? "active" : "inactive",
      lastLogin: user.lastLogin?.toISOString(),
      createdAt: user.createdAt.toISOString(),
      avatar: user.avatar || "/placeholder.svg?height=40&width=40",
    }

    return NextResponse.json({ user: transformedUser })
  } catch (error) {
    console.error("Error fetching user:", error)
    return NextResponse.json({ error: "Failed to fetch user" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Verify authentication
    const token = request.cookies.get("auth-token")?.value
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const decoded = await verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    // Check permissions
    if (decoded.role !== "super-admin") {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 })
    }

    const body = await request.json()
    const { name, email, role, schoolId, schoolName, isActive } = body

    const updateData: any = {}
    if (name) updateData.name = name
    if (email) updateData.email = email.toLowerCase()
    if (role) updateData.role = role
    if (schoolId !== undefined) updateData.schoolId = schoolId
    if (schoolName !== undefined) updateData.schoolName = schoolName
    if (isActive !== undefined) updateData.isActive = isActive

    const result = await updateUser(params.id, updateData)

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "User updated successfully" })
  } catch (error: any) {
    console.error("Error updating user:", error)
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Verify authentication
    const token = request.cookies.get("auth-token")?.value
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const decoded = await verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    // Check permissions
    if (decoded.role !== "super-admin") {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 })
    }

    const result = await deleteUser(params.id)

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "User deleted successfully" })
  } catch (error) {
    console.error("Error deleting user:", error)
    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 })
  }
}
