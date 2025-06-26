"use client"

import { X, Download, FileText } from "lucide-react"
import type { IDocument } from "@/models/document"
import { useState } from "react"

interface DocumentPreviewModalProps {
  isOpen: boolean
  onClose: () => void
  document: IDocument
}

export function DocumentPreviewModal({ isOpen, onClose, document }: DocumentPreviewModalProps) {
  const [isDownloading, setIsDownloading] = useState(false)

  const formatDate = (dateString: string | Date) => {
    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) {
        return "Invalid Date"
      }
      return new Intl.DateTimeFormat("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }).format(date)
    } catch (error) {
      return "Invalid Date"
    }
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

  const handleDownload = async () => {
    try {
      setIsDownloading(true)

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
      link.style.display = "none"
      window.document.body.appendChild(link)
      link.click()

      // Cleanup
      setTimeout(() => {
        window.URL.revokeObjectURL(url)
        window.document.body.removeChild(link)
      }, 100)
    } catch (error) {
      console.error("Error downloading document:", error)
      alert(`Failed to download document: ${error instanceof Error ? error.message : "Unknown error"}`)
    } finally {
      setIsDownloading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl h-[90vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">{document.name}</h2>
            <p className="text-sm text-gray-500 mt-1">
              {document.category.charAt(0).toUpperCase() + document.category.slice(1)} • Version {document.version}
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500 transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
          <div className="flex-1 bg-gray-100 overflow-hidden flex items-center justify-center p-4">
            {document.fileType === "pdf" ? (
              <iframe
                src={`${document.filePath}#toolbar=0`}
                className="w-full h-full border-0 rounded-lg shadow-sm"
                title={document.name}
              />
            ) : document.fileType.match(/^(jpg|jpeg|png|gif)$/i) ? (
              <img
                src={document.filePath || "/placeholder.svg"}
                alt={document.name}
                className="max-w-full max-h-full object-contain rounded-lg shadow-sm"
              />
            ) : (
              <div className="flex flex-col items-center justify-center text-center p-8 bg-white rounded-lg shadow-sm w-full max-w-md mx-auto">
                <FileText className="h-20 w-20 text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900">Preview not available</h3>
                <p className="text-gray-500 mt-1 mb-4">
                  This file type cannot be previewed. Please download the file to view its contents.
                </p>
                <button
                  onClick={handleDownload}
                  disabled={isDownloading}
                  className="px-4 py-2 bg-[var(--primary-color)] hover:bg-[var(--primary-color)]/90 text-white rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  <Download size={18} className={isDownloading ? "animate-spin" : ""} />
                  {isDownloading ? "Downloading..." : "Download"}
                </button>
              </div>
            )}
          </div>

          <div className="w-full md:w-80 border-t md:border-t-0 md:border-l border-gray-200 p-4 overflow-y-auto">
            <h3 className="font-medium text-gray-900 mb-4">Document Information</h3>

            <div className="space-y-4">
              <div>
                <p className="text-xs text-gray-500">Description</p>
                <p className="text-sm text-gray-900 mt-1">{document.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500">Uploaded By</p>
                  <p className="text-sm text-gray-900 mt-1">{document.uploadedBy.name}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Upload Date</p>
                  <p className="text-sm text-gray-900 mt-1">{formatDate(document.createdAt)}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500">File Type</p>
                  <p className="text-sm text-gray-900 mt-1 uppercase">{document.fileType}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">File Size</p>
                  <p className="text-sm text-gray-900 mt-1">{formatFileSize(document.fileSize)}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500">Downloads</p>
                  <p className="text-sm text-gray-900 mt-1">{document.downloadCount || 0}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Visibility</p>
                  <p className="text-sm text-gray-900 mt-1">{document.isPublic ? "Public" : "Private"}</p>
                </div>
              </div>

              {document.tags && document.tags.length > 0 && (
                <div>
                  <p className="text-xs text-gray-500">Tags</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {document.tags.map((tag, index) => (
                      <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <p className="text-xs text-gray-500">Status</p>
                <div className="mt-1">
                  <span className="px-2 py-1 inline-flex text-xs leading-4 font-semibold rounded-full bg-green-100 text-green-800">
                    Active
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <button
                onClick={handleDownload}
                disabled={isDownloading}
                className="w-full px-4 py-2 bg-[var(--primary-color)] hover:bg-[var(--primary-color)]/90 text-white rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Download size={18} className={isDownloading ? "animate-spin" : ""} />
                {isDownloading ? "Downloading..." : "Download Document"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
