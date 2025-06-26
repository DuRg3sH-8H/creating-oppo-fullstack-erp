"use client"

import type React from "react"
import { useState } from "react"
import type { IDocument } from "@/models/document"
import { Eye, Edit, Trash, FileText, FileImage, FileSpreadsheet, Download } from "lucide-react"
import { safeFormatDate, formatFileSize } from "@/lib/utils"
import { useAuth } from "@/components/auth/auth-context"

interface DocumentCardProps {
  document: IDocument
  onView: (document: IDocument) => void
  onEdit?: (document: IDocument) => void
  onDelete?: (document: IDocument) => void
}

export default function DocumentCard({ document, onView, onEdit, onDelete }: DocumentCardProps) {
  const { user } = useAuth()
  const [, setIsHovered] = useState(false)
  const [downloadingId, setDownloadingId] = useState<string | null>(null)

  const getFileIcon = (fileType: string) => {
    switch (fileType.toLowerCase()) {
      case "pdf":
        return <FileText className="h-8 w-8 text-red-500" />
      case "doc":
      case "docx":
        return <FileText className="h-8 w-8 text-blue-500" />
      case "xls":
      case "xlsx":
        return <FileSpreadsheet className="h-8 w-8 text-green-500" />
      case "jpg":
      case "jpeg":
      case "png":
      case "gif":
        return <FileImage className="h-8 w-8 text-purple-500" />
      default:
        return <FileText className="h-8 w-8 text-gray-500" />
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "template":
        return "bg-purple-100 text-purple-800"
      case "policy":
        return "bg-blue-100 text-blue-800"
      case "report":
        return "bg-yellow-100 text-yellow-800"
      case "form":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      setDownloadingId(document._id!)

      const response = await fetch(`/api/documents/${document._id}/download`, {
        credentials: "include",
      })

      if (!response.ok) {
        throw new Error(`Download failed: ${response.statusText}`)
      }

      // Create blob and download
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = window.document.createElement("a")
      link.href = url
      link.download = document.originalName
      window.document.body.appendChild(link)
      link.click()
      window.URL.revokeObjectURL(url)
      window.document.body.removeChild(link)
    } catch (error) {
      console.error("Error downloading document:", error)
      alert(`Failed to download document: ${error instanceof Error ? error.message : "Unknown error"}`)
    } finally {
      setDownloadingId(null)
    }
  }

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (onEdit) {
      onEdit(document)
    }
  }

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (onDelete) {
      onDelete(document)
    }
  }

  // Check if user can perform admin actions
  const canPerformAdminActions = user?.role === "super-admin"


  return (
    <div
      className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onView(document)}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">{getFileIcon(document.fileType)}</div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-medium text-gray-900 truncate">{document.name}</h3>
            <p className="text-xs text-gray-500 truncate">{document.description}</p>
          </div>
        </div>
        <div className="flex items-center space-x-1">
          <button
            onClick={(e) => {
              e.stopPropagation()
              onView(document)
            }}
            className="p-1 text-gray-400 hover:text-blue-500 transition-colors"
            title="View"
          >
            <Eye className="h-4 w-4" />
          </button>
          <button
            onClick={handleDownload}
            disabled={downloadingId === document._id}
            className="p-1 text-gray-400 hover:text-green-500 transition-colors disabled:opacity-50"
            title="Download"
          >
            <Download className={`h-4 w-4 ${downloadingId === document._id ? "animate-spin" : ""}`} />
          </button>
          {canPerformAdminActions && (
            <>
              <button
                onClick={handleEdit}
                className="p-1 text-gray-400 hover:text-yellow-500 transition-colors"
                title="Edit (Super Admin Only)"
              >
                <Edit className="h-4 w-4" />
              </button>
              <button
                onClick={handleDelete}
                className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                title="Delete (Super Admin Only)"
              >
                <Trash className="h-4 w-4" />
              </button>
            </>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between mb-2">
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(document.category)}`}>
          {document.category.charAt(0).toUpperCase() + document.category.slice(1)}
        </span>
        <span className="text-xs text-gray-500">v{document.version}</span>
      </div>

      <div className="flex items-center justify-between text-xs text-gray-500">
        <span>{formatFileSize(document.fileSize)}</span>
        <span>{safeFormatDate(document.createdAt)}</span>
      </div>

      <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
        <span>by {document.uploadedBy.name}</span>
        <div className="flex items-center space-x-1">
          {!document.isPublic && <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full">Private</span>}
          {canPerformAdminActions && <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full">Admin</span>}
        </div>
      </div>
    </div>
  )
}
    