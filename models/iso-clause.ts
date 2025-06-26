import mongoose from "mongoose"

const ISODocumentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  fileUrl: { type: String, required: true },
  fileType: { type: String, required: true },
  uploadedBy: { type: String, required: true },
  uploadedAt: { type: Date, default: Date.now },
  size: { type: String, required: true },
})

const ISOClauseSchema = new mongoose.Schema({
  number: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  requirements: [{ type: String, required: true }],
  guidelines: [ISODocumentSchema],
  createdBy: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
})

export const ISOClause = mongoose.models.ISOClause || mongoose.model("ISOClause", ISOClauseSchema)
