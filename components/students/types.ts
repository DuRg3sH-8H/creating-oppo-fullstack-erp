export interface Student {
  _id: string
  id?: string
  name: string
  rollNumber: string
  class: string
  section: string
  dateOfBirth: string
  gender: "Male" | "Female" | "Other"
  parentContact: string
  guardianName: string
  parentEmail?: string
  address: string
  photo?: string
  schoolId: string
  academicYear: string
  status: "active" | "inactive" | "graduated" | "transferred"
  admissionDate: string
  previousClasses?: PreviousClass[]
  graduationDate?: string
  createdAt: Date
  updatedAt: Date
}

export interface PreviousClass {
  class: string
  section: string
  academicYear: string
  promotedDate: string
}

export interface ClassStructure {
  _id: string
  schoolId: string
  className: string
  sections: string[]
  isGraduationClass: boolean
  maxStudents: number
  order: number
  createdAt: Date
  updatedAt: Date
}

export interface ClassPromotion {
  _id?: string
  studentId: string
  fromClass: string
  fromSection: string
  toClass: string
  toSection: string
  academicYear: string
  promotedBy: string
  promotionDate: Date
  isGraduation: boolean
  notes?: string
}

export interface PromotionRecord {
  id: string
  studentId: string
  studentName: string
  fromClass: string
  fromSection: string
  toClass: string
  toSection: string
  academicYear: string
  promotedBy: string
  promotedByName: string
  promotionDate: string
  isGraduation: boolean
  notes?: string
}

export interface StudentFilters {
  class?: string
  section?: string
  status?: string
  search?: string
  schoolId?: string
  academicYear?: string
}

export interface PromotionRequest {
  studentIds: string[]
  toClass: string
  toSection: string
  academicYear: string
  notes?: string
}

// Pre-defined class options for consistent UI
export const PREDEFINED_CLASSES = [
  { value: "Nursery", label: "Nursery", order: 1 },
  { value: "LKG", label: "LKG", order: 2 },
  { value: "UKG", label: "UKG", order: 3 },
  { value: "1", label: "Class 1", order: 4 },
  { value: "2", label: "Class 2", order: 5 },
  { value: "3", label: "Class 3", order: 6 },
  { value: "4", label: "Class 4", order: 7 },
  { value: "5", label: "Class 5", order: 8 },
  { value: "6", label: "Class 6", order: 9 },
  { value: "7", label: "Class 7", order: 10 },
  { value: "8", label: "Class 8", order: 11 },
  { value: "9", label: "Class 9", order: 12 },
  { value: "10", label: "Class 10", order: 13 },
  { value: "11", label: "Class 11", order: 14 },
  { value: "12", label: "Class 12", order: 15 },
]

export const PREDEFINED_SECTIONS = [
  { value: "A", label: "Section A" },
  { value: "B", label: "Section B" },
  { value: "C", label: "Section C" },
  { value: "D", label: "Section D" },
  { value: "E", label: "Section E" },
]
