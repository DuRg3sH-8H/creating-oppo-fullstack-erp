"use client"

import { useState } from "react"
import { CheckCircle, Download, File, XCircle, Eye, FileText, ImageIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/hooks/use-toast"

interface Document {
  id: string
  name: string
  fileUrl: string
  fileType: string
  size: string
  uploadedBy?: string
  uploadedAt?: string
}

interface Submission {
  id: string
  schoolName: string
  clauseNumber: string
  clauseTitle: string
  status: string
  documents: Document[]
  submittedAt: string
  submittedBy: string
  comments?: string
  reviewedBy?: string
  reviewedAt?: string
}

interface ReviewSubmissionModalProps {
  isOpen: boolean
  onClose: () => void
  submission: Submission | null
  onReview: (submissionId: string, status: "approved" | "rejected", comments: string) => void
}

export function ReviewSubmissionModal({ isOpen, onClose, submission, onReview }: ReviewSubmissionModalProps) {
  const [comments, setComments] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!submission) return null

  const handleReview = async (status: "approved" | "rejected") => {
    if (!comments.trim() && status === "rejected") {
      toast({
        title: "Comments Required",
        description: "Please provide comments when rejecting a submission.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    try {
      await onReview(submission.id, status, comments)
      toast({
        title: "Success",
        description: `Submission ${status} successfully.`,
      })
      onClose()
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${status} submission. Please try again.`,
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
      })
    } catch {
      return "Invalid Date"
    }
  }

  const getFileIcon = (fileType: string) => {
    if (fileType.includes("image")) {
      return <ImageIcon className="h-4 w-4" />
    } else if (fileType.includes("pdf")) {
      return <FileText className="h-4 w-4" />
    } else {
      return <File className="h-4 w-4" />
    }
  }

  const getFileTypeColor = (fileType: string) => {
    if (fileType.includes("image")) return "bg-blue-100 text-blue-600"
    if (fileType.includes("pdf")) return "bg-red-100 text-red-600"
    if (fileType.includes("word") || fileType.includes("document")) return "bg-indigo-100 text-indigo-600"
    if (fileType.includes("excel") || fileType.includes("sheet")) return "bg-green-100 text-green-600"
    return "bg-gray-100 text-gray-600"
  }

  const handleDownloadDocument = async (document: Document) => {
    try {
      // Create a temporary link to download the file
      const link = document.createElement("a")
      link.href = document.fileUrl
      link.download = document.name
      link.target = "_blank"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      toast({
        title: "Download Started",
        description: `Downloading ${document.name}`,
      })
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "Failed to download the document. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleViewDocument = (document: Document) => {
    // Open document in new tab for viewing
    window.open(document.fileUrl, "_blank")
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "submitted":
        return <Badge className="bg-blue-100 text-blue-700">Submitted</Badge>
      case "approved":
        return <Badge className="bg-green-100 text-green-700">Approved</Badge>
      case "rejected":
        return <Badge className="bg-red-100 text-red-700">Rejected</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-700">Unknown</Badge>
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-[#02609E] flex items-center justify-between">
            <div className="flex items-center">
              <span className="bg-[#017489]/10 text-[#017489] font-medium rounded-md px-2 py-1 text-xs mr-2">
                {submission.clauseNumber}
              </span>
              {submission.clauseTitle}
            </div>
            {getStatusBadge(submission.status)}
          </DialogTitle>
          <DialogDescription>
            Submission from {submission.schoolName} • {formatDate(submission.submittedAt)}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Submission Details */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-[#02609E] mb-2">Submission Details</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">School:</span> {submission.schoolName}
              </div>
              <div>
                <span className="font-medium">Submitted By:</span> {submission.submittedBy || "Unknown"}
              </div>
              <div>
                <span className="font-medium">Submitted At:</span> {formatDate(submission.submittedAt)}
              </div>
              <div>
                <span className="font-medium">Documents:</span> {submission.documents?.length || 0} files
              </div>
            </div>
          </div>

          {/* Documents Section */}
          {submission.documents && submission.documents.length > 0 ? (
            <div>
              <h4 className="text-sm font-medium text-[#02609E] mb-3">Submitted Documents</h4>
              <div className="space-y-3">
                {submission.documents.map((document, index) => (
                  <div key={document.id || index} className="border rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded ${getFileTypeColor(document.fileType)}`}>
                          {getFileIcon(document.fileType)}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{document.name}</p>
                          <p className="text-xs text-gray-500">
                            {document.size} • {document.fileType}
                            {document.uploadedAt && ` • Uploaded ${formatDate(document.uploadedAt)}`}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewDocument(document)}
                          className="text-[#017489] hover:bg-[#017489]/10"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDownloadDocument(document)}
                          className="text-[#017489] hover:bg-[#017489]/10"
                        >
                          <Download className="h-4 w-4 mr-1" />
                          Download
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <File className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No documents submitted</p>
            </div>
          )}

          {/* Review Section */}
          {submission.status === "submitted" ? (
            <div>
              <h4 className="text-sm font-medium text-[#02609E] mb-2">Review Comments</h4>
              <Textarea
                placeholder="Enter your feedback or comments about this submission..."
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                className="min-h-[100px] border-[#017489]/20 focus:border-[#017489] focus:ring-[#017489]/20"
              />
            </div>
          ) : (
            submission.comments && (
              <div>
                <h4 className="text-sm font-medium text-[#02609E] mb-2">Review Comments</h4>
                <div
                  className={`p-4 rounded-lg ${
                    submission.status === "approved"
                      ? "bg-green-50 border border-green-200"
                      : "bg-red-50 border border-red-200"
                  }`}
                >
                  <div className="flex items-start">
                    {submission.status === "approved" ? (
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 mr-2" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500 mt-0.5 mr-2" />
                    )}
                    <div>
                      <p className="text-sm font-medium">
                        {submission.status === "approved" ? "Approved" : "Rejected"} by {submission.reviewedBy} on{" "}
                        {submission.reviewedAt && formatDate(submission.reviewedAt)}
                      </p>
                      <p className="text-sm mt-1">{submission.comments}</p>
                    </div>
                  </div>
                </div>
              </div>
            )
          )}
        </div>

        <DialogFooter>
          {submission.status === "submitted" ? (
            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose} className="border-[#017489]/20 text-[#02609E]">
                Cancel
              </Button>
              <Button
                variant="outline"
                onClick={() => handleReview("rejected")}
                disabled={isSubmitting}
                className="border-red-300 text-red-600 hover:bg-red-50"
              >
                <XCircle className="h-4 w-4 mr-2" />
                {isSubmitting ? "Processing..." : "Reject"}
              </Button>
              <Button
                onClick={() => handleReview("approved")}
                disabled={isSubmitting}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                {isSubmitting ? "Processing..." : "Approve"}
              </Button>
            </div>
          ) : (
            <Button onClick={onClose} className="bg-[#017489] hover:bg-[#006955] text-white">
              Close
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
