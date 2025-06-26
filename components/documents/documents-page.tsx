"use client"

import type React from "react"
import { useState, useEffect } from "react"
import DocumentList  from "@/components/documents/document-list"
import { DocumentUploadModal } from "@/components/documents/document-upload-modal"
import { DocumentPreviewModal } from "@/components/documents/document-preview-modal"
import { EditDocumentModal } from "@/components/documents/edit-document-modal"
import { DocumentGrid } from "@/components/documents/document-grid"
import type { IDocument } from "@/models/document"
import type { DocumentCategory } from "@/components/documents/types"
import { useAuth } from "@/components/auth/auth-context"
import { DocumentAPI } from "@/lib/api/documents"
import { formatFileSize } from "@/lib/utils"
import {
  Search,
  Upload,
  RefreshCw,
  FileText,
  Calendar,
  Download,
  HardDrive,
  List,
  Grid3X3,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"

export function DocumentsPage() {
  const { user } = useAuth()
  const [documents, setDocuments] = useState<IDocument[]>([])
  const [selectedCategory, setSelectedCategory] = useState<DocumentCategory | "all">("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)
  const [selectedDocument, setSelectedDocument] = useState<IDocument | null>(null)
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [documentToEdit, setDocumentToEdit] = useState<IDocument | null>(null)
  const [dateFilter, setDateFilter] = useState<"all" | "recent" | "older">("all")
  const [typeFilter, setTypeFilter] = useState<"all" | "pdf" | "doc" | "xls" | "other">("all")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState({
    total: 0,
    thisMonth: 0,
    totalDownloads: 0,
    totalSize: 0,
  })

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalDocuments, setTotalDocuments] = useState(0)
  const [itemsPerPage] = useState(12) // 12 items per page for better grid layout

  const fetchDocuments = async (page: number = currentPage) => {
    try {
      setIsLoading(true)
      setError(null)

      const filters: any = {
        page,
        limit: itemsPerPage,
      }

      if (selectedCategory !== "all") {
        filters.category = selectedCategory
      }

      if (searchQuery.trim()) {
        filters.search = searchQuery.trim()
      }

      if (typeFilter !== "all") {
        filters.fileType = typeFilter
      }

      // Date filters
      if (dateFilter === "recent") {
        const thirtyDaysAgo = new Date()
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
        filters.dateFrom = thirtyDaysAgo.toISOString()
      } else if (dateFilter === "older") {
        const thirtyDaysAgo = new Date()
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
        filters.dateTo = thirtyDaysAgo.toISOString()
      }

      const response = await DocumentAPI.getDocuments(filters)

      if (response.documents) {
        setDocuments(response.documents)
        setCurrentPage(response.pagination.page)
        setTotalPages(response.pagination.pages)
        setTotalDocuments(response.pagination.total)
      }
    } catch (error) {
      console.error("Error fetching documents:", error)
      setError(error instanceof Error ? error.message : "Failed to fetch documents")
      setDocuments([])
    } finally {
      setIsLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await DocumentAPI.getDocumentStats()
      if (response.success) {
        setStats(response.data)
      }
    } catch (error) {
      console.error("Error fetching stats:", error)
    }
  }

  // Fetch documents on component mount and when filters change
  useEffect(() => {
    setCurrentPage(1) // Reset to first page when filters change
  }, [selectedCategory, searchQuery, dateFilter, typeFilter])

  useEffect(() => {
    fetchDocuments(currentPage)
  }, [currentPage, selectedCategory, searchQuery, dateFilter, typeFilter])

  useEffect(() => {
    fetchStats()
  }, [])

  const handleCategoryChange = (category: DocumentCategory | "all") => {
    setSelectedCategory(category)
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }

  const handleUploadSuccess = () => {
    fetchDocuments(currentPage)
    fetchStats()
    setIsUploadModalOpen(false)
  }

  const handlePreviewDocument = (document: IDocument) => {
    setSelectedDocument(document)
    setIsPreviewModalOpen(true)
  }

  const handleEditDocument = (document: IDocument) => {
    setDocumentToEdit(document)
    setIsEditModalOpen(true)
  }

  const handleEditSuccess = () => {
    fetchDocuments(currentPage)
    fetchStats()
    setIsEditModalOpen(false)
    setDocumentToEdit(null)
  }

  const handleDeleteDocument = async (document: IDocument) => {
    if (!window.confirm(`Are you sure you want to delete "${document.name}"? This action cannot be undone.`)) {
      return
    }

    try {
      await DocumentAPI.deleteDocument(document._id!)
      fetchDocuments(currentPage)
      fetchStats()
    } catch (error) {
      console.error("Error deleting document:", error)
      alert("Failed to delete document. Please try again.")
    }
  }

  const handleDateFilterChange = (filter: "all" | "recent" | "older") => {
    setDateFilter(filter)
  }

  const handleTypeFilterChange = (filter: "all" | "pdf" | "doc" | "xls" | "other") => {
    setTypeFilter(filter)
  }

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
    }
  }

  const handleRefresh = () => {
    fetchDocuments(currentPage)
    fetchStats()
  }

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages = []
    const maxVisiblePages = 5
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2))
    const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1)

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1)
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i)
    }

    return pages
  }

  return (
    <div className="flex-1 space-y-6 p-4 md:p-6 max-w-full overflow-hidden">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Document Hub</h1>
          <p className="text-gray-500 mt-1">
            Access and manage all documents, templates, policies, and reports
            {totalDocuments > 0 && ` (${totalDocuments} documents)`}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            disabled={isLoading}
            className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            title="Refresh"
          >
            <RefreshCw size={18} className={isLoading ? "animate-spin" : ""} />
          </button>

          {["super-admin", "school"].includes(user?.role || "") && (
            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="flex items-center gap-2 bg-[var(--primary-color)] hover:bg-[var(--primary-color)]/90 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <Upload size={18} />
              Upload Document
            </button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Documents</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <FileText className="h-8 w-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">This Month</p>
              <p className="text-2xl font-bold text-gray-900">{stats.thisMonth}</p>
            </div>
            <Calendar className="h-8 w-8 text-green-500" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Downloads</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalDownloads}</p>
            </div>
            <Download className="h-8 w-8 text-purple-500" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Storage Used</p>
              <p className="text-2xl font-bold text-gray-900">{formatFileSize(stats.totalSize)}</p>
            </div>
            <HardDrive className="h-8 w-8 text-orange-500" />
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600">{error}</p>
          <button onClick={handleRefresh} className="mt-2 text-red-600 hover:text-red-800 underline">
            Try again
          </button>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              <div className="relative flex-1 max-w-md">
                <input
                  type="text"
                  placeholder="Search documents..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] focus:border-[var(--primary-color)] outline-none transition-all"
                />
                <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>

              <div className="flex gap-2">
                <select
                  value={dateFilter}
                  onChange={(e) => handleDateFilterChange(e.target.value as "all" | "recent" | "older")}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] focus:border-[var(--primary-color)] outline-none transition-all bg-white"
                >
                  <option value="all">All Dates</option>
                  <option value="recent">Last 30 Days</option>
                  <option value="older">Older than 30 Days</option>
                </select>

                <select
                  value={typeFilter}
                  onChange={(e) => handleTypeFilterChange(e.target.value as "all" | "pdf" | "doc" | "xls" | "other")}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] focus:border-[var(--primary-color)] outline-none transition-all bg-white"
                >
                  <option value="all">All Types</option>
                  <option value="pdf">PDF</option>
                  <option value="doc">Word</option>
                  <option value="xls">Excel</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                title={viewMode === "grid" ? "Switch to list view" : "Switch to grid view"}
              >
                {viewMode === "grid" ? <List size={20} /> : <Grid3X3 size={20} />}
              </button>
            </div>
          </div>

          <div className="flex mt-4 border-b border-gray-200 overflow-x-auto">
            <button
              onClick={() => handleCategoryChange("all")}
              className={`px-4 py-2 font-medium text-sm whitespace-nowrap ${
                selectedCategory === "all"
                  ? "text-[var(--primary-color)] border-b-2 border-[var(--primary-color)]"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              All Documents
            </button>
            <button
              onClick={() => handleCategoryChange("template")}
              className={`px-4 py-2 font-medium text-sm whitespace-nowrap ${
                selectedCategory === "template"
                  ? "text-[var(--primary-color)] border-b-2 border-[var(--primary-color)]"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Templates
            </button>
            <button
              onClick={() => handleCategoryChange("policy")}
              className={`px-4 py-2 font-medium text-sm whitespace-nowrap ${
                selectedCategory === "policy"
                  ? "text-[var(--primary-color)] border-b-2 border-[var(--primary-color)]"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Policies
            </button>
            <button
              onClick={() => handleCategoryChange("report")}
              className={`px-4 py-2 font-medium text-sm whitespace-nowrap ${
                selectedCategory === "report"
                  ? "text-[var(--primary-color)] border-b-2 border-[var(--primary-color)]"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Reports
            </button>
            <button
              onClick={() => handleCategoryChange("form")}
              className={`px-4 py-2 font-medium text-sm whitespace-nowrap ${
                selectedCategory === "form"
                  ? "text-[var(--primary-color)] border-b-2 border-[var(--primary-color)]"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Forms
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
            <span className="ml-2 text-gray-500">Loading documents...</span>
          </div>
        ) : viewMode === "grid" ? (
          <DocumentGrid
            documents={documents}
            onView={handlePreviewDocument}
            onEdit={user?.role === "super-admin" || user?.role === "school" ? handleEditDocument : undefined}
            onDelete={user?.role === "super-admin" || user?.role === "school" ? handleDeleteDocument : undefined}
          />
        ) : (
          <DocumentList
            documents={documents}
            loading={isLoading}
            viewMode="list"
            onView={handlePreviewDocument}
            onEdit={user?.role === "super-admin" || user?.role === "school" ? handleEditDocument : undefined}
            onDelete={user?.role === "super-admin" || user?.role === "school" ? handleDeleteDocument : undefined}
            searchTerm={searchQuery}
            selectedCategory={selectedCategory}
          />
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, totalDocuments)}{" "}
                of {totalDocuments} documents
              </div>

              <div className="flex items-center space-x-2">
                {/* Previous button */}
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft size={16} className="mr-1" />
                  Previous
                </button>

                {/* Page numbers */}
                <div className="flex items-center space-x-1">
                  {getPageNumbers().map((page) => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`px-3 py-2 text-sm font-medium rounded-lg ${
                        page === currentPage
                          ? "bg-[var(--primary-color)] text-white"
                          : "text-gray-700 bg-white border border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>

                {/* Next button */}
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                  <ChevronRight size={16} className="ml-1" />
                </button>
              </div>
            </div>

            {/* Page size info */}
            <div className="mt-3 text-xs text-gray-500 text-center">{itemsPerPage} documents per page</div>
          </div>
        )}
      </div>

      {isUploadModalOpen && (
        <DocumentUploadModal
          isOpen={isUploadModalOpen}
          onClose={() => setIsUploadModalOpen(false)}
          onUpload={handleUploadSuccess}
        />
      )}

      {isPreviewModalOpen && selectedDocument && (
        <DocumentPreviewModal
          isOpen={isPreviewModalOpen}
          onClose={() => setIsPreviewModalOpen(false)}
          document={selectedDocument}
        />
      )}

      {isEditModalOpen && documentToEdit && (
        <EditDocumentModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onUpdate={handleEditSuccess}
          document={documentToEdit}
        />
      )}
    </div>
  )
}
