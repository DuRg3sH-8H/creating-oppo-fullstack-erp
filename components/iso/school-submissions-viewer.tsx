"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { ArrowLeft, CheckCircle, Clock, FileCheck, Search, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ClauseReviewModal } from "@/components/iso/clause-review-modal"
import { mockClauses } from "@/components/iso/mock-data"
import type { ISOClause, SchoolProgress } from "@/components/iso/types"
import Image from "next/image"

interface SchoolSubmissionsViewerProps {
  school: SchoolProgress
  onBack: () => void
}

export function SchoolSubmissionsViewer({ school, onBack }: SchoolSubmissionsViewerProps) {
  const [clauses, setClauses] = useState<ISOClause[]>(mockClauses)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedClause, setSelectedClause] = useState<ISOClause | null>(null)
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false)

  // Filter clauses based on search query
  const filteredClauses = clauses.filter(
    (clause) =>
      clause.number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      clause.title.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleReviewClause = (clause: ISOClause) => {
    setSelectedClause(clause)
    setIsReviewModalOpen(true)
  }

  const handleClauseReviewed = (clauseId: string, status: "approved" | "rejected", comments: string) => {
    // Update the clause status
    const updatedClauses = clauses.map((clause) => {
      if (clause.id === clauseId) {
        return {
          ...clause,
          status,
          comments,
          reviewedBy: "Alex Johnson", // In a real app, this would be the current user
          reviewedAt: new Date().toISOString(),
        }
      }
      return clause
    })

    setClauses(updatedClauses)
    setIsReviewModalOpen(false)
    setSelectedClause(null)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <div className="flex items-center bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs">
            <Clock className="h-3 w-3 mr-1" />
            <span>Pending</span>
          </div>
        )
      case "submitted":
        return (
          <div className="flex items-center bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs">
            <FileCheck className="h-3 w-3 mr-1" />
            <span>Submitted</span>
          </div>
        )
      case "approved":
        return (
          <div className="flex items-center bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs">
            <CheckCircle className="h-3 w-3 mr-1" />
            <span>Approved</span>
          </div>
        )
      case "rejected":
        return (
          <div className="flex items-center bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs">
            <XCircle className="h-3 w-3 mr-1" />
            <span>Rejected</span>
          </div>
        )
      default:
        return null
    }
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A"
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  return (
    <div>
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={onBack}
          className="mb-4 text-[#02609E] hover:text-[#013A87] hover:bg-[#017489]/10"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Overview
        </Button>

        <div className="flex items-center mb-4">
          <div className="relative h-12 w-12 rounded-md overflow-hidden border border-gray-200 bg-gray-50 mr-3">
            <Image
              src={school.logo || "/placeholder.svg"}
              alt={`${school.name} logo`}
              fill
              className="object-contain p-1"
            />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-[#02609E]">{school.name}</h2>
            <p className="text-sm text-gray-500">ISO 21001 Submissions • {school.progress}% Complete</p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search clauses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 w-full md:w-64 bg-white border-gray-200"
            />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 border-b border-gray-100">
            <h3 className="font-semibold text-[#02609E]">ISO 21001 Clause Submissions</h3>
          </div>

          <div className="divide-y divide-gray-100">
            {filteredClauses.length === 0 ? (
              <div className="p-6 text-center text-gray-500">No clauses found matching your search.</div>
            ) : (
              filteredClauses.map((clause, index) => (
                <motion.div
                  key={clause.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="p-4 hover:bg-gray-50"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center">
                        <div className="bg-[#017489]/10 text-[#017489] font-medium rounded-md px-2 py-1 text-xs mr-2">
                          {clause.number}
                        </div>
                        <h4 className="font-medium text-[#02609E]">{clause.title}</h4>
                      </div>
                      <p className="text-sm text-gray-500 mt-1 line-clamp-1">{clause.description}</p>
                    </div>

                    <div className="flex items-center gap-4">
                      <div>{getStatusBadge(clause.status)}</div>
                      <div className="text-xs text-gray-500">
                        {clause.status !== "pending" ? (
                          <div>
                            <div>Submitted: {formatDate(clause.submittedAt)}</div>
                            {clause.status === "approved" || clause.status === "rejected" ? (
                              <div>Reviewed: {formatDate(clause.reviewedAt)}</div>
                            ) : null}
                          </div>
                        ) : (
                          <div>Not submitted yet</div>
                        )}
                      </div>
                      {clause.status === "submitted" && (
                        <Button
                          onClick={() => handleReviewClause(clause)}
                          className="bg-[#017489] hover:bg-[#006955] text-white"
                        >
                          Review
                        </Button>
                      )}
                      {(clause.status === "approved" || clause.status === "rejected") && (
                        <Button
                          onClick={() => handleReviewClause(clause)}
                          variant="outline"
                          className="border-[#017489]/20 text-[#02609E]"
                        >
                          View Details
                        </Button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </div>

      {selectedClause && (
        <ClauseReviewModal
          isOpen={isReviewModalOpen}
          onClose={() => setIsReviewModalOpen(false)}
          clause={selectedClause}
          onReview={handleClauseReviewed}
          schoolName={school.name}
        />
      )}
    </div>
  )
}
