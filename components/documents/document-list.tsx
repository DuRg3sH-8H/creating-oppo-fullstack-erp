"use client"

import { useState } from "react"
import type { IDocument } from "@/models/document"
import { Download, Eye, Trash, FileText, FileImage, FileSpreadsheet, Edit } from "lucide-react"
import { motion } from "framer-motion"
import { useAuth } from "@/components/auth/auth-context"
import DocumentCard from "./document-card"

interface DocumentListProps {
  documents: IDocument[]
  loading: boolean
  viewMode: "grid" | "list"
  onView: (document: IDocument) => void
  onEdit?: (document: IDocument) => void
  onDelete?: (document: IDocument) => void
  searchTerm: string
  selectedCategory: string
}

export default function DocumentList({
  documents,
  loading,
  viewMode,
  onView,
  onEdit,
  onDelete,
  searchTerm,
  selectedCategory,
}: DocumentListProps) {
  const { user } = useAuth()
  const [hoveredRow, setHoveredRow] = useState<string | null>(null)
  const [downloadingId, setDownloadingId] = useState<string | null>(null)

  const getFileIcon = (fileType: string) => {
    switch (fileType.toLowerCase()) {
      case "pdf":
        return <FileText className="h-5 w-5 text-red-500" />
      case "doc":
      case "docx":
        return <FileText className="h-5 w-5 text-blue-500" />
      case "xls":
      case "xlsx":
        return <FileSpreadsheet className="h-5 w-5 text-green-500" />
      case "jpg":
      case "jpeg":
      case "png":
      case "gif":
        return <FileImage className="h-5 w-5 text-purple-500" />
      default:
        return <FileText className="h-5 w-5 text-gray-500" />
    }
  }

  const formatDate = (dateString: string | Date) => {
    const date = new Date(dateString)

    // Check if date is valid
    if (isNaN(date.getTime())) {
      return "Invalid Date"
    }

    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(date)
  }

  const isNewDocument = (dateString: string | Date) => {
    const uploadDate = new Date(dateString)

    // Check if date is valid
    if (isNaN(uploadDate.getTime())) {
      return false
    }

    const currentDate = new Date()
    const diffTime = Math.abs(currentDate.getTime() - uploadDate.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays <= 7
  }

  const formatFileSize = (sizeInBytes: number) => {
    if (sizeInBytes < 1024) {
      return `${sizeInBytes} B`
    } else if (sizeInBytes < 1024 * 1024) {
      return `${(sizeInBytes / 1024).toFixed(1)} KB`
    } else {
      return `${(sizeInBytes / (1024 * 1024)).toFixed(1)} MB`
    }
  }

  const handleDownload = async (document: IDocument) => {
    try {
      setDownloadingId(document._id!)

      const response = await fetch(`/api/documents/${document._id}/download`, {
        credentials: "include",
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Download failed: ${response.statusText} - ${errorText}`)
      }

      // Create blob and download
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = window.document.createElement("a")
      link.href = url
      link.download = document.originalName
      link.style.display = "none"
      window.document.body.appendChild(link)
      link.click()

      // Cleanup after a short delay
      setTimeout(() => {
        window.URL.revokeObjectURL(url)
        if (window.document.body.contains(link)) {
          window.document.body.removeChild(link)
        }
      }, 100)
    } catch (error) {
      console.error("Error downloading document:", error)
      alert(`Failed to download document: ${error instanceof Error ? error.message : "Unknown error"}`)
    } finally {
      setDownloadingId(null)
    }
  }

  const handleEdit = (document: IDocument) => {
    if (onEdit) {
      onEdit(document)
    }
  }

  const handleDelete = (document: IDocument) => {
    if (onDelete) {
      onDelete(document)
    }
  }

  // Check if user can perform admin actions
  const canPerformAdminActions = user?.role === "super-admin"


  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--primary-color)]"></div>
      </div>
    )
  }

  if (documents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <FileText className="h-16 w-16 text-gray-300 mb-4" />
        <h3 className="text-lg font-medium text-gray-900">No documents found</h3>
        <p className="text-gray-500 mt-1">
          {searchTerm || selectedCategory !== "all" ? "Try adjusting your filters" : "Upload a document to get started"}
        </p>
      </div>
    )
  }

  if (viewMode === "grid") {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4">
        {documents.map((document) => (
          <DocumentCard
            key={document._id}
            document={document}
            onView={onView}
            onEdit={canPerformAdminActions ? handleEdit : undefined}
            onDelete={canPerformAdminActions ? handleDelete : undefined}
          />
        ))}
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Document
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Category
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Version
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Size
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Uploaded
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {documents.map((document, index) => (
            <motion.tr
              key={document._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              onMouseEnter={() => setHoveredRow(document._id!)}
              onMouseLeave={() => setHoveredRow(null)}
              className={`${hoveredRow === document._id ? "bg-gray-50" : ""} transition-colors duration-150`}
            >
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-lg bg-gray-100">
                    {getFileIcon(document.fileType)}
                  </div>
                  <div className="ml-4">
                    <div className="flex items-center">
                      <div className="text-sm font-medium text-gray-900">{document.name}</div>
                      {isNewDocument(document.createdAt) && (
                        <span className="ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          New
                        </span>
                      )}
                      {!document.isPublic && (
                        <span className="ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                          Private
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-500 max-w-md truncate">{document.description}</div>
                    <div className="text-xs text-gray-400">by {document.uploadedBy.name}</div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span
                  className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    document.category === "template"
                      ? "bg-purple-100 text-purple-800"
                      : document.category === "policy"
                        ? "bg-blue-100 text-blue-800"
                        : document.category === "report"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-green-100 text-green-800"
                  }`}
                >
                  {document.category.charAt(0).toUpperCase() + document.category.slice(1)}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">v{document.version}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatFileSize(document.fileSize)}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(document.createdAt)}</td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div className="flex items-center justify-end space-x-3">
                  <button
                    onClick={() => onView(document)}
                    className="text-[var(--primary-color)] hover:text-[var(--primary-color)]/80 transition-colors"
                    title="Preview"
                  >
                    <Eye className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleDownload(document)}
                    disabled={downloadingId === document._id}
                    className="text-[var(--primary-color)] hover:text-[var(--primary-color)]/80 transition-colors disabled:opacity-50"
                    title="Download"
                  >
                    <Download className={`h-5 w-5 ${downloadingId === document._id ? "animate-spin" : ""}`} />
                  </button>
                  {canPerformAdminActions && (
                    <>
                      <button
                        onClick={() => handleEdit(document)}
                        className="text-blue-500 hover:text-blue-700 transition-colors"
                        title="Edit (Super Admin Only)"
                      >
                        <Edit className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(document)}
                        className="text-red-500 hover:text-red-700 transition-colors"
                        title="Delete (Super Admin Only)"
                      >
                        <Trash className="h-5 w-5" />
                      </button>
                    </>
                  )}
                </div>
              </td>
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
