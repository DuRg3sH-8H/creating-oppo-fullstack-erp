import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { verifyToken } from "@/lib/jwt"
import { findUserById } from "@/lib/db/users"
import { getDashboardStats } from "@/lib/db/dashboard"
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

    if (user.role === "super-admin") {
      // Super Admin Stats - use existing function
      const stats = await getDashboardStats(user.role, user.schoolId)
      return NextResponse.json({
        success: true,
        stats,
        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
          schoolId: user.schoolId,
          schoolName: user.schoolName,
        },
      })
    }

    const client = await clientPromise
    const db = client.db(process.env.MONGODB_DB)

    if (user.role === "school") {
      // School Admin Stats
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
        role: "school",
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
    } else if (user.role === "eca") {
      // ECA Stats
      const userId = new ObjectId(user._id)
      const schoolId = new ObjectId(user.schoolId)

      // Count managed clubs
      const managedClubs = await db.collection("clubs").countDocuments({
        createdBy: userId,
        schoolId,
      })

      // Get club details
      const clubDetails = await db
        .collection("clubs")
        .find({
          createdBy: userId,
          schoolId,
        })
        .toArray()

      // Count total members across all managed clubs
      const clubIds = clubDetails.map((club) => club._id)
      const totalMembers = await db.collection("club_registrations").countDocuments({
        clubId: { $in: clubIds },
        status: "approved",
      })

      // Count events created by ECA
      const totalEvents = await db.collection("events").countDocuments({
        createdBy: userId,
        schoolId,
      })

      // Count completed and upcoming events
      const now = new Date()
      const completedEvents = await db.collection("events").countDocuments({
        createdBy: userId,
        schoolId,
        endDate: { $lt: now },
      })

      const upcomingEvents = await db.collection("events").countDocuments({
        createdBy: userId,
        schoolId,
        startDate: { $gt: now },
      })

      // Calculate student engagement (percentage of students participating in clubs)
      const totalSchoolStudents = await db.collection("students").countDocuments({ schoolId })
      const studentEngagement = totalSchoolStudents > 0 ? Math.round((totalMembers / totalSchoolStudents) * 100) : 0

      // Monthly participation (events created this month)
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      const monthlyParticipation = await db.collection("events").countDocuments({
        createdBy: userId,
        schoolId,
        createdAt: { $gte: startOfMonth },
      })

      return NextResponse.json({
        success: true,
        role: "eca",
        data: {
          managedClubs,
          totalMembers,
          totalEvents,
          completedEvents,
          upcomingEvents,
          studentEngagement,
          monthlyParticipation,
          clubDetails: clubDetails.map((club) => ({
            id: club._id.toString(),
            name: club.name,
            description: club.description,
            memberCount: 0, // Will be populated separately if needed
            category: club.category,
            status: club.status,
          })),
        },
      })
    } else {
      return NextResponse.json({ success: false, message: "Unauthorized role" }, { status: 403 })
    }
  } catch (error) {
    console.error("Dashboard stats error:", error)
    return NextResponse.json({ success: false, message: "An error occurred" }, { status: 500 })
  }
}
