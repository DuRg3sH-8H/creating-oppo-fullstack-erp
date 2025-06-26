import { type NextRequest, NextResponse } from "next/server"
import { resetUserPassword } from "@/lib/db/users"
import { verifyToken } from "@/lib/jwt"
import crypto from "crypto"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
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
    let { newPassword } = body

    // Generate random password if not provided
    if (!newPassword) {
      newPassword = crypto.randomBytes(8).toString("hex")
    }

    const result = await resetUserPassword(params.id, newPassword)

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json({
      message: "Password reset successfully",
      newPassword: newPassword,
    })
  } catch (error: any) {
    console.error("Error resetting password:", error)
    return NextResponse.json({ error: error.message || "Failed to reset password" }, { status: 500 })
  }
}
