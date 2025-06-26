import clientPromise from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export interface GamificationAction {
  userId: string
  actionType: string
  points: number
  metadata?: any
}

export async function trackGamificationAction(action: GamificationAction): Promise<void> {
  try {
    const client = await clientPromise
    const db = client.db(process.env.MONGODB_DB)

    const { userId, actionType, points, metadata } = action

    // Add points to user's total
    await db.collection("user_gamification").updateOne(
      { userId: new ObjectId(userId) },
      {
        $inc: { totalPoints: points },
        $set: { lastActivity: new Date(), updatedAt: new Date() },
      },
      { upsert: true },
    )

    // Log the activity
    await db.collection("gamification_activities").insertOne({
      userId: new ObjectId(userId),
      type: actionType,
      description: getActionDescription(actionType),
      points,
      metadata,
      timestamp: new Date(),
    })

    // Update achievements and challenges
    await updateUserProgress(userId, actionType, metadata)

  } catch (error) {
    console.error("❌ Error tracking gamification action:", error)
    // Don't throw error to avoid breaking the main functionality
  }
}

function getActionDescription(actionType: string): string {
  const descriptions: Record<string, string> = {
    student_add: "Added a new student",
    student_edit: "Updated student information",
    document_download: "Downloaded a document",
    event_attend: "Attended an event",
    event_register: "Registered for an event",
    club_join: "Joined a club",
    club_register: "Registered school for a club",
    iso_submission: "Submitted ISO documentation",
    recognition_give: "Gave student recognition",
    message_send: "Sent a message",
    profile_update: "Updated profile",
    daily_login: "Daily login completed",
  }

  return descriptions[actionType] || "Completed an action"
}

function getActionPoints(actionType: string): number {
  const pointsMap: Record<string, number> = {
    student_add: 25,
    student_edit: 10,
    document_download: 5,
    event_attend: 25,
    event_register: 15,
    club_join: 20,
    club_register: 30,
    iso_submission: 40,
    recognition_give: 15,
    message_send: 5,
    profile_update: 10,
    daily_login: 10,
  }

  return pointsMap[actionType] || 10
}

async function updateUserProgress(userId: string, actionType: string, metadata?: any) {
  const client = await clientPromise
  const db = client.db(process.env.MONGODB_DB)

  // Update relevant achievements
  const achievementUpdates: Record<string, string[]> = {
    student_add: ["student_manager"],
    student_edit: ["student_manager"],
    document_download: ["resource_downloader", "resource_user"],
    event_attend: ["event_participant", "event_attendee"],
    iso_submission: ["iso_compliance"],
    club_join: ["club_joiner"],
    recognition_give: ["recognition_giver"],
  }

  const relevantAchievements = achievementUpdates[actionType] || []

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
              claimed: true, // Auto-claim
              completedAt: new Date(),
              claimedAt: new Date(),
            },
          },
        )

        // Award achievement bonus points
        const bonusPoints = getAchievementPoints(achievementId)
        await db
          .collection("user_gamification")
          .updateOne({ userId: new ObjectId(userId) }, { $inc: { totalPoints: bonusPoints } })

      }
    }
  }

  // Update relevant challenges
  const challengeUpdates: Record<string, string[]> = {
    daily_login: ["daily_login"],
    document_download: ["weekly_downloads"],
    event_attend: ["weekly_participation"],
    iso_submission: ["monthly_iso"],
    recognition_give: ["monthly_recognition"],
  }

  const relevantChallenges = challengeUpdates[actionType] || []

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

        // Award challenge bonus points
        const bonusPoints = getChallengePoints(challengeId)
        await db
          .collection("user_gamification")
          .updateOne({ userId: new ObjectId(userId) }, { $inc: { totalPoints: bonusPoints } })

      }
    }
  }
}

function getAchievementTarget(achievementId: string): number {
  const targets: Record<string, number> = {
    student_manager: 10,
    resource_downloader: 20,
    resource_user: 15,
    event_participant: 5,
    event_attendee: 10,
    iso_compliance: 10,
    club_joiner: 3,
    recognition_giver: 20,
  }
  return targets[achievementId] || 1
}

function getAchievementPoints(achievementId: string): number {
  const points: Record<string, number> = {
    student_manager: 200,
    resource_downloader: 150,
    resource_user: 100,
    event_participant: 250,
    event_attendee: 300,
    iso_compliance: 500,
    club_joiner: 200,
    recognition_giver: 400,
  }
  return points[achievementId] || 100
}

function getChallengeTarget(challengeId: string): number {
  const targets: Record<string, number> = {
    daily_login: 7,
    weekly_downloads: 5,
    weekly_participation: 2,
    monthly_iso: 3,
    monthly_recognition: 10,
  }
  return targets[challengeId] || 1
}

function getChallengePoints(challengeId: string): number {
  const points: Record<string, number> = {
    daily_login: 100,
    weekly_downloads: 75,
    weekly_participation: 150,
    monthly_iso: 300,
    monthly_recognition: 200,
  }
  return points[challengeId] || 50
}

// Helper function to easily track actions from API routes
export async function trackAction(userId: string, actionType: string, metadata?: any): Promise<void> {
  const points = getActionPoints(actionType)
  await trackGamificationAction({
    userId,
    actionType,
    points,
    metadata,
  })
}
