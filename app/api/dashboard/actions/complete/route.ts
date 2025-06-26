import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { verifyToken } from "@/lib/jwt"
import { findUserById } from "@/lib/db/users"
import clientPromise from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function POST(request: Request) {
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

    const { actionType, metadata } = await request.json()

    if (!actionType) {
      return NextResponse.json({ success: false, message: "Action type is required" }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db(process.env.MONGODB_DB)
    const userId = new ObjectId(user._id)
    const schoolId = new ObjectId(user.schoolId)

    let actionResult = null

    switch (actionType) {
      case "student_add":
        // Create a sample student record (in real implementation, this would be a proper student creation)
        actionResult = await db.collection("students").insertOne({
          name: `Sample Student ${Date.now()}`,
          email: `student${Date.now()}@example.com`,
          schoolId,
          class: "10",
          section: "A",
          createdBy: userId,
          createdAt: new Date(),
        })
        break

      case "document_upload":
        // Create a sample document record
        actionResult = await db.collection("documents").insertOne({
          title: `Document ${Date.now()}`,
          description: "Sample document uploaded via quick action",
          type: "general",
          schoolId,
          uploadedBy: userId,
          createdAt: new Date(),
          size: 1024,
          mimeType: "application/pdf",
        })
        break

      case "event_create":
        // Create a sample event
        actionResult = await db.collection("events").insertOne({
          title: `Event ${Date.now()}`,
          description: "Sample event created via quick action",
          startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
          endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000), // 2 hours duration
          location: "School Campus",
          schoolId,
          createdBy: userId,
          createdAt: new Date(),
        })
        break

      case "iso_submission":
        // Create a sample ISO submission
        const isoClauses = await db.collection("iso_clauses").find().limit(1).toArray()
        if (isoClauses.length > 0) {
          actionResult = await db.collection("iso_submissions").insertOne({
            clauseId: isoClauses[0]._id,
            schoolId,
            submittedBy: userId,
            status: "pending",
            documents: [],
            submittedAt: new Date(),
          })
        }
        break

      case "club_create":
        // Create a sample club (for ECA users)
        actionResult = await db.collection("clubs").insertOne({
          name: `Club ${Date.now()}`,
          description: "Sample club created via quick action",
          category: "Academic",
          schoolId,
          createdBy: userId,
          createdAt: new Date(),
          isActive: true,
        })
        break

      case "attendance_record":
        // Record sample attendance
        actionResult = { acknowledged: true, insertedId: new ObjectId() }
        break

      case "student_recognition":
        // Award student recognition
        actionResult = { acknowledged: true, insertedId: new ObjectId() }
        break

      default:
        return NextResponse.json({ success: false, message: "Unknown action type" }, { status: 400 })
    }

    if (!actionResult?.acknowledged) {
      return NextResponse.json({ success: false, message: "Failed to complete action" }, { status: 500 })
    }

    // Get points for this action
    const points = getTaskPoints(actionType)

    // Add points to user gamification
    await db.collection("user_gamification").updateOne(
      { userId: new ObjectId(user._id) },
      {
        $inc: { totalPoints: points },
        $set: { lastActivity: new Date(), updatedAt: new Date() },
      },
      { upsert: true },
    )

    // Log the activity
    await db.collection("gamification_activities").insertOne({
      userId: new ObjectId(user._id),
      type: actionType,
      description: getTaskDescription(actionType),
      points,
      metadata: metadata || {},
      timestamp: new Date(),
    })

    // Update achievements and challenges
    await updateUserAchievements(db, user._id.toString(), actionType)
    await updateUserChallenges(db, user._id.toString(), actionType)

    return NextResponse.json({
      success: true,
      points,
      message: `Action completed! +${points} points earned.`,
      actionResult: {
        id: actionResult.insertedId?.toString(),
        type: actionType,
      },
    })
  } catch (error) {
    console.error("Complete action error:", error)
    return NextResponse.json({ success: false, message: "An error occurred" }, { status: 500 })
  }
}

function getTaskPoints(taskType: string): number {
  const pointsMap: Record<string, number> = {
    daily_login: 10,
    student_add: 25,
    document_upload: 15,
    training_complete: 50,
    event_create: 30,
    iso_submission: 40,
    club_create: 35,
    club_join: 20,
    message_send: 5,
    profile_edit: 10,
    attendance_record: 15,
    recognition_award: 25,
  }

  return pointsMap[taskType] || 10
}

function getTaskDescription(taskType: string): string {
  const descriptions: Record<string, string> = {
    daily_login: "Daily login completed",
    student_add: "Added a new student",
    document_upload: "Uploaded a document",
    training_complete: "Completed a training",
    event_create: "Created an event",
    iso_submission: "Submitted ISO documentation",
    club_create: "Created a new club",
    club_join: "Joined a club",
    message_send: "Sent a message",
    profile_edit: "Updated profile",
    attendance_record: "Recorded attendance",
    recognition_award: "Awarded student recognition",
  }

  return descriptions[taskType] || "Completed a task"
}

async function updateUserAchievements(db: any, userId: string, taskType: string) {
  // Update relevant achievements based on task type
  const achievementUpdates: Record<string, string[]> = {
    student_add: ["student_add_10"],
    document_upload: ["document_master"],
    training_complete: ["training_organizer"],
    event_create: ["event_master"],
    iso_submission: ["iso_compliance"],
    club_create: ["club_creator"],
  }

  const relevantAchievements = achievementUpdates[taskType] || []

  for (const achievementId of relevantAchievements) {
    await db
      .collection("user_achievements")
      .updateOne({ userId: new ObjectId(userId), achievementId }, { $inc: { progress: 1 } }, { upsert: true })

    // Check if achievement is completed
    const achievement = await db.collection("user_achievements").findOne({
      userId: new ObjectId(userId),
      achievementId,
    })

    if (achievement && !achievement.completed) {
      const target = getAchievementTarget(achievementId)
      if (achievement.progress >= target) {
        await db.collection("user_achievements").updateOne(
          { userId: new ObjectId(userId), achievementId },
          {
            $set: {
              completed: true,
              completedAt: new Date(),
            },
          },
        )

        // Award achievement points
        const achievementPoints = getAchievementPoints(achievementId)
        await db
          .collection("user_gamification")
          .updateOne({ userId: new ObjectId(userId) }, { $inc: { totalPoints: achievementPoints } })
      }
    }
  }
}

async function updateUserChallenges(db: any, userId: string, taskType: string) {
  // Update relevant challenges based on task type
  const challengeUpdates: Record<string, string[]> = {
    daily_login: ["daily_login"],
    document_upload: ["weekly_documents"],
    event_create: ["weekly_events"],
    iso_submission: ["monthly_iso"],
  }

  const relevantChallenges = challengeUpdates[taskType] || []

  for (const challengeId of relevantChallenges) {
    await db.collection("user_challenges").updateOne(
      {
        userId: new ObjectId(userId),
        challengeId,
        deadline: { $gt: new Date() },
      },
      { $inc: { progress: 1 } },
      { upsert: true },
    )

    // Check if challenge is completed
    const challenge = await db.collection("user_challenges").findOne({
      userId: new ObjectId(userId),
      challengeId,
      deadline: { $gt: new Date() },
    })

    if (challenge && !challenge.completed) {
      const target = getChallengeTarget(challengeId)
      if (challenge.progress >= target) {
        await db.collection("user_challenges").updateOne(
          { userId: new ObjectId(userId), challengeId },
          {
            $set: {
              completed: true,
              completedAt: new Date(),
            },
          },
        )

        // Award challenge points
        const challengePoints = getChallengePoints(challengeId)
        await db
          .collection("user_gamification")
          .updateOne({ userId: new ObjectId(userId) }, { $inc: { totalPoints: challengePoints } })
      }
    }
  }
}

function getAchievementTarget(achievementId: string): number {
  const targets: Record<string, number> = {
    student_add_10: 10,
    document_master: 20,
    training_organizer: 5,
    event_master: 10,
    iso_compliance: 1,
    club_creator: 3,
  }

  return targets[achievementId] || 1
}

function getAchievementPoints(achievementId: string): number {
  const points: Record<string, number> = {
    student_add_10: 200,
    document_master: 150,
    training_organizer: 300,
    event_master: 400,
    iso_compliance: 500,
    club_creator: 250,
  }

  return points[achievementId] || 100
}

function getChallengeTarget(challengeId: string): number {
  const targets: Record<string, number> = {
    daily_login: 7,
    weekly_documents: 5,
    weekly_events: 2,
    monthly_iso: 3,
    monthly_engagement: 50,
  }

  return targets[challengeId] || 1
}

function getChallengePoints(challengeId: string): number {
  const points: Record<string, number> = {
    daily_login: 100,
    weekly_documents: 150,
    weekly_events: 200,
    monthly_iso: 300,
    monthly_engagement: 400,
  }

  return points[challengeId] || 50
}
