"use client"

import { useState } from "react"
import Image from "next/image"
import { Edit, Eye, Trash2, ChevronLeft, ChevronRight } from "lucide-react"
import type { Student } from "@/components/students/types"
import { EditStudentModal } from "@/components/students/edit-student-modal"
import { StudentDetailsModal } from "@/components/students/student-details-modal"
import { DeleteConfirmationDialog } from "@/components/students/delete-confirmation-dialog"

interface StudentListProps {
  students: Student[]
  onEdit: (student: Student) => void
  onDelete: (studentId: string) => void
  selectedStudents?: string[]
  onSelectionChange?: (studentIds: string[]) => void
  showSelection?: boolean
}

export function StudentList({
  students,
  onEdit,
  onDelete,
  selectedStudents = [],
  onSelectionChange,
  showSelection = false,
}: StudentListProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [studentToDelete, setStudentToDelete] = useState<string | null>(null)

  const studentsPerPage = 10
  const totalPages = Math.ceil(students.length / studentsPerPage)
  const startIndex = (currentPage - 1) * studentsPerPage
  const currentStudents = students.slice(startIndex, startIndex + studentsPerPage)

  const handleViewStudent = (student: Student) => {
    setSelectedStudent(student)
    setIsViewModalOpen(true)
  }

  const handleEditStudent = (student: Student) => {
    setSelectedStudent(student)
    setIsEditModalOpen(true)
  }

  const handleDeleteClick = (studentId: string) => {
    setStudentToDelete(studentId)
    setIsDeleteDialogOpen(true)
  }

  const confirmDelete = () => {
    if (studentToDelete) {
      onDelete(studentToDelete)
      setIsDeleteDialogOpen(false)
      setStudentToDelete(null)
    }
  }

  const handleEditSubmit = (student: Student) => {
    onEdit(student)
    setIsEditModalOpen(false)
  }

  const handleSelectAll = (checked: boolean) => {
    if (onSelectionChange) {
      if (checked) {
        const activeStudentIds = currentStudents
          .filter((s) => s.status === "active")
          .map((s) => s._id || s.id)
          .filter(Boolean) as string[]
        onSelectionChange([...new Set([...selectedStudents, ...activeStudentIds])])
      } else {
        const currentStudentIds = currentStudents.map((s) => s._id || s.id).filter(Boolean) as string[]
        onSelectionChange(selectedStudents.filter((id) => !currentStudentIds.includes(id)))
      }
    }
  }

  const handleSelectStudent = (studentId: string, checked: boolean) => {
    if (onSelectionChange) {
      if (checked) {
        onSelectionChange([...selectedStudents, studentId])
      } else {
        onSelectionChange(selectedStudents.filter((id) => id !== studentId))
      }
    }
  }

  const getStatusBadge = (status: string) => {
    const statusStyles = {
      active: "bg-green-100 text-green-800",
      inactive: "bg-gray-100 text-gray-800",
      graduated: "bg-blue-100 text-blue-800",
      transferred: "bg-yellow-100 text-yellow-800",
    }

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusStyles[status as keyof typeof statusStyles] || statusStyles.inactive}`}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    )
  }

  const activeStudentsInCurrentPage = currentStudents.filter((s) => s.status === "active")
  const allCurrentActiveSelected =
    activeStudentsInCurrentPage.length > 0 &&
    activeStudentsInCurrentPage.every((s) => selectedStudents.includes(s._id || s.id || ""))

  return (
    <div>
      {/* Desktop Table View */}
      <div className="hidden md:block">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              {showSelection && (
                <th className="px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={allCurrentActiveSelected}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="rounded border-gray-300 text-[var(--primary-color)] focus:ring-[var(--primary-color)]"
                  />
                </th>
              )}
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Photo</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Student Details
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Class</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Roll No
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Parent Contact
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {currentStudents.length > 0 ? (
              currentStudents.map((student) => {
                const studentId = student._id || student.id || ""
                return (
                  <tr key={studentId} className="hover:bg-gray-50">
                    {showSelection && (
                      <td className="px-4 py-3 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedStudents.includes(studentId)}
                          onChange={(e) => handleSelectStudent(studentId, e.target.checked)}
                          disabled={student.status !== "active"}
                          className="rounded border-gray-300 text-[var(--primary-color)] focus:ring-[var(--primary-color)] disabled:opacity-50"
                        />
                      </td>
                    )}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="relative h-10 w-10 rounded-full overflow-hidden border border-gray-200">
                        <Image
                          src={student.photo || "/placeholder.svg?height=40&width=40"}
                          alt={student.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{student.name}</div>
                        <div className="text-sm text-gray-500">{student.gender}</div>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        Grade {student.class} - {student.section}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{student.rollNumber}</div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{student.parentContact}</div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">{getStatusBadge(student.status)}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleViewStudent(student)}
                          className="text-[var(--accent-color)] hover:text-[var(--primary-color)] transition-colors"
                          aria-label="View student details"
                        >
                          <Eye className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleEditStudent(student)}
                          className="text-blue-600 hover:text-blue-800 transition-colors"
                          aria-label="Edit student"
                        >
                          <Edit className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(studentId)}
                          className="text-red-600 hover:text-red-800 transition-colors"
                          aria-label="Delete student"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })
            ) : (
              <tr>
                <td colSpan={showSelection ? 8 : 7} className="px-4 py-8 text-center text-gray-500">
                  No students found. Try adjusting your filters or add a new student.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden">
        {currentStudents.length > 0 ? (
          <div className="space-y-4 p-4">
            {currentStudents.map((student) => {
              const studentId = student._id || student.id || ""
              return (
                <div key={studentId} className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center">
                        {showSelection && (
                          <input
                            type="checkbox"
                            checked={selectedStudents.includes(studentId)}
                            onChange={(e) => handleSelectStudent(studentId, e.target.checked)}
                            disabled={student.status !== "active"}
                            className="rounded border-gray-300 text-[var(--primary-color)] focus:ring-[var(--primary-color)] disabled:opacity-50 mr-3"
                          />
                        )}
                        <div className="relative h-12 w-12 rounded-full overflow-hidden border border-gray-200 mr-3">
                          <Image
                            src={student.photo || "/placeholder.svg?height=48&width=48"}
                            alt={student.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div>
                          <h3 className="text-lg font-medium text-gray-900">{student.name}</h3>
                          <p className="text-sm text-gray-500">
                            Grade {student.class} - {student.section}
                          </p>
                        </div>
                      </div>
                      {getStatusBadge(student.status)}
                    </div>

                    <div className="grid grid-cols-2 gap-2 mb-4">
                      <div>
                        <p className="text-xs text-gray-500">Roll Number</p>
                        <p className="text-sm font-medium">{student.rollNumber}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Gender</p>
                        <p className="text-sm font-medium">{student.gender}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Date of Birth</p>
                        <p className="text-sm font-medium">{student.dateOfBirth}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Parent Contact</p>
                        <p className="text-sm font-medium">{student.parentContact}</p>
                      </div>
                    </div>

                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => handleViewStudent(student)}
                        className="p-2 rounded-full text-[var(--accent-color)] hover:bg-gray-100 transition-colors"
                        aria-label="View student details"
                      >
                        <Eye className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleEditStudent(student)}
                        className="p-2 rounded-full text-blue-600 hover:bg-gray-100 transition-colors"
                        aria-label="Edit student"
                      >
                        <Edit className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(studentId)}
                        className="p-2 rounded-full text-red-600 hover:bg-gray-100 transition-colors"
                        aria-label="Delete student"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="p-8 text-center text-gray-500">
            No students found. Try adjusting your filters or add a new student.
          </div>
        )}
      </div>

      {/* Pagination */}
      {students.length > studentsPerPage && (
        <div className="px-4 py-3 flex items-center justify-between border-t border-gray-200 bg-white">
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">{startIndex + 1}</span> to{" "}
                <span className="font-medium">{Math.min(startIndex + studentsPerPage, students.length)}</span> of{" "}
                <span className="font-medium">{students.length}</span> students
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                    currentPage === 1 ? "text-gray-300 cursor-not-allowed" : "text-gray-500 hover:bg-gray-50"
                  }`}
                >
                  <span className="sr-only">Previous</span>
                  <ChevronLeft className="h-5 w-5" />
                </button>

                {/* Page Numbers */}
                {(() => {
                  const pages = []
                  const maxVisiblePages = 5
                  let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2))
                  const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1)

                  if (endPage - startPage + 1 < maxVisiblePages) {
                    startPage = Math.max(1, endPage - maxVisiblePages + 1)
                  }

                  for (let i = startPage; i <= endPage; i++) {
                    pages.push(
                      <button
                        key={i}
                        onClick={() => setCurrentPage(i)}
                        className={`relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium ${
                          currentPage === i
                            ? "z-10 bg-[var(--primary-color)] border-[var(--primary-color)] text-white"
                            : "text-gray-500 hover:bg-gray-50"
                        }`}
                      >
                        {i}
                      </button>,
                    )
                  }
                  return pages
                })()}

                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                    currentPage === totalPages ? "text-gray-300 cursor-not-allowed" : "text-gray-500 hover:bg-gray-50"
                  }`}
                >
                  <span className="sr-only">Next</span>
                  <ChevronRight className="h-5 w-5" />
                </button>
              </nav>
            </div>
          </div>

          {/* Mobile Pagination */}
          <div className="flex sm:hidden justify-between items-center w-full">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                currentPage === 1
                  ? "text-gray-300 bg-gray-50 cursor-not-allowed"
                  : "text-gray-700 bg-white hover:bg-gray-50"
              }`}
            >
              Previous
            </button>
            <p className="text-sm text-gray-700">
              Page <span className="font-medium">{currentPage}</span> of{" "}
              <span className="font-medium">{totalPages}</span>
            </p>
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                currentPage === totalPages
                  ? "text-gray-300 bg-gray-50 cursor-not-allowed"
                  : "text-gray-700 bg-white hover:bg-gray-50"
              }`}
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Modals */}
      {selectedStudent && (
        <>
          <StudentDetailsModal
            isOpen={isViewModalOpen}
            onClose={() => setIsViewModalOpen(false)}
            student={selectedStudent}
          />

          <EditStudentModal
            isOpen={isEditModalOpen}
            onClose={() => setIsEditModalOpen(false)}
            student={selectedStudent}
            onEdit={handleEditSubmit}
          />
        </>
      )}

      <DeleteConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={confirmDelete}
      />
    </div>
  )
}
