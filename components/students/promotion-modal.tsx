"use client"

import type React from "react"

import { useState } from "react"
import { X, TrendingUp, GraduationCap } from "lucide-react"
import type { Student, ClassStructure, PromotionRequest } from "@/components/students/types"
import { promoteStudents } from "@/lib/api/students"
import { useToast } from "@/hooks/use-toast"

interface PromotionModalProps {
  isOpen: boolean
  onClose: () => void
  selectedStudents: Student[]
  classStructure: ClassStructure[]
  onSuccess: () => void
}

export function PromotionModal({ isOpen, onClose, selectedStudents, classStructure, onSuccess }: PromotionModalProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [promotionData, setPromotionData] = useState<PromotionRequest>({
    studentIds: selectedStudents.map((s) => s._id),
    toClass: "",
    toSection: "",
    academicYear: (new Date().getFullYear() + 1).toString(),
    notes: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setPromotionData((prev) => ({ ...prev, [name]: value }))

    // Update sections when class changes
    if (name === "toClass") {
      const selectedClass = classStructure.find((cls) => cls.className === value)
      if (selectedClass) {
        setPromotionData((prev) => ({ ...prev, toSection: selectedClass.sections[0] || "A" }))
      }
    }
  }

  const handlePromote = async () => {
    if (!promotionData.toClass || !promotionData.toSection) {
      toast({
        title: "Error",
        description: "Please select target class and section",
        variant: "destructive",
      })
      return
    }

    try {
      setLoading(true)
      await promoteStudents(promotionData)

      toast({
        title: "Success",
        description: `Successfully promoted ${selectedStudents.length} student(s)`,
      })

      onSuccess()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to promote students",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  const selectedClass = classStructure.find((cls) => cls.className === promotionData.toClass)
  const availableSections = selectedClass?.sections || []
  const isGraduation = selectedClass?.isGraduationClass || false

  // Get next available classes (excluding current classes of selected students)
  const currentClasses = [...new Set(selectedStudents.map((s) => s.class))]
  const availableClasses = classStructure
    .filter((cls) => !currentClasses.includes(cls.className))
    .sort((a, b) => Number.parseInt(a.className) - Number.parseInt(b.className))

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            {isGraduation ? (
              <GraduationCap className="h-6 w-6 text-purple-600" />
            ) : (
              <TrendingUp className="h-6 w-6 text-blue-600" />
            )}
            <h2 className="text-xl font-semibold text-[var(--accent-color)]">
              {isGraduation ? "Graduate Students" : "Promote Students"}
            </h2>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 transition-colors">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Selected Students Summary */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-2">Selected Students ({selectedStudents.length})</h3>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {selectedStudents.map((student) => (
                <div key={student._id} className="flex justify-between text-sm">
                  <span>{student.name}</span>
                  <span className="text-gray-500">
                    Grade {student.class}-{student.section} (Roll: {student.rollNumber})
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Promotion Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="toClass" className="block text-sm font-medium text-gray-700 mb-1">
                Target Class <span className="text-red-500">*</span>
              </label>
              <select
                id="toClass"
                name="toClass"
                value={promotionData.toClass}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent"
                required
              >
                <option value="">Select Class</option>
                {availableClasses.map((cls) => (
                  <option key={cls.className} value={cls.className}>
                    Grade {cls.className} {cls.isGraduationClass && "(Graduation Class)"}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="toSection" className="block text-sm font-medium text-gray-700 mb-1">
                Target Section <span className="text-red-500">*</span>
              </label>
              <select
                id="toSection"
                name="toSection"
                value={promotionData.toSection}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent"
                disabled={!promotionData.toClass}
                required
              >
                <option value="">Select Section</option>
                {availableSections.map((section) => (
                  <option key={section} value={section}>
                    Section {section}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label htmlFor="academicYear" className="block text-sm font-medium text-gray-700 mb-1">
                Academic Year
              </label>
              <select
                id="academicYear"
                name="academicYear"
                value={promotionData.academicYear}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent"
              >
                <option value={new Date().getFullYear().toString()}>
                  {new Date().getFullYear()}-{(new Date().getFullYear() + 1).toString().slice(-2)}
                </option>
                <option value={(new Date().getFullYear() + 1).toString()}>
                  {new Date().getFullYear() + 1}-{(new Date().getFullYear() + 2).toString().slice(-2)}
                </option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                Notes (Optional)
              </label>
              <textarea
                id="notes"
                name="notes"
                rows={3}
                value={promotionData.notes}
                onChange={handleChange}
                placeholder="Add any notes about this promotion..."
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent"
              />
            </div>
          </div>

          {/* Graduation Warning */}
          {isGraduation && (
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <GraduationCap className="h-5 w-5 text-purple-600" />
                <h4 className="font-medium text-purple-900">Graduation Notice</h4>
              </div>
              <p className="text-sm text-purple-700">
                Students will be marked as graduated and moved to the graduation class. This action cannot be undone.
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              onClick={handlePromote}
              disabled={loading || !promotionData.toClass || !promotionData.toSection}
              className={`px-4 py-2 rounded-lg text-white transition-colors ${
                isGraduation ? "bg-purple-600 hover:bg-purple-700" : "bg-blue-600 hover:bg-blue-700"
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Processing...</span>
                </div>
              ) : (
                <span>{isGraduation ? "Graduate Students" : "Promote Students"}</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
