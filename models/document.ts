import { Schema, model, models } from "mongoose"


export interface IDocument {
  mimeType: string
  _id?: string
  name: string
  description: string
  category: "template" | "policy" | "report" | "form"
  version: string
  fileType: string
  fileName: string
  originalName: string
  fileSize: number
  filePath: string
  uploadDate: Date
  uploadedBy: {
    id: string
    name: string
    email: string
  }
  schoolId?: string // Optional - for school-specific documents
  isPublic: boolean
  downloadCount: number
  tags: string[]
  status: "active" | "archived" | "deleted"
  createdAt: Date
  updatedAt: Date
}

const DocumentSchema = new Schema<IDocument>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 255,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },
    category: {
      type: String,
      required: true,
      enum: ["template", "policy", "report", "form"],
    },
    version: {
      type: String,
      required: true,
      trim: true,
    },
    fileType: {
      type: String,
      required: true,
      lowercase: true,
    },
    fileName: {
      type: String,
      required: true,
      unique: true,
    },
    originalName: {
      type: String,
      required: true,
    },
    fileSize: {
      type: Number,
      required: true,
      min: 0,
    },
    filePath: {
      type: String,
      required: true,
    },
    uploadDate: {
      type: Date,
      default: Date.now,
    },
    uploadedBy: {
      id: {
        type: String,
        required: true,
      },
      name: {
        type: String,
        required: true,
      },
      email: {
        type: String,
        required: true,
      },
    },
    schoolId: {
      type: String,
      required: false,
    },
    isPublic: {
      type: Boolean,
      default: true,
    },
    downloadCount: {
      type: Number,
      default: 0,
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    status: {
      type: String,
      enum: ["active", "archived", "deleted"],
      default: "active",
    },
  },
  {
    timestamps: true,
  },
)

// Indexes for better query performance
DocumentSchema.index({ category: 1, status: 1 })
DocumentSchema.index({ uploadedBy: 1 })
DocumentSchema.index({ schoolId: 1 })
DocumentSchema.index({ createdAt: -1 })
DocumentSchema.index({ name: "text", description: "text", tags: "text" })

export const Document = models.Document || model<IDocument>("Document", DocumentSchema)
