"use client"

import { useState, useEffect } from "react"
import { X, GraduationCap, Download, Calendar } from "lucide-react"
import type { Student } from "@/components/students/types"
import { fetchGraduatedStudents } from "@/lib/api/students"
import { useToast } from "@/hooks/use-toast"
import Image from "next/image"

interface GraduatedStudentsModalProps {
  isOpen: boolean
  onClose: () => void
  schoolId: string
}

export function GraduatedStudentsModal({ isOpen, onClose, schoolId }: GraduatedStudentsModalProps) {
  const { toast } = useToast()
  const [graduatedStudents, setGraduatedStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString())

  useEffect(() => {
    if (isOpen && schoolId) {
      loadGraduatedStudents()
    }
  }, [isOpen, schoolId, selectedYear])

  const loadGraduatedStudents = async () => {
    try {
      setLoading(true)
      const response = await fetchGraduatedStudents(schoolId, selectedYear)
      setGraduatedStudents(response.students || [])
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load graduated students",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleExportCSV = () => {
    if (graduatedStudents.length === 0) {
      toast({
        title: "No Data",
        description: "No graduated students to export",
        variant: "destructive",
      })
      return
    }

    const headers = ["Name", "Roll Number", "Class", "Section", "Graduation Date", "Parent Contact"]
    const csvContent = [
      headers.join(","),
      ...graduatedStudents.map((student) =>
        [
          `"${student.name}"`,
          student.rollNumber,
          student.class,
          student.section,
          student.graduationDate || "",
          student.parentContact,
        ].join(","),
      ),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `graduated-students-${selectedYear}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    toast({
      title: "Success",
      description: "Graduated students list exported successfully",
    })
  }

  if (!isOpen) return null

  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-6 w-6 text-purple-600" />
            <h2 className="text-xl font-semibold text-[var(--accent-color)]">Graduated Students</h2>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 transition-colors">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6">
          {/* Filters and Actions */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-gray-500" />
              <label htmlFor="year" className="text-sm font-medium text-gray-700">
                Academic Year:
              </label>
              <select
                id="year"
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="rounded-lg border border-gray-300 px-3 py-1 focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent"
              >
                {years.map((year) => (
                  <option key={year} value={year.toString()}>
                    {year}-{(year + 1).toString().slice(-2)}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={handleExportCSV}
              disabled={graduatedStudents.length === 0}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="h-4 w-4" />
              <span>Export CSV</span>
            </button>
          </div>

          {/* Content */}
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--primary-color)]"></div>
            </div>
          ) : graduatedStudents.length > 0 ? (
            <div className="space-y-4">
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-4">
                <p className="text-purple-800">
                  <strong>{graduatedStudents.length}</strong> students graduated in {selectedYear}-
                  {(Number.parseInt(selectedYear) + 1).toString().slice(-2)}
                </p>
              </div>

              {/* Desktop Table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Photo
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Student Details
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Class
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Roll No
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Graduation Date
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Parent Contact
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {graduatedStudents.map((student) => (
                      <tr key={student._id} className="hover:bg-gray-50">
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
                          <div className="text-sm text-gray-500">
                            {student.graduationDate ? new Date(student.graduationDate).toLocaleDateString() : "N/A"}
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="text-sm text-gray-500">{student.parentContact}</div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="md:hidden space-y-4">
                {graduatedStudents.map((student) => (
                  <div key={student._id} className="bg-white rounded-lg border border-gray-200 p-4">
                    <div className="flex items-center mb-3">
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

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <p className="text-xs text-gray-500">Roll Number</p>
                        <p className="text-sm font-medium">{student.rollNumber}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Gender</p>
                        <p className="text-sm font-medium">{student.gender}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Graduation Date</p>
                        <p className="text-sm font-medium">
                          {student.graduationDate ? new Date(student.graduationDate).toLocaleDateString() : "N/A"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Parent Contact</p>
                        <p className="text-sm font-medium">{student.parentContact}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <GraduationCap className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Graduated Students</h3>
              <p className="text-gray-600">
                No students have graduated in the {selectedYear}-
                {(Number.parseInt(selectedYear) + 1).toString().slice(-2)} academic year.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
