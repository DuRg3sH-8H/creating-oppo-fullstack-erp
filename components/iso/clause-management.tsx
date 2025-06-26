"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Edit, Trash2, Upload, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { EditClauseModal } from "@/components/iso/edit-clause-modal"
import { DeleteClauseModal } from "@/components/iso/delete-clause-modal"
import { GuidelineUploadModal } from "@/components/iso/guideline-upload-modal"
import { fetchClauses, deleteClause as deleteClauseAPI } from "@/lib/api/iso"
import type { ISOClause } from "@/components/iso/types"

export function ClauseManagement() {
  const [clauses, setClauses] = useState<ISOClause[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [editingClause, setEditingClause] = useState<ISOClause | null>(null)
  const [deletingClause, setDeletingClause] = useState<ISOClause | null>(null)
  const [uploadingGuideline, setUploadingGuideline] = useState<ISOClause | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    loadClauses()
  }, [])

  const loadClauses = async () => {
    try {
      setLoading(true)
      const data = await fetchClauses()
      setClauses(data.clauses || [])
    } catch (error) {
      console.error("Error loading clauses:", error)
      toast({
        title: "Error",
        description: "Failed to load clauses. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const filteredClauses = clauses.filter(
    (clause) =>
      clause.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      clause.number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      clause.description.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleEditClause = (clause: ISOClause) => {
    setEditingClause(clause)
  }

  const handleDeleteClause = (clause: ISOClause) => {
    setDeletingClause(clause)
  }

  const handleUploadGuideline = (clause: ISOClause) => {
    setUploadingGuideline(clause)
  }

  const handleClauseUpdate = (updatedClause: ISOClause) => {
    setClauses(clauses.map((clause) => (clause.id === updatedClause.id ? updatedClause : clause)))
    setEditingClause(null)
    toast({
      title: "Success",
      description: "Clause updated successfully.",
    })
  }

  const handleClauseDelete = async (clauseId: string) => {
    try {
      await deleteClauseAPI(clauseId)
      setClauses(clauses.filter((clause) => clause.id !== clauseId))
      setDeletingClause(null)
      toast({
        title: "Success",
        description: "Clause deleted successfully.",
      })
    } catch (error) {
      console.error("Error deleting clause:", error)
      toast({
        title: "Error",
        description: "Failed to delete clause. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleGuidelineUpload = (clauseId: string, guidelines: any[]) => {
    setClauses(
      clauses.map((clause) =>
        clause.id === clauseId
          ? {
              ...clause,
              guidelines: [...(clause.guidelines || []), ...guidelines],
            }
          : clause,
      ),
    )
    setUploadingGuideline(null)
    toast({
      title: "Success",
      description: "Guidelines uploaded successfully.",
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--primary-color)]" />
        <span className="ml-2 text-gray-600">Loading clauses...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="flex items-center gap-4">
        <Input
          placeholder="Search clauses..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-md"
        />
        <Badge variant="outline" className="text-sm">
          {filteredClauses.length} clause{filteredClauses.length !== 1 ? "s" : ""}
        </Badge>
      </div>

      {/* Clauses Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Clause
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Requirements
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Guidelines
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredClauses.map((clause, index) => (
                <motion.tr
                  key={clause.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="hover:bg-gray-50"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="bg-[var(--primary-color)]/10 text-[var(--primary-color)] font-medium rounded-md px-2 py-1 text-xs inline-block">
                      {clause.number}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{clause.title}</div>
                    <div className="text-sm text-gray-500 line-clamp-2">{clause.description}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-500">{clause.requirements.length} requirement(s)</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {clause.guidelines && clause.guidelines.length > 0 ? (
                        <Badge variant="outline" className="text-green-600 border-green-200">
                          {clause.guidelines.length} file(s)
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-gray-500">
                          No guidelines
                        </Badge>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditClause(clause)}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleUploadGuideline(clause)}
                        className="text-green-600 hover:text-green-700"
                      >
                        <Upload className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteClause(clause)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredClauses.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No clauses found.</p>
          </div>
        )}
      </div>

      {/* Modals */}
      {editingClause && (
        <EditClauseModal
          clause={editingClause}
          isOpen={!!editingClause}
          onClose={() => setEditingClause(null)}
          onUpdate={handleClauseUpdate}
        />
      )}

      {deletingClause && (
        <DeleteClauseModal
          clause={deletingClause}
          isOpen={!!deletingClause}
          onClose={() => setDeletingClause(null)}
          onDelete={handleClauseDelete}
        />
      )}

      {uploadingGuideline && (
        <GuidelineUploadModal
          clause={uploadingGuideline}
          isOpen={!!uploadingGuideline}
          onClose={() => setUploadingGuideline(null)}
          onUpload={handleGuidelineUpload}
        />
      )}
    </div>
  )
}
