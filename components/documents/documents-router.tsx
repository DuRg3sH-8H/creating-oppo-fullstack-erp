"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRole } from "@/components/role-context"
import DocumentList from "@/components/documents/document-list"
import { DocumentUploadModal } from "@/components/documents/document-upload-modal"
import { DocumentPreviewModal } from "@/components/documents/document-preview-modal"
import type { IDocument } from "@/models/document"
import type { DocumentCategory } from "@/components/documents/types"
import { DocumentAPI } from "@/lib/api/documents"
import { Search, Upload, Filter, RefreshCw, ChevronLeft, ChevronRight } from "lucide-react"

export function DocumentsRouter() {
  const { userRole } = useRole()
  const [documents, setDocuments] = useState<IDocument[]>([])
  const [selectedCategory, setSelectedCategory] = useState<DocumentCategory | "all">("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)
  const [selectedDocument, setSelectedDocument] = useState<IDocument | null>(null)
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false)
  const [dateFilter, setDateFilter] = useState<"all" | "recent" | "older">("all")
  const [typeFilter, setTypeFilter] = useState<"all" | "pdf" | "doc" | "xls" | "other">("all")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalDocuments, setTotalDocuments] = useState(0)
  const [itemsPerPage] = useState(10) // Fixed items per page

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

  // Fetch documents on component mount and when filters change
  useEffect(() => {
    setCurrentPage(1) // Reset to first page when filters change
  }, [selectedCategory, searchQuery, dateFilter, typeFilter])

  useEffect(() => {
    fetchDocuments(currentPage)
  }, [currentPage, selectedCategory, searchQuery, dateFilter, typeFilter])

  const handleCategoryChange = (category: DocumentCategory | "all") => {
    setSelectedCategory(category)
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }

  const handleUploadDocument = () => {
    // Refresh documents after upload
    fetchDocuments(currentPage)
    setIsUploadModalOpen(false)
  }

  const handlePreviewDocument = (document: IDocument) => {
    setSelectedDocument(document)
    setIsPreviewModalOpen(true)
  }

  const handleDateFilterChange = (filter: "all" | "recent" | "older") => {
    setDateFilter(filter)
  }

  const handleTypeFilterChange = (filter: "all" | "pdf" | "doc" | "xls" | "other") => {
    setTypeFilter(filter)
  }

  const handleEditDocument = (document: IDocument) => {
    if (userRole !== "super-admin") {
      alert("Only super administrators can edit documents.")
      return
    }
    // TODO: Implement edit functionality
  }

  const handleDeleteDocument = async (document: IDocument) => {
    if (userRole !== "super-admin") {
      alert("Only super administrators can delete documents.")
      return
    }

    if (window.confirm(`Are you sure you want to delete "${document.name}"?`)) {
      try {
        await DocumentAPI.deleteDocument(document._id!)
        // Refresh documents after deletion
        fetchDocuments(currentPage)
      } catch (error) {
        console.error("Error deleting document:", error)
        alert("Failed to delete document. Please try again.")
      }
    }
  }

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
    }
  }

  const handleRefresh = () => {
    fetchDocuments(currentPage)
  }

  // Check if user can upload documents (super-admin only)
  const canUploadDocuments = userRole === "super-admin"

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
    <main className="flex-1 overflow-y-auto p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Document Hub</h1>
            <p className="text-gray-500 mt-1">
              Access and manage all documents, templates, policies, and reports
              {totalDocuments > 0 && ` (${totalDocuments} documents)`}
            </p>
          </div>

          <div className="flex items-center gap-3 mt-4 md:mt-0">
            <button
              onClick={handleRefresh}
              disabled={isLoading}
              className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              title="Refresh"
            >
              <RefreshCw size={18} className={isLoading ? "animate-spin" : ""} />
            </button>

            {canUploadDocuments && (
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

        {!canUploadDocuments && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-700">
              <strong>Note:</strong> Only super administrators can upload, edit, or delete documents. You can view and
              download documents.
            </p>
          </div>
        )}

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600">{error}</p>
            <button onClick={handleRefresh} className="mt-2 text-red-600 hover:text-red-800 underline">
              Try again
            </button>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-200">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search documents..."
                    value={searchQuery}
                    onChange={handleSearchChange}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] focus:border-[var(--primary-color)] outline-none transition-all"
                  />
                  <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                </div>
              </div>

              <div className="flex flex-col md:flex-row gap-2">
                <div className="relative">
                  <select
                    value={dateFilter}
                    onChange={(e) => handleDateFilterChange(e.target.value as "all" | "recent" | "older")}
                    className="appearance-none pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] focus:border-[var(--primary-color)] outline-none transition-all bg-white"
                  >
                    <option value="all">All Dates</option>
                    <option value="recent">Last 30 Days</option>
                    <option value="older">Older than 30 Days</option>
                  </select>
                  <Filter className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                </div>

                <div className="relative">
                  <select
                    value={typeFilter}
                    onChange={(e) => handleTypeFilterChange(e.target.value as "all" | "pdf" | "doc" | "xls" | "other")}
                    className="appearance-none pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] focus:border-[var(--primary-color)] outline-none transition-all bg-white"
                  >
                    <option value="all">All Types</option>
                    <option value="pdf">PDF</option>
                    <option value="doc">Word</option>
                    <option value="xls">Excel</option>
                    <option value="other">Other</option>
                  </select>
                  <Filter className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                </div>
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

          <DocumentList
            documents={documents}
            loading={isLoading}
            viewMode="list"
            onView={handlePreviewDocument}
            onEdit={handleEditDocument}
            onDelete={handleDeleteDocument}
            searchTerm={searchQuery}
            selectedCategory={selectedCategory}
          />

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
                  {Math.min(currentPage * itemsPerPage, totalDocuments)} of {totalDocuments} documents
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
      </div>

      {isUploadModalOpen && (
        <DocumentUploadModal
          isOpen={isUploadModalOpen}
          onClose={() => setIsUploadModalOpen(false)}
          onUpload={handleUploadDocument}
        />
      )}

      {isPreviewModalOpen && selectedDocument && (
        <DocumentPreviewModal
          isOpen={isPreviewModalOpen}
          onClose={() => setIsPreviewModalOpen(false)}
          document={selectedDocument}
        />
      )}
    </main>
  )
}
