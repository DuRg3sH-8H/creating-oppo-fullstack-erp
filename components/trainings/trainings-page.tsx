"use client"

import { useState, useEffect, useCallback } from "react"
import { Plus, Search, Filter, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrainingsList } from "@/components/trainings/trainings-list"
import { TrainingModal } from "@/components/trainings/training-modal"
import type { Training } from "@/components/trainings/types"
import {
  getTrainings,
  createTraining,
  updateTraining,
  deleteTraining,
  registerForTraining,
  unregisterFromTraining,
} from "@/lib/api/trainings"

interface TrainingsPageProps {
  userRole: "super-admin" | "school" | "eca"
}

export function TrainingsPage({ userRole }: TrainingsPageProps) {

  const [trainings, setTrainings] = useState<Training[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingTraining, setEditingTraining] = useState<Training | undefined>()

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [totalTrainings, setTotalTrainings] = useState(0)
  const [totalPages, setTotalPages] = useState(0)

  // Filter state
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("")
  const [selectedTrainer, setSelectedTrainer] = useState("")


 

  const loadTrainings = useCallback(async () => {
   
    setIsLoading(true)
    setError(null)

    try {
      const response = await getTrainings({
        page: currentPage,
        limit: pageSize,
        search: searchTerm || undefined,
        category: selectedCategory || undefined,
        trainer: selectedTrainer || undefined,
      })


      if (response.success && response.trainings) {
        setTrainings(response.trainings)
        setTotalTrainings(response.total || 0)
        setTotalPages(response.totalPages || 0)
      } else {
        setTrainings([])
        setTotalTrainings(0)
        setTotalPages(0)
        setError(response.error || "No trainings found")
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to load trainings")
      setTrainings([])
      setTotalTrainings(0)
      setTotalPages(0)
    } finally {
      setIsLoading(false)
    }
  }, [currentPage, pageSize, searchTerm, selectedCategory, selectedTrainer])

  // Load trainings on component mount and when dependencies change
  useEffect(() => {
    loadTrainings()
  }, [loadTrainings])

  // Add event listener for clearing filters
  useEffect(() => {
    const handleClearFilters = () => {
      setSearchTerm("")
      setSelectedCategory("")
      setSelectedTrainer("")
    }

    window.addEventListener("clearTrainingFilters", handleClearFilters)
    return () => window.removeEventListener("clearTrainingFilters", handleClearFilters)
  }, [])

  // Reset to first page when filters change
  useEffect(() => {
    if (currentPage !== 1) {
      setCurrentPage(1)
    }
  }, [searchTerm, selectedCategory, selectedTrainer])

  const handleCreateTraining = () => {
    setEditingTraining(undefined)
    setIsModalOpen(true)
  }

  const handleEditTraining = (training: Training) => {
    setEditingTraining(training)
    setIsModalOpen(true)
  }

  const handleSaveTraining = async (trainingData: Training) => {
    try {
      if (editingTraining) {
        // Update existing training
        const response = await updateTraining(editingTraining.id, trainingData)
        if (response.success) {
          setIsModalOpen(false)
          loadTrainings() // Reload the list
        } else {
          alert(`Failed to update training: ${response.error}`)
        }
      } else {
        // Create new training
        const response = await createTraining(trainingData)
        if (response.success) {
          alert("✅ Training created successfully")
          setIsModalOpen(false)
          loadTrainings() // Reload the list
        } else {
          alert(`Failed to create training: ${response.error}`)
        }
      }
    } catch (error) {
      alert(`Error saving training: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  }

  const handleDeleteTraining = async (id: string) => {

    if (!confirm("Are you sure you want to delete this training?")) {
      return
    }

    try {
      const response = await deleteTraining(id)
      if (response.success) {
        loadTrainings() // Reload the list
      } else {
        alert(`Failed to delete training: ${response.error}`)
      }
    } catch (error) {
      alert(`Error deleting training: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  }

  const handleRegisterTraining = async (id: string) => {

    try {
      const response = await registerForTraining(id)
      if (response.success) {
        loadTrainings() // Reload to update registration status
      } else {
        alert(`Failed to register for training: ${response.error}`)
      }
    } catch (error) {
      alert(`Error registering for training: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  }

  const handleUnregisterTraining = async (id: string) => {

    try {
      const response = await unregisterFromTraining(id)
      if (response.success) {
        loadTrainings() // Reload to update registration status
      } else {
        alert(`Failed to unregister from training: ${response.error}`)
      }
    } catch (error) {
      alert(`Error unregistering from training: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handlePageSizeChange = (size: number) => {
    setPageSize(size)
    setCurrentPage(1) // Reset to first page
  }

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentPage !== 1) {
        setCurrentPage(1)
      } else {
        loadTrainings()
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [searchTerm])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Training Management</h1>
          <p className="text-gray-600 mt-1">Manage and participate in training programs</p>
        </div>
        {userRole === "super-admin" && (
          <Button onClick={handleCreateTraining} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Training
          </Button>
        )}
      </div>

     

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search by title, description, or trainer..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-10"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              )}
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="Professional Development">Professional Development</SelectItem>
                <SelectItem value="ISO Training">ISO Training</SelectItem>
                <SelectItem value="Technical Skills">Technical Skills</SelectItem>
                <SelectItem value="Leadership">Leadership</SelectItem>
                <SelectItem value="Compliance">Compliance</SelectItem>
              </SelectContent>
            </Select>
            <div className="relative">
              <Input
                placeholder="Filter by trainer name..."
                value={selectedTrainer}
                onChange={(e) => setSelectedTrainer(e.target.value)}
                className="pr-10"
              />
              {selectedTrainer && (
                <button
                  onClick={() => setSelectedTrainer("")}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              )}
            </div>
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm("")
                setSelectedCategory("")
                setSelectedTrainer("")
              }}
              className="flex items-center gap-2"
            >
              <Filter className="h-4 w-4" />
              Clear All Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Training List */}
      <TrainingsList
        trainings={trainings}
        userRole={userRole}
        onEdit={handleEditTraining}
        onDelete={handleDeleteTraining}
        onRegister={handleRegisterTraining}
        onUnregister={handleUnregisterTraining}
        isLoading={isLoading}
        error={error}
        currentPage={currentPage}
        totalPages={totalPages}
        pageSize={pageSize}
        totalItems={totalTrainings}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        searchTerm={searchTerm}
        selectedCategory={selectedCategory}
        selectedTrainer={selectedTrainer}
      />

      {/* Training Modal */}
      <TrainingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveTraining}
        title={editingTraining ? "Edit Training" : "Add New Training"}
        training={editingTraining}
      />
    </div>
  )
}
