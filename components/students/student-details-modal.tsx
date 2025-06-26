"use client"

import { X } from "lucide-react"
import type { Student } from "@/components/students/types"
import Image from "next/image"

interface StudentDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  student: Student
}

export function StudentDetailsModal({ isOpen, onClose, student }: StudentDetailsModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-[var(--accent-color)]">Student Details</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 transition-colors">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="overflow-y-auto p-4 max-h-[calc(90vh-8rem)]">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex flex-col items-center">
              <div className="relative h-32 w-32 rounded-full overflow-hidden border-2 border-gray-200 bg-gray-100 mb-2">
                <Image
                  src={student.photo || "/placeholder.svg?height=128&width=128"}
                  alt={student.name}
                  fill
                  className="object-cover"
                />
              </div>
              <h3 className="text-lg font-medium text-center">{student.name}</h3>
              <p className="text-sm text-gray-500 text-center">
                Grade {student.class} - {student.section}
              </p>
              <p className="text-sm text-gray-500 text-center">Roll No: {student.rollNumber}</p>
            </div>

            <div className="flex-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Personal Information</h4>
                  <div className="mt-2 space-y-2">
                    <div>
                      <p className="text-xs text-gray-500">Gender</p>
                      <p className="text-sm font-medium">{student.gender}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Date of Birth</p>
                      <p className="text-sm font-medium">{student.dateOfBirth}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Address</p>
                      <p className="text-sm font-medium">{student.address}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-500">Guardian Information</h4>
                  <div className="mt-2 space-y-2">
                    <div>
                      <p className="text-xs text-gray-500">Guardian Name</p>
                      <p className="text-sm font-medium">{student.guardianName}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Contact Number</p>
                      <p className="text-sm font-medium">{student.parentContact}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <h4 className="text-sm font-medium text-gray-500">Academic Information</h4>
                <div className="mt-2 grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500">Class</p>
                    <p className="text-sm font-medium">Grade {student.class}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Section</p>
                    <p className="text-sm font-medium">Section {student.section}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Roll Number</p>
                    <p className="text-sm font-medium">{student.rollNumber}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-gray-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[var(--primary-color)] hover:bg-[var(--secondary-color)] text-white rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
