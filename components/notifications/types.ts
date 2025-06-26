export enum NotificationCategory {
  SYSTEM = "system",
  EVENT = "event",
  REMINDER = "reminder",
  DOCUMENT = "document",
  ISO = "iso",
}

export enum NotificationPriority {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
}

export interface Notification {
  id: string
  title: string
  message: string
  category: NotificationCategory
  priority: NotificationPriority
  date: string
  read: boolean
  sender: string
  target: string[] // user roles that should receive this notification
}
