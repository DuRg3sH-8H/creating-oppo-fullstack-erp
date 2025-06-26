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

export interface ClubActivity {
  id: string
  title: string
  date: string
  description: string
  images?: string[]
  minutesUrl?: string
}

export interface SchoolRegistration {
  id: string
  schoolId: string
  schoolName: string
  schoolLogo?: string
  registrationDate: string
  participantCount: number
  notes?: string
}

export interface Club {
  registeredSchools: number
  id: string
  name: string
  logo?: string
  leadTeacher: string
  category: ClubCategory
  description: string
  totalActivities: number
  activities: ClubActivity[]
  status?: "Open" | "Closed" | "Coming Soon"
  isRegistered?: boolean
  registrations?: SchoolRegistration[]
}
