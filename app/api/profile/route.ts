import { type NextRequest, NextResponse } from "next/server"
import { getUserById, updateUserProfile } from "@/lib/db/users"
import { verifyToken } from "@/lib/jwt"

export async function GET(request: NextRequest) {
  try {

    // Check for token
    const token = request.cookies.get("auth-token")?.value

    if (!token) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 })
    }

    // Verify token
    const decoded = verifyToken(token)

    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    // Try to get user ID from different fields
    const userId = decoded.userId || decoded.id

    if (!userId) {
      return NextResponse.json({ error: "Invalid token payload" }, { status: 401 })
    }

    // Get user from database
    const user = await getUserById(userId)

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Remove password from response
    const { password, ...userWithoutPassword } = user

    return NextResponse.json({ user: userWithoutPassword })
  } catch (error) {
    console.error("Error in GET /api/profile:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch profile" },
      { status: 500 },
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const token = request.cookies.get("auth-token")?.value

    if (!token) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const userId = decoded.userId || decoded.id
    if (!userId) {
      return NextResponse.json({ error: "Invalid token payload" }, { status: 401 })
    }

    const updates = await request.json()

    const updatedUser = await updateUserProfile(userId, updates)

    if (!updatedUser) {
      return NextResponse.json({ error: "Failed to update profile" }, { status: 500 })
    }

    // Remove password from response
    const { password, ...userWithoutPassword } = updatedUser

    return NextResponse.json({
      message: "Profile updated successfully",
      user: userWithoutPassword,
    })
  } catch (error) {
    console.error("Error in PUT /api/profile:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update profile" },
      { status: 500 },
    )
  }
}
