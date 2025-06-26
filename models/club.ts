export interface ClubModel {
  _id?: string
  id: string
  name: string
  logo?: string
  leadTeacher: string
  category: ClubCategory
  description: string
  totalActivities: number
  activities: ClubActivity[]
  status: "Open" | "Closed" | "Coming Soon"
  createdAt: Date
  updatedAt: Date
  registrations: SchoolRegistration[]
}

export interface ClubActivity {
  id: string
  title: string
  date: string
  description: string
  images?: string[]
  minutesUrl?: string
  createdAt: Date
  updatedAt: Date
}

export interface SchoolRegistration {
  id: string
  schoolId: string
  schoolName: string
  schoolLogo?: string
  registrationDate: string
  participantCount: number
  notes?: string
  status: "pending" | "approved" | "rejected"
  createdAt: Date
  updatedAt: Date
}

export type ClubCategory =
  | "Eco"
  | "Heritage"
  | "Drama"
  | "Sports"
  | "Academic"
  | "Technology"
  | "Arts"
  | "Music"
  | "Other"
