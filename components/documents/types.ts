export type DocumentCategory = "template" | "policy" | "report" | "form"

export interface Document {
  id: string
  name: string
  description: string
  category: DocumentCategory
  version: string
  fileType: string
  fileSize: number
  uploadDate: string
  uploadedBy: string
  isUpdated: boolean
  url: string
}
