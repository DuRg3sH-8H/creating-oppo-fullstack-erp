import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { verifyToken } from "@/lib/jwt"
import { findUserById } from "@/lib/db/users"
import clientPromise from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function GET() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("auth-token")

    if (!token) {
      return NextResponse.json({ success: false, message: "Not authenticated" }, { status: 401 })
    }

    const decoded = verifyToken(token.value)
    if (!decoded || typeof decoded !== "object" || !decoded.id) {
      return NextResponse.json({ success: false, message: "Invalid token" }, { status: 401 })
    }

    const user = await findUserById(decoded.id)
    if (!user) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 })
    }

    // Get recent activities directly here
    const client = await clientPromise
    const db = client.db(process.env.MONGODB_DB)

    const activities = await db
      .collection("gamification_activities")
      .find({ userId: new ObjectId(user._id.toString()) })
      .sort({ timestamp: -1 })
      .limit(10)
      .toArray()

    const formattedActivities = activities.map((activity) => ({
      id: activity._id.toString(),
      type: activity.type,
      description: activity.description,
      points: activity.points,
      timestamp: activity.timestamp,
    }))

    return NextResponse.json({
      success: true,
      data: formattedActivities,
    })
  } catch (error) {
    console.error("Recent activities error:", error)
    return NextResponse.json({ success: false, message: "An error occurred" }, { status: 500 })
  }
}
