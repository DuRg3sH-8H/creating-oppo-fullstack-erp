export interface ISODocument {
  id: string
  name: string
  fileUrl: string
  fileType: string
  uploadedBy: string
  uploadedAt: string
  size: string
}

export interface ISOClause {
  id: string
  number: string
  title: string
  description: string
  requirements: string[]
  status: "pending" | "submitted" | "approved" | "rejected"
  lastUpdated: string
  submittedBy?: string
  submittedAt?: string
  reviewedBy?: string
  reviewedAt?: string
  comments?: string
  documents?: ISODocument[]
  guidelines?: ISODocument[]
}

export interface SchoolProgress {
  id: string
  name: string
  logo: string
  primaryColor: string
  secondaryColor: string
  totalClauses: number
  pendingClauses: number
  submittedClauses: number
  approvedClauses: number
  rejectedClauses: number
  progress: number
  isCertified: boolean
  lastUpdated: string
}

export interface SchoolSubmission {
  id: string
  schoolId: string
  schoolName: string
  clauseId: string
  clauseNumber: string
  clauseTitle: string
  documentCount: number
  submittedBy: string
  submittedAt: string
  status: "submitted" | "approved" | "rejected"
  reviewedBy?: string
  reviewedAt?: string
  comments?: string
}

export interface ClauseFormData {
  number: string
  title: string
  description: string
  requirements: string[]
}

export interface GuidelineUpload {
  clauseId: string
  files: File[]
}
