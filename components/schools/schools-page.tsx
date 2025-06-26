"use client"

import { useState, useCallback, useEffect } from "react"
import { motion } from "framer-motion"
import { Plus, AlertCircle, Loader2, Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { SchoolsList } from "@/components/schools/schools-list"
import { SchoolModal } from "@/components/schools/school-modal"
import type { School } from "@/components/schools/types"
import { useTheme } from "@/components/theme-context"
import { useRouter } from "next/navigation"
import { useLanguage } from "@/components/language-context"
import { fetchSchools, createSchool, updateSchool, deleteSchool, toggleSchoolStatus } from "@/lib/api/schools"

export function SchoolsPage() {
  const [schools, setSchools] = useState<School[]>([]) // Initialize as empty array
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [editingSchool, setEditingSchool] = useState<School | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showInactive, setShowInactive] = useState(false)
  const { setSchoolTheme } = useTheme()
  const router = useRouter()
  const { t } = useLanguage()

  // Load schools from backend
  const loadSchools = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetchSchools()
      // Ensure we always get an array
      const schoolsArray = Array.isArray(response.schools) ? response.schools : []
      setSchools(schoolsArray)
    } catch (err) {
      console.error("🏫 Failed to load schools:", err)
      setError(err instanceof Error ? err.message : "Failed to load schools")
      setSchools([]) // Set empty array on error
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Load schools on component mount
  useEffect(() => {
    loadSchools()
  }, [loadSchools])

  const handleAddSchool = async (newSchool: Omit<School, "id">) => {
    try {
      setIsSubmitting(true)
      setError(null)
      const createdSchool = await createSchool(newSchool)
      setSchools((prev) => (Array.isArray(prev) ? [...prev, createdSchool] : [createdSchool]))
      setIsAddModalOpen(false)
    } catch (err) {
      console.error("Failed to create school:", err)
      setError(err instanceof Error ? err.message : "Failed to create school")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEditSchool = async (updatedSchool: School) => {
    try {
      setIsSubmitting(true)
      setError(null)
      await updateSchool(updatedSchool.id, updatedSchool)
      setSchools((prev) =>
        Array.isArray(prev)
          ? prev.map((school) => (school.id === updatedSchool.id ? updatedSchool : school))
          : [updatedSchool],
      )
      setEditingSchool(null)
    } catch (err) {
      console.error("Failed to update school:", err)
      setError(err instanceof Error ? err.message : "Failed to update school")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteSchool = async (id: string) => {
    if (!confirm("Are you sure you want to permanently delete this school? This action cannot be undone.")) {
      return
    }

    try {
      setError(null)
      await deleteSchool(id)
      setSchools((prev) => (Array.isArray(prev) ? prev.filter((school) => school.id !== id) : []))
    } catch (err) {
      console.error("Failed to delete school:", err)
      setError(err instanceof Error ? err.message : "Failed to delete school")
    }
  }

  const handleToggleStatus = async (id: string) => {
    try {
      setError(null)
      const result = await toggleSchoolStatus(id)
      setSchools((prev) =>
        Array.isArray(prev)
          ? prev.map((school) => (school.id === id ? { ...school, isActive: result.isActive } : school))
          : [],
      )
    } catch (err) {
      console.error("Failed to toggle school status:", err)
      setError(err instanceof Error ? err.message : "Failed to update school status")
    }
  }

  // For demo - preview school theme
  const handlePreviewTheme = useCallback(
    (school: School) => {
      // Apply the theme temporarily
      setSchoolTheme(school)

      // Show alert
      alert(`Previewing theme for ${school.name}. Navigate to another page to see the theme applied.`)

      // Navigate to dashboard to see the theme
      router.push("/dashboard")
    },
    [router, setSchoolTheme],
  )

  // Ensure schools is always an array before filtering
  const schoolsArray = Array.isArray(schools) ? schools : []

  // Count active and inactive schools with safety checks
  const activeCount = schoolsArray.filter((school) => school?.isActive === true).length
  const inactiveCount = schoolsArray.filter((school) => school?.isActive === false).length

  // Filter schools based on showInactive flag
  const filteredSchools = showInactive ? schoolsArray : schoolsArray.filter((school) => school?.isActive !== false)

  if (isLoading) {
    return (
      <div className="p-4 md:p-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-gray-600">Loading schools...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <h1 className="text-2xl font-bold text-blue-900 mb-2">{t("schools_management")}</h1>
          <div className="flex gap-2">
            <Badge variant="secondary" className="bg-green-100 text-green-700">
              {activeCount} Active
            </Badge>
            {inactiveCount > 0 && (
              <Badge variant="secondary" className="bg-red-100 text-red-700">
                {inactiveCount} Inactive
              </Badge>
            )}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="flex gap-2"
        >
          <Button
            variant="outline"
            onClick={() => setShowInactive(!showInactive)}
            className={`${showInactive ? "bg-blue-50 text-blue-600 border-blue-300" : "text-gray-600 border-gray-300"}`}
          >
            {showInactive ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
            {showInactive ? "Hide Inactive" : "Show Inactive"}
          </Button>

          <Button
            onClick={() => setIsAddModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white"
            disabled={isSubmitting}
          >
            <Plus className="h-4 w-4 mr-2" />
            {t("add_school")}
          </Button>
        </motion.div>
      </div>

      {error && (
        <Alert className="mb-6 border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            {error}
            <Button variant="link" size="sm" onClick={loadSchools} className="ml-2 p-0 h-auto text-red-600 underline">
              Try again
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {filteredSchools.length === 0 && !isLoading ? (
        <div className="text-center py-12">
          <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <Plus className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No schools found</h3>
          <p className="text-gray-500 mb-4">
            {showInactive ? "No schools match your current filter." : "Get started by adding your first school."}
          </p>
          {!showInactive && (
            <Button onClick={() => setIsAddModalOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white">
              <Plus className="h-4 w-4 mr-2" />
              Add School
            </Button>
          )}
        </div>
      ) : (
        <SchoolsList
          schools={filteredSchools}
          onEdit={setEditingSchool}
          onDelete={handleDeleteSchool}
          onToggleStatus={handleToggleStatus}
          onPreviewTheme={handlePreviewTheme}
        />
      )}

      <SchoolModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleAddSchool}
        title={t("add_new_school")}
        isSubmitting={isSubmitting}
      />

      {editingSchool && (
        <SchoolModal
          isOpen={!!editingSchool}
          onClose={() => setEditingSchool(null)}
          onSave={handleEditSchool}
          school={editingSchool}
          title={t("edit_school")}
          isSubmitting={isSubmitting}
        />
      )}
    </div>
  )
}
