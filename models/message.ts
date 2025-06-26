import type { ObjectId } from "mongodb"

export interface Message {
  _id?: ObjectId
  id?: string
  conversationId: string
  senderId: string
  senderName: string
  senderRole: string
  content: string
  attachments?: Attachment[]
  timestamp: Date
  status: MessageStatus
  readBy: ReadStatus[]
  createdAt: Date
  updatedAt: Date
}

export interface Conversation {
  _id?: ObjectId
  id?: string
  participants: Participant[]
  title?: string
  lastMessage?: string
  lastMessageTime: Date
  unreadCount: { [userId: string]: number }
  createdBy: string
  createdAt: Date
  updatedAt: Date
}

export interface Participant {
  userId: string
  userName: string
  userRole: string
  schoolId?: string
  schoolName?: string
  joinedAt: Date
  isActive: boolean
}

export interface Attachment {
  name: string
  url: string
  size: number
  type: string
  uploadedAt: Date
}

export interface ReadStatus {
  userId: string
  readAt: Date
}

export enum MessageStatus {
  SENT = "sent",
  DELIVERED = "delivered",
  READ = "read",
}

export interface MessageFilters {
  conversationId?: string
  senderId?: string
  search?: string
  startDate?: Date
  endDate?: Date
  hasAttachments?: boolean
}

export interface ConversationFilters {
  userId?: string
  userRole?: string
  schoolId?: string
  search?: string
  hasUnread?: boolean
}
