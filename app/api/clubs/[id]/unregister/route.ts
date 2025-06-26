import { type NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/jwt"
import { connectToDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"
import { unregisterFromClub } from "@/lib/db/events"

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = request.cookies.get("auth-token")?.value

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Get the user's school information
    const { db } = await connectToDatabase()
    const user = await db.collection("users").findOne({ _id: new ObjectId(decoded.userId) })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const schoolId = user.schoolId || decoded.userId

    await unregisterFromClub(params.id, schoolId)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error unregistering from club:", error)
    return NextResponse.json({ error: "Failed to unregister from club" }, { status: 500 })
  }
}
