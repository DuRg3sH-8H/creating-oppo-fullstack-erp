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
    if (!user || user.role !== "school") {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 403 })
    }

    const client = await clientPromise
    const db = client.db(process.env.MONGODB_DB)

    // Get school stats
    const schoolId = new ObjectId(user.schoolId)

    // Count students
    const totalStudents = await db.collection("students").countDocuments({ schoolId })

    // Count teachers/staff
    const totalTeachers = await db.collection("users").countDocuments({
      schoolId,
      role: { $in: ["teacher", "staff"] },
    })

    // Count clubs
    const totalClubs = await db.collection("clubs").countDocuments({ schoolId })

    // Count events
    const totalEvents = await db.collection("events").countDocuments({ schoolId })

    // Get ISO progress
    const isoSubmissions = await db.collection("iso_submissions").find({ schoolId }).toArray()
    const totalClauses = await db.collection("iso_clauses").countDocuments()
    const completedSubmissions = isoSubmissions.filter((sub) => sub.status === "approved").length
    const isoProgress = totalClauses > 0 ? Math.round((completedSubmissions / totalClauses) * 100) : 0

    // Count documents
    const documentCount = await db.collection("documents").countDocuments({ schoolId })

    // Get recent activities
    const recentActivities = await db
      .collection("gamification_activities")
      .find({ userId: new ObjectId(user._id) })
      .sort({ timestamp: -1 })
      .limit(5)
      .toArray()

    return NextResponse.json({
      success: true,
      data: {
        totalStudents,
        totalTeachers,
        totalClubs,
        totalEvents,
        isoProgress,
        documentCount,
        recentActivities: recentActivities.map((activity) => ({
          id: activity._id.toString(),
          type: activity.type,
          description: activity.description,
          points: activity.points,
          timestamp: activity.timestamp,
        })),
      },
    })
  } catch (error) {
    console.error("School admin stats error:", error)
    return NextResponse.json({ success: false, message: "An error occurred" }, { status: 500 })
  }
}
