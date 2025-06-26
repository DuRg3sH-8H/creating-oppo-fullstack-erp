"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { X, Upload } from "lucide-react"
import type { Student, ClassStructure } from "@/components/students/types"
import Image from "next/image"

interface EditStudentModalProps {
  isOpen: boolean
  onClose: () => void
  student: Student
  onEdit: (student: Student) => void
  classStructure?: ClassStructure[]
}

export function EditStudentModal({ isOpen, onClose, student, onEdit, classStructure = [] }: EditStudentModalProps) {
  const [formData, setFormData] = useState<Student>(student)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [photoPreview, setPhotoPreview] = useState<string>(student.photo || "")

  useEffect(() => {
    if (isOpen) {
      setFormData(student)
      setPhotoPreview(student.photo || "")
      setErrors({})
    }
  }, [isOpen, student])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    // Clear error when field is edited
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }

    // Update sections when class changes
    if (name === "class" && classStructure.length > 0) {
      const selectedClass = classStructure.find((cls) => cls.className === value)
      if (selectedClass) {
        setFormData((prev) => ({ ...prev, section: selectedClass.sections[0] || "A" }))
      }
    }
  }

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        const result = reader.result as string
        setPhotoPreview(result)
        setFormData((prev) => ({ ...prev, photo: result }))
      }
      reader.readAsDataURL(file)
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) newErrors.name = "Name is required"
    if (!formData.dateOfBirth) newErrors.dateOfBirth = "Date of birth is required"
    if (!formData.rollNumber.trim()) newErrors.rollNumber = "Roll number is required"
    if (!formData.guardianName.trim()) newErrors.guardianName = "Guardian name is required"
    if (!formData.parentContact.trim()) newErrors.parentContact = "Parent contact is required"
    else if (!/^\d{10}$/.test(formData.parentContact)) newErrors.parentContact = "Contact should be 10 digits"
    if (!formData.address.trim()) newErrors.address = "Address is required"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (validateForm()) {
      onEdit(formData)
    }
  }

  if (!isOpen) return null

  const selectedClassStructure = classStructure.find((cls) => cls.className === formData.class)
  const availableSections = selectedClassStructure?.sections || ["A", "B", "C", "D"]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-3xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-[var(--accent-color)]">Edit Student</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 transition-colors">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="overflow-y-auto p-4 max-h-[calc(90vh-8rem)]">
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2 flex flex-col items-center">
                <div className="relative h-24 w-24 rounded-full overflow-hidden border-2 border-gray-200 bg-gray-100 mb-2">
                  {photoPreview ? (
                    <Image
                      src={photoPreview || "/placeholder.svg"}
                      alt="Student photo preview"
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full w-full text-gray-400">
                      <Upload className="h-8 w-8" />
                    </div>
                  )}
                </div>
                <label className="cursor-pointer bg-[var(--primary-color)] hover:bg-[var(--secondary-color)] text-white px-3 py-1 rounded-md transition-colors text-sm">
                  Change Photo
                  <input type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
                </label>
              </div>

              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`w-full rounded-lg border ${
                    errors.name ? "border-red-500" : "border-gray-300"
                  } px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent`}
                />
                {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
              </div>

              <div>
                <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1">
                  Gender
                </label>
                <select
                  id="gender"
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700 mb-1">
                  Date of Birth <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  id="dateOfBirth"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  className={`w-full rounded-lg border ${
                    errors.dateOfBirth ? "border-red-500" : "border-gray-300"
                  } px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent`}
                />
                {errors.dateOfBirth && <p className="mt-1 text-sm text-red-500">{errors.dateOfBirth}</p>}
              </div>

              <div>
                <label htmlFor="rollNumber" className="block text-sm font-medium text-gray-700 mb-1">
                  Roll Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="rollNumber"
                  name="rollNumber"
                  value={formData.rollNumber}
                  onChange={handleChange}
                  className={`w-full rounded-lg border ${
                    errors.rollNumber ? "border-red-500" : "border-gray-300"
                  } px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent`}
                />
                {errors.rollNumber && <p className="mt-1 text-sm text-red-500">{errors.rollNumber}</p>}
              </div>

              {classStructure.length > 0 && (
                <>
                  <div>
                    <label htmlFor="class" className="block text-sm font-medium text-gray-700 mb-1">
                      Class
                    </label>
                    <select
                      id="class"
                      name="class"
                      value={formData.class}
                      onChange={handleChange}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent"
                    >
                      {classStructure
                        .sort((a, b) => a.order - b.order)
                        .map((cls) => (
                          <option key={cls.className} value={cls.className}>
                            Grade {cls.className}
                          </option>
                        ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="section" className="block text-sm font-medium text-gray-700 mb-1">
                      Section
                    </label>
                    <select
                      id="section"
                      name="section"
                      value={formData.section}
                      onChange={handleChange}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent"
                    >
                      {availableSections.map((section) => (
                        <option key={section} value={section}>
                          Section {section}
                        </option>
                      ))}
                    </select>
                  </div>
                </>
              )}

              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="transferred">Transferred</option>
                </select>
              </div>

              <div>
                <label htmlFor="guardianName" className="block text-sm font-medium text-gray-700 mb-1">
                  Guardian Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="guardianName"
                  name="guardianName"
                  value={formData.guardianName}
                  onChange={handleChange}
                  className={`w-full rounded-lg border ${
                    errors.guardianName ? "border-red-500" : "border-gray-300"
                  } px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent`}
                />
                {errors.guardianName && <p className="mt-1 text-sm text-red-500">{errors.guardianName}</p>}
              </div>

              <div>
                <label htmlFor="parentContact" className="block text-sm font-medium text-gray-700 mb-1">
                  Parent Contact <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="parentContact"
                  name="parentContact"
                  value={formData.parentContact}
                  onChange={handleChange}
                  className={`w-full rounded-lg border ${
                    errors.parentContact ? "border-red-500" : "border-gray-300"
                  } px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent`}
                />
                {errors.parentContact && <p className="mt-1 text-sm text-red-500">{errors.parentContact}</p>}
              </div>

              <div className="md:col-span-2">
                <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                  Address <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="address"
                  name="address"
                  rows={3}
                  value={formData.address}
                  onChange={handleChange}
                  className={`w-full rounded-lg border ${
                    errors.address ? "border-red-500" : "border-gray-300"
                  } px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent`}
                />
                {errors.address && <p className="mt-1 text-sm text-red-500">{errors.address}</p>}
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-[var(--primary-color)] hover:bg-[var(--secondary-color)] text-white rounded-lg transition-colors"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
