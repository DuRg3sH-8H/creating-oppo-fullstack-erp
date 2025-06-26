"use client"

import { motion } from "framer-motion"
import { TrainingCard } from "@/components/trainings/training-card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChevronLeft, ChevronRight, RefreshCw } from "lucide-react"
import type { Training } from "@/components/trainings/types"

interface TrainingsListProps {
  trainings: Training[]
  userRole: "super-admin" | "school" | "eca"
  onEdit: (training: Training) => void
  onDelete: (id: string) => void
  onRegister: (id: string) => void
  onUnregister: (id: string) => void
  isLoading: boolean
  error: string | null
  currentPage: number
  totalPages: number
  pageSize: number
  totalItems: number
  onPageChange: (page: number) => void
  onPageSizeChange: (size: number) => void
  searchTerm?: string
  selectedCategory?: string
  selectedTrainer?: string
}

export function TrainingsList({
  trainings,
  userRole,
  onEdit,
  onDelete,
  onRegister,
  onUnregister,
  isLoading,
  error,
  currentPage,
  totalPages,
  pageSize,
  totalItems,
  onPageChange,
  onPageSizeChange,
  searchTerm,
  selectedCategory,
  selectedTrainer,
}: TrainingsListProps) {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  }

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: pageSize }).map((_, index) => (
            <motion.div
              key={index}
              variants={item}
              initial="hidden"
              animate="show"
              transition={{ delay: index * 0.1 }}
              className="bg-gray-200 animate-pulse rounded-lg h-64"
            />
          ))}
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 text-lg mb-4">❌ {error}</div>
        <Button onClick={() => window.location.reload()} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Try Again
        </Button>
      </div>
    )
  }

  // Empty state
  if (trainings.length === 0) {
    const hasFilters = searchTerm || selectedCategory || selectedTrainer

    return (
      <div className="text-center py-16">
        <div className="max-w-md mx-auto">
          {hasFilters ? (
            <>
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No trainings match your search</h3>
              <p className="text-gray-500 mb-6">
                Try adjusting your search terms or filters to find what you're looking for.
              </p>
              <Button
                onClick={() => {
                  // This will be handled by parent component
                  window.dispatchEvent(new CustomEvent("clearTrainingFilters"))
                }}
                variant="outline"
              >
                Clear all filters
              </Button>
            </>
          ) : (
            <>
              <div className="text-6xl mb-4">📚</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No trainings available</h3>
              <p className="text-gray-500 mb-6">
                There are currently no training programs available. Check back later or contact your administrator.
              </p>
              <Button onClick={() => window.location.reload()} variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh page
              </Button>
            </>
          )}
        </div>
      </div>
    )
  }

  // Calculate pagination info
  const startItem = (currentPage - 1) * pageSize + 1
  const endItem = Math.min(currentPage * pageSize, totalItems)

  return (
    <div className="space-y-6">
      {/* Results info */}
      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-600">
          Showing {startItem} to {endItem} of {totalItems} trainings
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Show:</span>
          <Select value={pageSize.toString()} onValueChange={(value) => onPageSizeChange(Number.parseInt(value))}>
            <SelectTrigger className="w-20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5">5</SelectItem>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="20">20</SelectItem>
              <SelectItem value="50">50</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Training cards */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {trainings.map((training, index) => (
          <TrainingCard
            key={training.id}
            training={training}
            userRole={userRole}
            onEdit={onEdit}
            onDelete={onDelete}
            onRegister={onRegister}
            onUnregister={onUnregister}
            index={index}
          />
        ))}
      </motion.div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-8">
          <Button variant="outline" size="sm" onClick={() => onPageChange(currentPage - 1)} disabled={currentPage <= 1}>
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>

          <div className="flex gap-1">
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              let pageNum
              if (totalPages <= 5) {
                pageNum = i + 1
              } else if (currentPage <= 3) {
                pageNum = i + 1
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i
              } else {
                pageNum = currentPage - 2 + i
              }

              return (
                <Button
                  key={pageNum}
                  variant={currentPage === pageNum ? "default" : "outline"}
                  size="sm"
                  onClick={() => onPageChange(pageNum)}
                  className="w-10"
                >
                  {pageNum}
                </Button>
              )
            })}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  )
}
