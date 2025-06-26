"use client"

import { useState } from "react"
import { FileText, Download, Upload, CheckCircle, Clock, XCircle, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DocumentUploadModal } from "@/components/iso/document-upload-modal"
import type { ISOClause } from "@/components/iso/types"

interface SchoolClauseDetailProps {
  clause: ISOClause & {
    status: "pending" | "submitted" | "approved" | "rejected"
    feedback?: string
    submittedAt?: string
    reviewedAt?: string
    reviewedBy?: string
  }
  userRole: "school" | "eca"
  onDocumentSubmit: (clauseId: string, documents: File[]) => Promise<void>
  isSubmitting?: boolean
}

export function SchoolClauseDetail({
  clause,
  userRole,
  onDocumentSubmit,
  isSubmitting = false,
}: SchoolClauseDetailProps) {
  const [showUploadModal, setShowUploadModal] = useState(false)

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "submitted":
        return <Clock className="h-5 w-5 text-blue-500" />
      case "rejected":
        return <XCircle className="h-5 w-5 text-red-500" />
      default:
        return <AlertCircle className="h-5 w-5 text-gray-500" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Approved</Badge>
      case "submitted":
        return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">Under Review</Badge>
      case "rejected":
        return <Badge className="bg-red-100 text-red-700 hover:bg-red-100">Needs Revision</Badge>
      default:
        return <Badge variant="secondary">Pending Submission</Badge>
    }
  }

  const canSubmit = clause.status === "pending" || clause.status === "rejected"

  const handleSubmit = async (documents: File[]) => {
    await onDocumentSubmit(clause.id || clause._id, documents)
    setShowUploadModal(false)
  }

  const handleDownload = (fileUrl: string, fileName: string) => {
    // Create a temporary link to download the file
    const link = document.createElement("a")
    link.href = fileUrl
    link.download = fileName
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                {getStatusIcon(clause.status)}
                <CardTitle className="text-xl text-[var(--accent-color)]">
                  {clause.number} - {clause.title}
                </CardTitle>
              </div>
              <CardDescription>{clause.description}</CardDescription>
            </div>
            {getStatusBadge(clause.status)}
          </div>
        </CardHeader>
        <CardContent>
          {clause.status === "rejected" && clause.feedback && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start space-x-2">
                <XCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium text-red-800 mb-1">Revision Required</h4>
                  <p className="text-sm text-red-700">{clause.feedback}</p>
                  {clause.reviewedAt && (
                    <p className="text-xs text-red-600 mt-2">
                      Reviewed on {new Date(clause.reviewedAt).toLocaleDateString()}
                      {clause.reviewedBy && ` by ${clause.reviewedBy}`}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {clause.status === "approved" && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-start space-x-2">
                <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium text-green-800 mb-1">Approved</h4>
                  <p className="text-sm text-green-700">
                    This clause has been approved and meets ISO 21001 requirements.
                  </p>
                  {clause.reviewedAt && (
                    <p className="text-xs text-green-600 mt-2">
                      Approved on {new Date(clause.reviewedAt).toLocaleDateString()}
                      {clause.reviewedBy && ` by ${clause.reviewedBy}`}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {clause.status === "submitted" && (
            <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start space-x-2">
                <Clock className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-800 mb-1">Under Review</h4>
                  <p className="text-sm text-blue-700">
                    Your submission is currently being reviewed by the administrators.
                  </p>
                  {clause.submittedAt && (
                    <p className="text-xs text-blue-600 mt-2">
                      Submitted on {new Date(clause.submittedAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Requirements */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg text-[var(--accent-color)]">Requirements</CardTitle>
          <CardDescription>What needs to be documented for this clause</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {clause.requirements.map((requirement, index) => (
              <li key={index} className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-[var(--primary-color)] rounded-full mt-2 flex-shrink-0" />
                <span className="text-sm text-gray-700">{requirement}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Guidelines */}
      {clause.guidelines && clause.guidelines.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg text-[var(--accent-color)]">Guidelines & Templates</CardTitle>
            <CardDescription>Reference documents to help with your submission</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {clause.guidelines.map((guideline) => (
                <div key={guideline.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <FileText className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{guideline.name}</p>
                      <p className="text-xs text-gray-500">{guideline.size}</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => handleDownload(guideline.fileUrl, guideline.name)}>
                    <Download className="h-4 w-4 mr-1" />
                    Download
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Submitted Documents */}
      {clause.documents && clause.documents.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg text-[var(--accent-color)]">Submitted Documents</CardTitle>
            <CardDescription>Documents you have uploaded for this clause</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {clause.documents.map((document) => (
                <div key={document.id} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <FileText className="h-4 w-4 text-blue-500" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{document.name}</p>
                      <p className="text-xs text-gray-500">
                        Uploaded on {new Date(document.uploadedAt).toLocaleDateString()} • {document.size}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm" onClick={() => handleDownload(document.fileUrl, document.name)}>
                      <Download className="h-4 w-4 mr-1" />
                      Download
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex justify-end space-x-3">
        {canSubmit && (
          <Button
            onClick={() => setShowUploadModal(true)}
            disabled={isSubmitting}
            className="bg-[var(--primary-color)] hover:bg-[var(--primary-color)]/90"
          >
            <Upload className="h-4 w-4 mr-2" />
            {isSubmitting ? "Submitting..." : clause.status === "rejected" ? "Resubmit Documents" : "Submit Documents"}
          </Button>
        )}
      </div>

      {/* Upload Modal */}
      <DocumentUploadModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onSubmit={handleSubmit}
        clauseTitle={clause.title}
        isSubmitting={isSubmitting}
      />
    </div>
  )
}
