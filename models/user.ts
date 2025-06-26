import type { ObjectId } from "mongodb"

export interface User {
  _id?: string | ObjectId
  name: string
  email: string
  password: string // This will be hashed
  role: "super-admin" | "school" | "eca"
  avatar?: string
  schoolId?: string
  schoolName?: string
  lastLogin?: Date
  isActive: boolean
  notificationPreferences?: NotificationPreferences
  createdAt: Date
  updatedAt: Date
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

export interface UserCredentials {
  email: string
  password: string
}

export interface AuthResponse {
  success: boolean
  message: string
  user?: Omit<User, "password">
  token?: string
}

export interface School {
  _id?: string | ObjectId
  id?: string
  name: string
  logo?: string
  primaryColor: string
  secondaryColor: string
  accentColor: string
  darkColor: string
  isActive?: boolean
  createdAt: Date
  updatedAt: Date
}
