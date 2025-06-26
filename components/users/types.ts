export type UserRole = "super-admin" | "school" | "eca"

export type UserStatus = "active" | "inactive" | "pending"

export interface User {
  id: string
  name: string
  username?: string
  email: string
  role: UserRole
  schoolId?: string
  schoolName?: string
  status: UserStatus
  lastLogin?: string
  createdAt: string
  avatar?: string
}
