export interface Event {
  id: string
  title: string
  description: string
  type: "training" | "competition" | "meeting" | "workshop" | "conference" | "other"
  date: Date
  startTime: string
  endTime: string
  location: string
  maxParticipants?: number
  registrationDeadline?: Date
  requirements?: string[]
  materials?: string[]
  createdBy: string
  createdAt: Date
  updatedAt: Date
  status: "draft" | "published" | "cancelled" | "completed"
}

export interface EventRegistration {
  id: string
  eventId: string
  schoolId: string
  schoolName: string
  registeredBy: string
  registeredAt: Date
  status: "pending" | "approved" | "rejected"
  notes?: string
  participants?: {
    name: string
    role: string
    email: string
  }[]
}
