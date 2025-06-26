"use client"

import type React from "react"

import { useState } from "react"
import { motion } from "framer-motion"
import { X, Upload, File, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { uploadGuidelines } from "@/lib/api/iso"
import type { ISOClause } from "@/components/iso/types"

interface GuidelineUploadModalProps {
  clause: ISOClause
  isOpen: boolean
  onClose: () => void
  onUpload: (clauseId: string, guidelines: any[]) => void
}

export function GuidelineUploadModal({ clause, isOpen, onClose, onUpload }: GuidelineUploadModalProps) {
  const [guidelines, setGuidelines] = useState<any[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const { toast } = useToast()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files).map((file) => ({
        file,
        name: file.name,
        size: formatFileSize(file.size),
        type: file.type,
      }))
      setGuidelines([...guidelines, ...newFiles])
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    if (e.dataTransfer.files) {
      const newFiles = Array.from(e.dataTransfer.files).map((file) => ({
        file,
        name: file.name,
        size: formatFileSize(file.size),
        type: file.type,
      }))
      setGuidelines([...guidelines, ...newFiles])
    }
  }

  const removeGuideline = (index: number) => {
    setGuidelines(guidelines.filter((_, i) => i !== index))
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " bytes"
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB"
    else return (bytes / 1048576).toFixed(1) + " MB"
  }

  const handleUpload = async () => {
    if (guidelines.length === 0) return

    setIsUploading(true)

    try {
      const files = guidelines.map((g) => g.file)
      const result = await uploadGuidelines(clause.id, files)

      toast({
        title: "Success",
        description: "Guidelines uploaded successfully.",
      })

      onUpload(clause.id, result.guidelines)
      setGuidelines([])
    } catch (error) {
      console.error("Error uploading guidelines:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to upload guidelines.",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-[var(--accent-color)]">Upload Guidelines</h2>
              <p className="text-sm text-gray-500 mt-1">
                Upload guidelines and templates for clause {clause.number}: {clause.title}
              </p>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* File Upload Area */}
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              isDragging ? "border-[var(--primary-color)] bg-[var(--primary-color)]/5" : "border-gray-300"
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-lg font-medium text-gray-700 mb-2">Upload Guidelines & Templates</p>
            <p className="text-sm text-gray-500 mb-4">
              Drag and drop files here, or{" "}
              <label className="text-[var(--primary-color)] hover:underline cursor-pointer">
                browse
                <input
                  type="file"
                  onChange={handleFileChange}
                  className="hidden"
                  multiple
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
                />
              </label>
            </p>
            <p className="text-xs text-gray-400">
              Supported formats: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX (Max 10MB each)
            </p>
          </div>

          {/* Uploaded Files List */}
          {guidelines.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-[var(--accent-color)] mb-3">Selected Files</h3>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {guidelines.map((guideline, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <File className="h-5 w-5 text-blue-500 mr-3" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{guideline.name}</p>
                        <p className="text-xs text-gray-500">{guideline.size}</p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeGuideline(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Existing Guidelines */}
          {clause.guidelines && clause.guidelines.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-[var(--accent-color)] mb-3">Current Guidelines</h3>
              <div className="space-y-2">
                {clause.guidelines.map((guideline, index) => (
                  <div key={index} className="flex items-center p-3 bg-blue-50 rounded-lg">
                    <File className="h-5 w-5 text-blue-500 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{guideline.name}</p>
                      <p className="text-xs text-gray-500">
                        Uploaded by {guideline.uploadedBy} • {guideline.size}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-gray-200">
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              onClick={handleUpload}
              disabled={isUploading || guidelines.length === 0}
              className="bg-[var(--primary-color)] hover:bg-[var(--secondary-color)] text-white"
            >
              <Upload className="h-4 w-4 mr-2" />
              {isUploading ? "Uploading..." : `Upload ${guidelines.length} File(s)`}
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
