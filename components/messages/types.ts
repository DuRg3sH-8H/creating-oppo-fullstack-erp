export interface Attachment {
  name: string
  url: string
  size: number
  type: string
}

export interface Message {
  id: string
  senderRole: "user" | "admin"
  content: string
  timestamp: Date
  status?: "sent" | "delivered" | "read"
  attachments?: Attachment[]
  senderName: string
}

export interface Conversation {
  id: string
  userId: string
  userName: string
  userRole: string
  schoolName?: string
  messages: Message[]
  lastMessage: string
  lastMessageTime: Date
  unreadCount: number
  participants: string
  title: string
}

export interface User {
  id: string
  name: string
  role: string
  schoolName?: string
}
