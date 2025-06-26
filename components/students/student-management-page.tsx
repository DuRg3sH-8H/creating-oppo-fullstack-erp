"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/components/auth/auth-context"
import { ClassSectionFilter } from "@/components/students/class-section-filter"
import { StudentList } from "@/components/students/student-list"
import { AddStudentModal } from "@/components/students/add-student-modal"
import type { Student, StudentFilters, ClassStructure } from "@/components/students/types"
import { PlusCircle, GraduationCap, TrendingUp, Users } from "lucide-react"
import { fetchStudents, fetchClassStructure, createStudent, updateStudent, deleteStudent } from "@/lib/api/students"
import { useToast } from "@/hooks/use-toast"
import { PromotionModal } from "@/components/students/promotion-modal"
import { GraduatedStudentsModal } from "@/components/students/graduated-students-modal"

export function StudentManagementPage() {
  const { user } = useAuth()
  const { toast } = useToast()

  const [students, setStudents] = useState<Student[]>([])
  const [classStructure, setClassStructure] = useState<ClassStructure[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<StudentFilters>({
    class: "all",
    section: "all",
    status: "active",
  })
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedStudents, setSelectedStudents] = useState<string[]>([])

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isPromotionModalOpen, setIsPromotionModalOpen] = useState(false)
  const [isGraduatedModalOpen, setIsGraduatedModalOpen] = useState(false)

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    graduated: 0,
    byClass: {} as Record<string, number>,
  })

  useEffect(() => {
    if (user && user.role === "school" && user.schoolId) {
      loadData()
    } else if (user && user.role !== "school") {
      setError("Access denied: Only school administrators can manage students")
      setLoading(false)
    }
  }, [user, filters, searchQuery])

  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Load students and class structure
      const [studentsResponse, classResponse] = await Promise.all([
        fetchStudents({
          ...filters,
          search: searchQuery || undefined,
          schoolId: user?.schoolId,
        }),
        fetchClassStructure(user?.schoolId),
      ])

      const studentsData = studentsResponse.students || []
      const classData = classResponse.classes || []

      setStudents(studentsData)
      setClassStructure(classData)

      // Calculate stats
      const activeStudents = studentsData.filter((s: Student) => s.status === "active")
      const graduatedStudents = studentsData.filter((s: Student) => s.status === "graduated")

      const byClass = studentsData.reduce((acc: Record<string, number>, student: Student) => {
        if (student.status === "active") {
          acc[`${student.class}-${student.section}`] = (acc[`${student.class}-${student.section}`] || 0) + 1
        }
        return acc
      }, {})

      setStats({
        total: studentsData.length,
        active: activeStudents.length,
        graduated: graduatedStudents.length,
        byClass,
      })
    } catch (error: any) {
      console.error("StudentManagementPage: Error loading data:", error)
      setError(error.message || "Failed to load student data")
      toast({
        title: "Error",
        description: error.message || "Failed to load student data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (newFilters: Partial<StudentFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }))
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
  }

  const handleAddStudent = async (studentData: Omit<Student, "_id" | "createdAt" | "updatedAt">) => {
    try {
      const newStudent = await createStudent({
        ...studentData,
        schoolId: user?.schoolId,
        academicYear: new Date().getFullYear().toString(),
      })

      toast({
        title: "Success",
        description: "Student added successfully",
      })

      setIsAddModalOpen(false)
      loadData()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add student",
        variant: "destructive",
      })
    }
  }

  const handleEditStudent = async (student: Student) => {
    try {
      await updateStudent(student._id, student)

      toast({
        title: "Success",
        description: "Student updated successfully",
      })

      loadData()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update student",
        variant: "destructive",
      })
    }
  }

  const handleDeleteStudent = async (studentId: string) => {
    try {
      await deleteStudent(studentId)

      toast({
        title: "Success",
        description: "Student deleted successfully",
      })

      loadData()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete student",
        variant: "destructive",
      })
    }
  }

  const handleStudentSelection = (studentIds: string[]) => {
    setSelectedStudents(studentIds)
  }

  const handlePromotionSuccess = () => {
    setIsPromotionModalOpen(false)
    setSelectedStudents([])
    loadData()
  }

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--primary-color)] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading student data...</p>
        </div>
      </div>
    )
  }

  // Show error state
  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-red-600 mb-2">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={loadData}
            className="bg-[var(--primary-color)] hover:bg-[var(--secondary-color)] text-white px-4 py-2 rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  // Show access denied for non-school users
  if (!user || user.role !== "school") {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">Only school administrators can manage students.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--accent-color)]">Student Management</h1>
          <p className="text-gray-600 mt-1">Manage your school's student records and promotions</p>
        </div>
        <div className="flex items-center gap-3 mt-4 md:mt-0">
          <button
            onClick={() => setIsGraduatedModalOpen(true)}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <GraduationCap className="h-5 w-5" />
            <span>Graduated</span>
          </button>
          {selectedStudents.length > 0 && (
            <button
              onClick={() => setIsPromotionModalOpen(true)}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <TrendingUp className="h-5 w-5" />
              <span>Promote ({selectedStudents.length})</span>
            </button>
          )}
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 bg-[var(--primary-color)] hover:bg-[var(--secondary-color)] text-white px-4 py-2 rounded-lg transition-colors"
          >
            <PlusCircle className="h-5 w-5" />
            <span>Add Student</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-blue-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Total Students</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-green-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Active Students</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.active}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <GraduationCap className="h-8 w-8 text-purple-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Graduated</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.graduated}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <TrendingUp className="h-8 w-8 text-orange-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Classes</p>
              <p className="text-2xl font-semibold text-gray-900">{Object.keys(stats.byClass).length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <ClassSectionFilter
            filters={filters}
            onFilterChange={handleFilterChange}
            onSearch={handleSearch}
            searchQuery={searchQuery}
            classStructure={classStructure}
          />
        </div>

        <StudentList
          students={students}
          onEdit={handleEditStudent}
          onDelete={handleDeleteStudent}
          selectedStudents={selectedStudents}
          onSelectionChange={handleStudentSelection}
          showSelection={true}
        />
      </div>

      {/* Modals */}
      <AddStudentModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddStudent}
        classStructure={classStructure}
      />
      {selectedStudents.length > 0 && (
        <PromotionModal
          isOpen={isPromotionModalOpen}
          onClose={() => setIsPromotionModalOpen(false)}
          selectedStudents={students.filter((s) => selectedStudents.includes(s._id))}
          classStructure={classStructure}
          onSuccess={handlePromotionSuccess}
        />
      )}

      <GraduatedStudentsModal
        isOpen={isGraduatedModalOpen}
        onClose={() => setIsGraduatedModalOpen(false)}
        schoolId={user?.schoolId || ""}
      />
    </div>
  )
}
