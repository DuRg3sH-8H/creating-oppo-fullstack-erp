"use client"

import { useState, useEffect } from "react"
import { Award, CheckCircle, Clock, FileCheck, XCircle, Upload, AlertTriangle } from "lucide-react"
import { SchoolISOProgress } from "@/components/iso/school-progress-iso"
import { SchoolClausesList } from "@/components/iso/school-clauses-list"
import { SchoolClauseDetail } from "@/components/iso/school-clause-detail"
import { fetchClauses, fetchSubmissions, submitDocuments } from "@/lib/api/iso"
import { useToast } from "@/hooks/use-toast"
import type { ISOClause } from "@/components/iso/types"

interface SchoolAdminISOViewProps {
  userRole: "school" | "eca"
}

interface ClauseWithStatus extends ISOClause {
  status: "pending" | "submitted" | "approved" | "rejected"
  submissionId?: string
  feedback?: string
  submittedAt?: string
  reviewedAt?: string
  reviewedBy?: string
}

export function SchoolAdminISOView({ userRole }: SchoolAdminISOViewProps) {
  const [clauses, setClauses] = useState<ClauseWithStatus[]>([])
  const [selectedClauseId, setSelectedClauseId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)


      // Fetch clauses first
      const clausesResponse = await fetchClauses()

      if (!clausesResponse.clauses || clausesResponse.clauses.length === 0) {
        setClauses([])
        return
      }

      // Then fetch submissions
      let submissionsData = { submissions: [] }
      try {
        submissionsData = await fetchSubmissions()
      } catch (submissionError) {
        console.warn("Failed to fetch submissions, using empty array:", submissionError)
        // Continue with empty submissions if fetch fails
        submissionsData = { submissions: [] }
      }

      // Create a map of submissions by clause ID
      const submissionMap = new Map()
      if (submissionsData.submissions) {
        submissionsData.submissions.forEach((submission: any) => {
          submissionMap.set(submission.clauseId, submission)
        })
      }

      // Merge clauses with submission status
      const clausesWithStatus: ClauseWithStatus[] = clausesResponse.clauses.map((clause: ISOClause) => {
        const submission = submissionMap.get(clause.id || clause.id)

        return {
          ...clause,
          id: clause.id || clause.id,
          status: submission?.status || "pending",
          submissionId: submission?.id,
          feedback: submission?.comments,
          submittedAt: submission?.submittedAt,
          reviewedAt: submission?.reviewedAt,
          reviewedBy: submission?.reviewedBy,
          documents: submission?.documents || [],
        }
      })

      setClauses(clausesWithStatus)
    } catch (error) {
      console.error("Failed to load data:", error)
      toast({
        title: "Error",
        description: "Failed to load ISO data. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Calculate progress
  const totalClauses = clauses.length
  const pendingClauses = clauses.filter((c) => c.status === "pending").length
  const submittedClauses = clauses.filter((c) => c.status === "submitted").length
  const approvedClauses = clauses.filter((c) => c.status === "approved").length
  const rejectedClauses = clauses.filter((c) => c.status === "rejected").length
  const progress = totalClauses > 0 ? Math.round((approvedClauses / totalClauses) * 100) : 0
  const isCertified = approvedClauses === totalClauses && totalClauses > 0

  const handleClauseSelect = (clauseId: string) => {
    setSelectedClauseId(clauseId)
  }

  const handleDocumentSubmit = async (clauseId: string, documents: File[]) => {
    try {
      setSubmitting(true)

      await submitDocuments(clauseId, documents)

      toast({
        title: "Success",
        description: "Documents submitted successfully for review.",
      })

      // Reload data to get updated status
      await loadData()
    } catch (error) {
      console.error("Failed to submit documents:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to submit documents",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const selectedClause = clauses.find((clause) => clause.id === selectedClauseId)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--primary-color)]"></div>
      </div>
    )
  }

  if (clauses.length === 0) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-[var(--accent-color)] mb-2">No ISO Clauses Available</h3>
        <p className="text-gray-500">
          No ISO 21001 clauses have been configured yet. Please contact your administrator.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Progress Overview */}
      <SchoolISOProgress
        progress={progress}
        totalClauses={totalClauses}
        pendingClauses={pendingClauses}
        submittedClauses={submittedClauses}
        approvedClauses={approvedClauses}
        rejectedClauses={rejectedClauses}
        isCertified={isCertified}
      />

      {/* Status Legend */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex flex-wrap gap-4 items-center">
          <h3 className="text-sm font-medium text-[var(--accent-color)]">Status Legend:</h3>
          <div className="flex items-center bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
            <Clock className="h-4 w-4 mr-2" />
            <span>Pending Submission</span>
          </div>
          <div className="flex items-center bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">
            <FileCheck className="h-4 w-4 mr-2" />
            <span>Under Review</span>
          </div>
          <div className="flex items-center bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">
            <CheckCircle className="h-4 w-4 mr-2" />
            <span>Approved</span>
          </div>
          <div className="flex items-center bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm">
            <XCircle className="h-4 w-4 mr-2" />
            <span>Needs Revision</span>
          </div>
          {isCertified && (
            <div className="flex items-center bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm ml-auto">
              <Award className="h-4 w-4 mr-2" />
              <span>ISO 21001 Certified</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <SchoolClausesList
            clauses={clauses}
            selectedClauseId={selectedClauseId}
            onClauseSelect={handleClauseSelect}
          />
        </div>
        <div className="lg:col-span-2">
          {selectedClause ? (
            <SchoolClauseDetail
              clause={selectedClause}
              userRole={userRole}
              onDocumentSubmit={handleDocumentSubmit}
              isSubmitting={submitting}
            />
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 h-full flex items-center justify-center">
              <div className="text-center">
                <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-[var(--accent-color)]">Select a clause to get started</h3>
                <p className="text-gray-500 mt-2">
                  Click on any clause from the list to view requirements and submit documents
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
