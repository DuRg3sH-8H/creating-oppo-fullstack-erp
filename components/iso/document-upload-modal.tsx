"use client"

import { useState, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { Upload, FileText, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"

interface DocumentUploadModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (documents: File[]) => Promise<void>
  clauseTitle: string
  isSubmitting?: boolean
}

export function DocumentUploadModal({
  isOpen,
  onClose,
  onSubmit,
  clauseTitle,
  isSubmitting = false,
}: DocumentUploadModalProps) {
  const [files, setFiles] = useState<File[]>([])

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFiles((prev) => [...prev, ...acceptedFiles])
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "application/msword": [".doc"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
      "application/vnd.ms-excel": [".xls"],
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
      "application/vnd.ms-powerpoint": [".ppt"],
      "application/vnd.openxmlformats-officedocument.presentationml.presentation": [".pptx"],
      "image/*": [".png", ".jpg", ".jpeg", ".gif"],
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    disabled: isSubmitting,
  })

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async () => {
    if (files.length === 0) return

    try {
      await onSubmit(files)
      setFiles([])
    } catch (error) {
      // Error handling is done in the parent component
      console.error("Upload failed:", error)
    }
  }

  const handleClose = () => {
    if (!isSubmitting) {
      setFiles([])
      onClose()
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Upload Documents</DialogTitle>
          <DialogDescription>
            Upload documents for: <strong>{clauseTitle}</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Dropzone */}
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragActive
                ? "border-[var(--primary-color)] bg-[var(--primary-color)]/5"
                : isSubmitting
                  ? "border-gray-200 bg-gray-50 cursor-not-allowed"
                  : "border-gray-300 hover:border-[var(--primary-color)]"
            }`}
          >
            <input {...getInputProps()} />
            <Upload className={`h-12 w-12 mx-auto mb-4 ${isSubmitting ? "text-gray-300" : "text-gray-400"}`} />
            {isDragActive ? (
              <p className="text-[var(--primary-color)]">Drop the files here...</p>
            ) : (
              <div>
                <p className={`mb-2 ${isSubmitting ? "text-gray-400" : "text-gray-600"}`}>
                  {isSubmitting ? "Uploading..." : "Drag & drop files here, or click to select"}
                </p>
                <p className="text-sm text-gray-500">Supported formats: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, Images</p>
                <p className="text-sm text-gray-500">Maximum file size: 10MB</p>
              </div>
            )}
          </div>

          {/* File List */}
          {files.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium text-gray-900">Selected Files ({files.length})</h4>
              <div className="max-h-40 overflow-y-auto space-y-2">
                {files.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <FileText className="h-4 w-4 text-gray-500" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{file.name}</p>
                        <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(index)}
                      disabled={isSubmitting}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Upload Progress */}
          {isSubmitting && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Uploading documents...</span>
                <span className="text-sm text-gray-600">Please wait</span>
              </div>
              <Progress value={75} className="h-2" />
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={files.length === 0 || isSubmitting}
            className="bg-[var(--primary-color)] hover:bg-[var(--primary-color)]/90"
          >
            {isSubmitting ? "Uploading..." : `Submit ${files.length} Document${files.length !== 1 ? "s" : ""}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
