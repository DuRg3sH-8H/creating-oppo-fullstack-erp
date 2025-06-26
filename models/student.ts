import type { ObjectId } from "mongodb"

export interface Student {
  _id?: ObjectId
  id?: string
  schoolId: string
  name: string
  photo?: string
  gender: "Male" | "Female" | "Other"
  dateOfBirth: string
  rollNumber: string
  class: string
  section: string
  guardianName: string
  parentContact: string
  address: string
  academicYear: string
  status: "active" | "inactive" | "graduated" | "transferred"
  admissionDate: string
  graduationDate?: string
  previousClasses?: PreviousClass[]
  createdAt?: Date
  updatedAt?: Date
}

export interface PreviousClass {
  class: string
  section: string
  academicYear: string
  promotedDate: string
}

export interface ClassStructure {
  _id?: ObjectId
  id?: string
  schoolId: string
  className: string
  displayName: string
  sections: string[]
  order: number
  isGraduationClass: boolean
  // Removed maxStudentsPerSection - unlimited students allowed
  isActive: boolean
  createdAt?: Date
  updatedAt?: Date
}

export interface ClassPromotion {
  _id?: ObjectId
  id?: string
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

export interface PromotionRequest {
  studentIds: string[]
  toClass: string
  toSection: string
  academicYear: string
  notes?: string
}

export interface StudentFilters {
  class?: string
  section?: string
  status?: string
  academicYear?: string
  search?: string
}

export interface StudentStats {
  total: number
  active: number
  graduated: number
  inactive: number
  transferred: number
  byClass: Record<string, number>
  bySection: Record<string, number>
}
