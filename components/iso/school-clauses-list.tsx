"use client"

import { useState } from "react"
import { Search, CheckCircle, Clock, FileCheck, XCircle, AlertCircle } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import type { ISOClause } from "@/components/iso/types"

interface SchoolClausesListProps {
  clauses: ISOClause[]
  selectedClauseId: string | null
  onClauseSelect: (clauseId: string) => void
}

export function SchoolClausesList({ clauses, selectedClauseId, onClauseSelect }: SchoolClausesListProps) {
  const [searchTerm, setSearchTerm] = useState("")

  const filteredClauses = clauses.filter(
    (clause) =>
      clause.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      clause.description.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // Sort clauses: rejected first, then pending, submitted, approved
  const sortedClauses = [...filteredClauses].sort((a, b) => {
    const statusOrder = { rejected: 0, pending: 1, submitted: 2, approved: 3 }
    return statusOrder[a.status] - statusOrder[b.status]
  })

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "submitted":
        return <FileCheck className="h-4 w-4 text-blue-500" />
      case "rejected":
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
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
        return <Badge variant="secondary">Pending</Badge>
    }
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder="Search clauses..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="space-y-2 max-h-[600px] overflow-y-auto">
        {sortedClauses.map((clause) => (
          <Card
            key={clause.id}
            className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
              selectedClauseId === clause.id ? "ring-2 ring-[var(--primary-color)] shadow-md" : "hover:bg-gray-50"
            }`}
            onClick={() => onClauseSelect(clause.id)}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center space-x-2">
                  {getStatusIcon(clause.status)}
                  <h3 className="font-medium text-[var(--accent-color)] text-sm">{clause.title}</h3>
                </div>
                {clause.status === "rejected" && <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0" />}
              </div>

              <p className="text-xs text-gray-600 mb-3 line-clamp-2">{clause.description}</p>

              <div className="flex items-center justify-between">
                {getStatusBadge(clause.status)}
                <span className="text-xs text-gray-500">
                  {clause.requirements.length} requirement{clause.requirements.length !== 1 ? "s" : ""}
                </span>
              </div>

              {clause.status === "rejected" && clause.feedback && (
                <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700">
                  <strong>Feedback:</strong> {clause.feedback}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {sortedClauses.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <Search className="h-8 w-8 mx-auto mb-2 text-gray-400" />
          <p>No clauses found matching your search.</p>
        </div>
      )}
    </div>
  )
}
