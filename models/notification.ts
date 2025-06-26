export interface Notification {
  _id?: string
  userId: string
  title: string
  message: string
  type: NotificationType
  category: NotificationCategory
  priority: NotificationPriority
  read: boolean
  emailSent: boolean
  data?: any // Additional data for the notification
  actionUrl?: string // URL to navigate when clicked
  createdAt: Date
  readAt?: Date
  expiresAt?: Date
}

export enum NotificationType {
  SYSTEM = "system",
  USER = "user",
  PROMOTION = "promotion",
  REMINDER = "reminder",
  ALERT = "alert",
  INFO = "info",
  SUCCESS = "success",
  WARNING = "warning",
  ERROR = "error",
}

export enum NotificationCategory {
  STUDENT = "student",
  SCHOOL = "school",
  TRAINING = "training",
  CLUB = "club",
  DOCUMENT = "document",
  ISO = "iso",
  SYSTEM = "system",
  SECURITY = "security",
}

export enum NotificationPriority {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
  URGENT = "urgent",
}

export interface NotificationTemplate {
  _id?: string
  name: string
  subject: string
  htmlTemplate: string
  textTemplate: string
  type: NotificationType
  category: NotificationCategory
  variables: string[] // Available template variables
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface EmailNotification {
  to: string
  subject: string
  html: string
  text: string
  priority: NotificationPriority
  category: NotificationCategory
}

export interface NotificationPreferences {
  email: boolean
  push: boolean
  sms: boolean
  marketing: boolean
  updates: boolean
  reminders: boolean
  security: boolean
  student: boolean
  training: boolean
  club: boolean
  document: boolean
  iso: boolean
}
