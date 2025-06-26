export interface TrainingMaterial {
  name: string
  url: string
}
export interface Training {
  id: string
  title: string
  description: string
  date: string
  time: string
  duration: string
  trainer: string
  category: string
  maxParticipants?: number
  materials: string[]
  registeredUsers: string[]
  schoolId?: string
  createdAt: Date
  updatedAt: Date
}

export interface TrainingFeedback {
  id: string
  trainingId: string
  userId: string
  rating: number
  feedback: string
  createdAt: string
}
