"use client"

import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { UserRole, UserStatus } from "@/components/users/types"
import type { School } from "@/components/schools/types"

interface UserFiltersProps {
  onRoleFilterChange: (role: UserRole | "all") => void
  onSchoolFilterChange: (schoolId: string | "all") => void
  onStatusFilterChange: (status: UserStatus | "all") => void
  onSearchChange: (query: string) => void
  schools: School[]
  roleFilter: UserRole | "all"
  schoolFilter: string | "all"
  statusFilter: UserStatus | "all"
  searchQuery: string
}

export function UserFilters({
  onRoleFilterChange,
  onSchoolFilterChange,
  onStatusFilterChange,
  onSearchChange,
  schools,
  roleFilter,
  schoolFilter,
  statusFilter,
  searchQuery,
}: UserFiltersProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 mb-6 text-black">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="space-y-2">
          <Label htmlFor="search" className="text-[var(--accent-color)]">
            Search Users
          </Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              id="search"
              placeholder="Search by name or email"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-9 border-[var(--primary-color)]/20 focus:border-[var(--primary-color)] focus:ring-[var(--primary-color)]/20"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="role-filter" className="text-[var(--accent-color)]">
            Role
          </Label>
          <Select value={roleFilter} onValueChange={(value) => onRoleFilterChange(value as UserRole | "all")}>
            <SelectTrigger
              id="role-filter"
              className="border-[var(--primary-color)]/20 focus:border-[var(--primary-color)] focus:ring-[var(--primary-color)]/20"
            >
              <SelectValue placeholder="Filter by role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="super-admin">Super Admin</SelectItem>
              <SelectItem value="school">School Admin</SelectItem>
              <SelectItem value="eca">ECA Coordinator</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="school-filter" className="text-[var(--accent-color)]">
            School
          </Label>
          <Select value={schoolFilter} onValueChange={(value) => onSchoolFilterChange(value)}>
            <SelectTrigger
              id="school-filter"
              className="border-[var(--primary-color)]/20 focus:border-[var(--primary-color)] focus:ring-[var(--primary-color)]/20"
            >
              <SelectValue placeholder="Filter by school" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Schools</SelectItem>
              {schools.map((school) => (
                <SelectItem key={school.id} value={school.id}>
                  {school.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="status-filter" className="text-[var(--accent-color)]">
            Status
          </Label>
          <Select value={statusFilter} onValueChange={(value) => onStatusFilterChange(value as UserStatus | "all")}>
            <SelectTrigger
              id="status-filter"
              className="border-[var(--primary-color)]/20 focus:border-[var(--primary-color)] focus:ring-[var(--primary-color)]/20"
            >
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  )
}
