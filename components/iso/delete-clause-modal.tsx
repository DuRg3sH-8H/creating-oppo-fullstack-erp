"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { X, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { ISOClause } from "@/components/iso/types"

interface DeleteClauseModalProps {
  clause: ISOClause
  isOpen: boolean
  onClose: () => void
  onDelete: (clauseId: string) => void
}

export function DeleteClauseModal({ clause, isOpen, onClose, onDelete }: DeleteClauseModalProps) {
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    setIsDeleting(true)

    // Simulate API call
    setTimeout(() => {
      onDelete(clause.id)
      setIsDeleting(false)
    }, 1000)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-xl shadow-xl max-w-md w-full"
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div className="bg-red-100 text-red-600 p-2 rounded-lg mr-3">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <h2 className="text-xl font-semibold text-[var(--accent-color)]">Delete Clause</h2>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="mb-6">
            <p className="text-gray-700 mb-4">
              Are you sure you want to delete this clause? This action cannot be undone.
            </p>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <div className="bg-[var(--primary-color)]/10 text-[var(--primary-color)] font-medium rounded-md px-2 py-1 text-xs mr-2">
                  {clause.number}
                </div>
                <span className="font-medium text-[var(--accent-color)]">{clause.title}</span>
              </div>
              <p className="text-sm text-gray-600">{clause.description}</p>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleDelete} disabled={isDeleting} className="bg-red-600 hover:bg-red-700 text-white">
              {isDeleting ? "Deleting..." : "Delete Clause"}
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
