"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Search, Filter, FileCheck, Clock, CheckCircle, XCircle, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { ReviewSubmissionModal } from "./review-submission-modal"
import { fetchSubmissions, reviewSubmission } from "@/lib/api/iso"
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
  documentCount?: number
}

export function SubmissionReview() {
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [filteredSubmissions, setFilteredSubmissions] = useState<Submission[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null)
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadSubmissions()
  }, [])

  useEffect(() => {
    filterSubmissions()
  }, [submissions, searchQuery, statusFilter])

  const loadSubmissions = async () => {
    try {
      setIsLoading(true)
      const response = await fetchSubmissions()

      const submissionsData = response.submissions || []

      // Ensure documents array exists and has proper structure
      const processedSubmissions = submissionsData.map((submission: any) => ({
        ...submission,
        documents: submission.documents || [],
        schoolName: submission.schoolName || "Unknown School",
        clauseNumber: submission.clauseNumber || "Unknown",
        clauseTitle: submission.clauseTitle || "Unknown Clause",
        submittedBy: submission.submittedBy || "Unknown User",
        submittedAt: submission.submittedAt || submission.createdAt || new Date().toISOString(),
      }))

      setSubmissions(processedSubmissions)
    } catch (error) {
      console.error("Error loading submissions:", error)
      toast({
        title: "Error",
        description: "Failed to load submissions. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const filterSubmissions = () => {
    let filtered = submissions

    // Filter by search query
    if (searchQuery.trim()) {
      filtered = filtered.filter((submission) => {
        const searchLower = searchQuery.toLowerCase()
        return (
          (submission.schoolName || "").toLowerCase().includes(searchLower) ||
          (submission.clauseNumber || "").toLowerCase().includes(searchLower) ||
          (submission.clauseTitle || "").toLowerCase().includes(searchLower)
        )
      })
    }

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter((submission) => submission.status === statusFilter)
    }

    setFilteredSubmissions(filtered)
  }

  const handleReviewSubmission = (submission: Submission) => {
    setSelectedSubmission(submission)
    setIsReviewModalOpen(true)
  }

  const handleSubmissionReviewed = async (submissionId: string, status: "approved" | "rejected", comments: string) => {
    try {
      await reviewSubmission(submissionId, status, comments)

      // Update the submission in the local state
      setSubmissions((prev) =>
        prev.map((submission) =>
          submission.id === submissionId
            ? {
                ...submission,
                status,
                comments,
                reviewedBy: "Current User", // This should come from auth context
                reviewedAt: new Date().toISOString(),
              }
            : submission,
        ),
      )

      toast({
        title: "Success",
        description: `Submission ${status} successfully.`,
      })
    } catch (error) {
      console.error("Error reviewing submission:", error)
      throw error // Re-throw to let the modal handle it
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "submitted":
        return (
          <Badge className="bg-blue-100 text-blue-700">
            <FileCheck className="h-3 w-3 mr-1" />
            Submitted
          </Badge>
        )
      case "approved":
        return (
          <Badge className="bg-green-100 text-green-700">
            <CheckCircle className="h-3 w-3 mr-1" />
            Approved
          </Badge>
        )
      case "rejected":
        return (
          <Badge className="bg-red-100 text-red-700">
            <XCircle className="h-3 w-3 mr-1" />
            Rejected
          </Badge>
        )
      default:
        return (
          <Badge className="bg-gray-100 text-gray-700">
            <Clock className="h-3 w-3 mr-1" />
            Unknown
          </Badge>
        )
    }
  }

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    } catch {
      return "Invalid Date"
    }
  }

  const getSubmissionStats = () => {
    const total = submissions.length
    const submitted = submissions.filter((s) => s.status === "submitted").length
    const approved = submissions.filter((s) => s.status === "approved").length
    const rejected = submissions.filter((s) => s.status === "rejected").length

    return { total, submitted, approved, rejected }
  }

  const stats = getSubmissionStats()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#017489]"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="bg-blue-100 p-2 rounded-lg">
              <FileCheck className="h-5 w-5 text-blue-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Total Submissions</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="bg-yellow-100 p-2 rounded-lg">
              <Clock className="h-5 w-5 text-yellow-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Pending Review</p>
              <p className="text-2xl font-bold text-gray-900">{stats.submitted}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="bg-green-100 p-2 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Approved</p>
              <p className="text-2xl font-bold text-gray-900">{stats.approved}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="bg-red-100 p-2 rounded-lg">
              <XCircle className="h-5 w-5 text-red-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Rejected</p>
              <p className="text-2xl font-bold text-gray-900">{stats.rejected}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search by school name or clause..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="submitted">Submitted</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Submissions List */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <h3 className="font-semibold text-[#02609E]">Submission Reviews ({filteredSubmissions.length})</h3>
        </div>

        <div className="divide-y divide-gray-200">
          {filteredSubmissions.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <FileCheck className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No submissions found matching your criteria.</p>
            </div>
          ) : (
            filteredSubmissions.map((submission, index) => (
              <motion.div
                key={submission.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="p-4 hover:bg-gray-50"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <span className="bg-[#017489]/10 text-[#017489] font-medium rounded-md px-2 py-1 text-xs mr-2">
                        {submission.clauseNumber}
                      </span>
                      <h4 className="font-medium text-[#02609E]">{submission.clauseTitle}</h4>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">
                      <span className="font-medium">School:</span> {submission.schoolName}
                    </p>
                    <p className="text-sm text-gray-500">
                      Submitted on {formatDate(submission.submittedAt)} • {submission.documents?.length || 0} documents
                    </p>
                  </div>

                  <div className="flex items-center gap-4">
                    {getStatusBadge(submission.status)}
                    <Button
                      onClick={() => handleReviewSubmission(submission)}
                      className="bg-[#017489] hover:bg-[#006955] text-white"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      {submission.status === "submitted" ? "Review" : "View Details"}
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>

      {/* Review Modal */}
      <ReviewSubmissionModal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        submission={selectedSubmission}
        onReview={handleSubmissionReviewed}
      />
    </div>
  )
}
