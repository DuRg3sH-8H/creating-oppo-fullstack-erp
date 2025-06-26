"use client"

import { Search } from "lucide-react"
import type { StudentFilters, ClassStructure } from "@/components/students/types"

interface ClassSectionFilterProps {
  filters: StudentFilters
  onFilterChange: (filters: Partial<StudentFilters>) => void
  onSearch: (query: string) => void
  searchQuery: string
  classStructure: ClassStructure[]
}

export function ClassSectionFilter({
  filters,
  onFilterChange,
  onSearch,
  searchQuery,
  classStructure,
}: ClassSectionFilterProps) {
  const handleClassChange = (value: string) => {
    onFilterChange({ class: value, section: "all" })
  }

  const handleSectionChange = (value: string) => {
    onFilterChange({ section: value })
  }

  const handleStatusChange = (value: string) => {
    onFilterChange({ status: value })
  }

  const selectedClass = classStructure.find((cls) => cls.className === filters.class)
  const availableSections = selectedClass?.sections || []

  // Get unique classes from class structure
  const uniqueClasses = classStructure
    .map((cls) => cls.className)
    .filter((value, index, self) => self.indexOf(value) === index)
    .sort((a, b) => Number.parseInt(a) - Number.parseInt(b))

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-4">
        {/* Search */}
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search by name or roll number..."
              value={searchQuery}
              onChange={(e) => onSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent"
            />
          </div>
        </div>

        {/* Class Filter */}
        <div className="min-w-[150px]">
          <select
            value={filters.class || "all"}
            onChange={(e) => handleClassChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent"
          >
            <option value="all">All Classes</option>
            {uniqueClasses.map((className) => (
              <option key={className} value={className}>
                Grade {className}
              </option>
            ))}
          </select>
        </div>

        {/* Section Filter */}
        <div className="min-w-[150px]">
          <select
            value={filters.section || "all"}
            onChange={(e) => handleSectionChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent"
            disabled={filters.class === "all"}
          >
            <option value="all">All Sections</option>
            {availableSections.map((section) => (
              <option key={section} value={section}>
                Section {section}
              </option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div className="min-w-[150px]">
          <select
            value={filters.status || "active"}
            onChange={(e) => handleStatusChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent"
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="graduated">Graduated</option>
            <option value="transferred">Transferred</option>
            <option value="all">All Status</option>
          </select>
        </div>
      </div>
    </div>
  )
}
