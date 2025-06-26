import mongoose from "mongoose"

const ISOSubmissionSchema = new mongoose.Schema({
  schoolId: { type: String, required: true },
  schoolName: { type: String, required: true },
  clauseId: { type: mongoose.Schema.Types.ObjectId, ref: "ISOClause", required: true },
  clauseNumber: { type: String, required: true },
  clauseTitle: { type: String, required: true },
  documents: [
    {
      name: { type: String, required: true },
      fileUrl: { type: String, required: true },
      fileType: { type: String, required: true },
      size: { type: String, required: true },
      uploadedAt: { type: Date, default: Date.now },
    },
  ],
  status: {
    type: String,
    enum: ["pending", "submitted", "approved", "rejected"],
    default: "pending",
  },
  submittedBy: { type: String, required: true },
  submittedAt: { type: Date, default: Date.now },
  reviewedBy: { type: String },
  reviewedAt: { type: Date },
  comments: { type: String },
  version: { type: Number, default: 1 },
})

// Compound index for efficient queries
ISOSubmissionSchema.index({ schoolId: 1, clauseId: 1 })
ISOSubmissionSchema.index({ status: 1, submittedAt: -1 })

export const ISOSubmission = mongoose.models.ISOSubmission || mongoose.model("ISOSubmission", ISOSubmissionSchema)
