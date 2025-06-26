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
    if (!user || user.role !== "eca") {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 403 })
    }

    const client = await clientPromise
    const db = client.db(process.env.MONGODB_DB)

    // Get ECA stats
    const userId = new ObjectId(user._id)
    const schoolId = new ObjectId(user.schoolId)

    // Count managed clubs (created by this ECA user)
    const managedClubs = await db.collection("clubs").countDocuments({
      createdBy: userId,
      schoolId,
    })

    // Count total members across managed clubs
    const clubIds = await db
      .collection("clubs")
      .find({
        createdBy: userId,
        schoolId,
      })
      .project({ _id: 1 })
      .toArray()

    const clubObjectIds = clubIds.map((club) => club._id)
    const totalMembers = await db.collection("club_registrations").countDocuments({
      clubId: { $in: clubObjectIds },
      status: "approved",
    })

    // Count events created by this ECA user
    const totalEvents = await db.collection("events").countDocuments({
      createdBy: userId,
      schoolId,
    })

    // Count completed events
    const completedEvents = await db.collection("events").countDocuments({
      createdBy: userId,
      schoolId,
      endDate: { $lt: new Date() },
    })

    // Count upcoming events
    const upcomingEvents = await db.collection("events").countDocuments({
      createdBy: userId,
      schoolId,
      startDate: { $gt: new Date() },
    })

    // Calculate student engagement (percentage of students participating in clubs)
    const totalStudents = await db.collection("students").countDocuments({ schoolId })
    const studentEngagement = totalStudents > 0 ? Math.round((totalMembers / totalStudents) * 100) : 0

    // Calculate monthly participation (events created this month)
    const monthStart = new Date()
    monthStart.setDate(1)
    monthStart.setHours(0, 0, 0, 0)

    const monthlyParticipation = await db.collection("events").countDocuments({
      createdBy: userId,
      schoolId,
      createdAt: { $gte: monthStart },
    })

    // Get club details
    const clubDetails = await db
      .collection("clubs")
      .aggregate([
        { $match: { createdBy: userId, schoolId } },
        {
          $lookup: {
            from: "club_registrations",
            localField: "_id",
            foreignField: "clubId",
            as: "registrations",
          },
        },
        {
          $project: {
            name: 1,
            description: 1,
            category: 1,
            memberCount: {
              $size: {
                $filter: {
                  input: "$registrations",
                  cond: { $eq: ["$$this.status", "approved"] },
                },
              },
            },
            status: 1,
            createdAt: 1,
          },
        },
        { $limit: 5 },
      ])
      .toArray()

    return NextResponse.json({
      success: true,
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
          category: club.category,
          memberCount: club.memberCount,
          status: club.status,
          createdAt: club.createdAt,
        })),
      },
    })
  } catch (error) {
    console.error("ECA stats error:", error)
    return NextResponse.json({ success: false, message: "An error occurred" }, { status: 500 })
  }
}
