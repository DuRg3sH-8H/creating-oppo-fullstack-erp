import clientPromise from "../mongodb"
import { ObjectId } from "mongodb"
import type { Notification, NotificationTemplate, NotificationPreferences } from "@/models/notification"

async function getNotificationsCollection() {
  const client = await clientPromise
  const db = client.db(process.env.MONGODB_DB || "school_erp")
  // Remove the generic type to allow querying with ObjectId
  return db.collection("notifications")
}

async function getTemplatesCollection() {
  const client = await clientPromise
  const db = client.db(process.env.MONGODB_DB || "school_erp")
  return db.collection<NotificationTemplate>("notification_templates")
}

async function getUsersCollection() {
  const client = await clientPromise
  const db = client.db(process.env.MONGODB_DB || "school_erp")
  return db.collection("users")
}

// Notification CRUD operations
export async function createNotification(notificationData: Omit<Notification, "_id" | "createdAt">): Promise<string> {
  try {
    const collection = await getNotificationsCollection()

    // Remove _id if present to avoid type conflict with MongoDB's ObjectId
    const { _id, ...rest } = notificationData as any
    const notification: Omit<Notification, "_id"> = {
      ...rest,
      createdAt: new Date(),
    }

    const result = await collection.insertOne(notification)
    return result.insertedId.toString()
  } catch (error) {
    console.error("Error creating notification:", error)
    throw error
  }
}

export async function getUserNotifications(
  userId: string,
  options?: {
    limit?: number
    skip?: number
    unreadOnly?: boolean
    category?: string
  },
): Promise<{ notifications: Notification[]; total: number }> {
  try {
    const collection = await getNotificationsCollection()

    const query: any = { userId }

    if (options?.unreadOnly) {
      query.read = false
    }

    if (options?.category) {
      query.category = options.category
    }

    // Add expiration filter
    query.$or = [{ expiresAt: { $exists: false } }, { expiresAt: { $gt: new Date() } }]

    const total = await collection.countDocuments(query)

    const notifications = await collection
      .find(query)
      .sort({ createdAt: -1 })
      .limit(options?.limit || 50)
      .skip(options?.skip || 0)
      .toArray()

    return {
      notifications: notifications.map((n) => ({ ...n, _id: n._id?.toString() } as Notification)),
      total,
    }
  } catch (error) {
    console.error("Error fetching user notifications:", error)
    throw error
  }
}

export async function markNotificationAsRead(notificationId: string, userId: string): Promise<boolean> {
  try {
    const collection = await getNotificationsCollection()

    const result = await collection.updateOne(
      { _id: new ObjectId(notificationId), userId: userId },
      {
        $set: {
          read: true,
          readAt: new Date(),
        },
      },
    )

    return result.modifiedCount > 0
  } catch (error) {
    console.error("Error marking notification as read:", error)
    throw error
  }
}

export async function markAllNotificationsAsRead(userId: string): Promise<number> {
  try {
    const collection = await getNotificationsCollection()

    const result = await collection.updateMany(
      { userId, read: false },
      {
        $set: {
          read: true,
          readAt: new Date(),
        },
      },
    )

    return result.modifiedCount
  } catch (error) {
    console.error("Error marking all notifications as read:", error)
    throw error
  }
}

export async function deleteNotification(notificationId: string, userId: string): Promise<boolean> {
  try {
    const collection = await getNotificationsCollection()

    const result = await collection.deleteOne({
      _id: new ObjectId(notificationId),
      userId,
    })

    return result.deletedCount > 0
  } catch (error) {
    console.error("Error deleting notification:", error)
    throw error
  }
}

export async function getUnreadCount(userId: string): Promise<number> {
  try {
    const collection = await getNotificationsCollection()

    const count = await collection.countDocuments({
      userId,
      read: false,
      $or: [{ expiresAt: { $exists: false } }, { expiresAt: { $gt: new Date() } }],
    })

    return count
  } catch (error) {
    console.error("Error getting unread count:", error)
    throw error
  }
}

// User preferences
export async function getUserNotificationPreferences(userId: string): Promise<NotificationPreferences | null> {
  try {
    const collection = await getUsersCollection()

    const user = await collection.findOne({ _id: new ObjectId(userId) }, { projection: { notificationPreferences: 1 } })

    return user?.notificationPreferences || null
  } catch (error) {
    console.error("Error getting notification preferences:", error)
    throw error
  }
}

export async function updateNotificationPreferences(
  userId: string,
  preferences: NotificationPreferences,
): Promise<boolean> {
  try {
    const collection = await getUsersCollection()

    const result = await collection.updateOne(
      { _id: new ObjectId(userId) },
      {
        $set: {
          notificationPreferences: preferences,
          updatedAt: new Date(),
        },
      },
    )

    return result.modifiedCount > 0
  } catch (error) {
    console.error("Error updating notification preferences:", error)
    throw error
  }
}

// Template operations
export async function getNotificationTemplate(name: string): Promise<NotificationTemplate | null> {
  try {
    const collection = await getTemplatesCollection()

    const template = await collection.findOne({ name, isActive: true })

    return template ? { ...template, _id: template._id?.toString() } : null
  } catch (error) {
    console.error("Error getting notification template:", error)
    throw error
  }
}

export async function createNotificationTemplate(
  templateData: Omit<NotificationTemplate, "_id" | "createdAt" | "updatedAt">,
): Promise<string> {
  try {
    const collection = await getTemplatesCollection()

    const template: NotificationTemplate = {
      ...templateData,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await collection.insertOne(template)
    return result.insertedId.toString()
  } catch (error) {
    console.error("Error creating notification template:", error)
    throw error
  }
}

// Cleanup expired notifications
export async function cleanupExpiredNotifications(): Promise<number> {
  try {
    const collection = await getNotificationsCollection()

    const result = await collection.deleteMany({
      expiresAt: { $lt: new Date() },
    })

    return result.deletedCount
  } catch (error) {
    console.error("Error cleaning up expired notifications:", error)
    throw error
  }
}
