import { connectToDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

/**
 * Add feedback for a training
 */
export async function addTrainingFeedback(
  trainingId: string,
  userId: string,
  feedback: string,
  rating: number,
): Promise<boolean> {
  try {

    const { db } = await connectToDatabase()

    // Verify training exists
    const training = await db.collection("trainings").findOne({ _id: new ObjectId(trainingId) })
    if (!training) {
      return false
    }

    // Add feedback to training
    const feedbackData = {
      userId,
      feedback,
      rating,
      submittedAt: new Date().toISOString(),
    }

    const result = await db.collection("trainings").updateOne(
      { _id: new ObjectId(trainingId) },
      {
        $push: {
          feedback: feedbackData as any,
        },
      },
    )

    return result.modifiedCount > 0
  } catch (error) {
    console.error("❌ Error adding training feedback:", error)
    return false
  }
}

/**
 * Get all feedback for a training
 */
export async function getTrainingFeedback(trainingId: string): Promise<any[]> {
  try {

    const { db } = await connectToDatabase()

    // Get training with feedback
    const training = await db
      .collection("trainings")
      .findOne({ _id: new ObjectId(trainingId) }, { projection: { feedback: 1 } })

    if (!training) {
      return []
    }

    const feedback = training.feedback || []

    // Enrich feedback with user information
    const enrichedFeedback = []

    for (const item of feedback) {
      try {
        // Get user details
        const user = await db
          .collection("users")
          .findOne({ _id: new ObjectId(item.userId) }, { projection: { name: 1, email: 1, role: 1, schoolId: 1 } })

        let schoolName = null
        if (user?.schoolId) {
          const school = await db
            .collection("schools")
            .findOne({ _id: new ObjectId(user.schoolId) }, { projection: { name: 1 } })
          schoolName = school?.name
        }

        enrichedFeedback.push({
          ...item,
          user: {
            id: user?._id?.toString(),
            name: user?.name || "Unknown User",
            email: user?.email || "",
            role: user?.role || "unknown",
            schoolName,
          },
        })
      } catch (userError) {
        console.error("❌ Error enriching feedback with user data:", userError)
        // Add feedback without user enrichment
        enrichedFeedback.push({
          ...item,
          user: {
            id: item.userId,
            name: "Unknown User",
            email: "",
            role: "unknown",
            schoolName: null,
          },
        })
      }
    }

    return enrichedFeedback
  } catch (error) {
    console.error("❌ Error getting training feedback:", error)
    return []
  }
}

/**
 * Get registered users for a training with full details
 */
export async function getTrainingRegisteredUsers(trainingId: string): Promise<any[]> {
  try {

    const { db } = await connectToDatabase()

    // Get training with registered users
    const training = await db
      .collection("trainings")
      .findOne({ _id: new ObjectId(trainingId) }, { projection: { registeredUsers: 1, registrationHistory: 1 } })

    if (!training) {
      return []
    }

    const registeredUserIds = training.registeredUsers || []
    const registrationHistory = training.registrationHistory || []

    // Get user details for each registered user
    const enrichedUsers = []

    for (let i = 0; i < registeredUserIds.length; i++) {
      const userId = registeredUserIds[i]

      try {
        // Get user details
        const user = await db
          .collection("users")
          .findOne({ _id: new ObjectId(userId) }, { projection: { name: 1, email: 1, role: 1, schoolId: 1 } })

        if (!user) {
          continue
        }

        // Get school name if user has schoolId
        let schoolName = null
        if (user.schoolId) {
          const school = await db
            .collection("schools")
            .findOne({ _id: new ObjectId(user.schoolId) }, { projection: { name: 1 } })
          schoolName = school?.name || "Unknown School"
        }

        // Find registration timestamp from history
        const registrationRecord = registrationHistory.find((record: any) => record.userId === userId)

        enrichedUsers.push({
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
          schoolName,
          registeredAt: registrationRecord?.registeredAt || new Date().toISOString(),
          registrationOrder: i + 1,
        })
      } catch (userError) {
        console.error("❌ Error getting user details:", userError)
      }
    }

    // Sort by registration order (earliest first)
    enrichedUsers.sort((a, b) => new Date(a.registeredAt).getTime() - new Date(b.registeredAt).getTime())

    // Update registration order after sorting
    enrichedUsers.forEach((user, index) => {
      user.registrationOrder = index + 1
    })

    return enrichedUsers
  } catch (error) {
    console.error("❌ Error getting registered users:", error)
    return []
  }
}
