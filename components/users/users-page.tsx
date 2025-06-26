"use client"

import { useState, useEffect, useCallback } from "react"
import { motion } from "framer-motion"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { UsersList } from "@/components/users/users-list"
import { UserFilters } from "@/components/users/user-filters"
import { AddUserModal } from "@/components/users/add-user-modal"
import { ResetPasswordModal } from "@/components/users/reset-password-modal"
import { PaginationControls } from "@/components/users/pagination-controls"
import { Alert, AlertDescription } from "@/components/ui/alert"
import type { User, UserRole, UserStatus } from "@/components/users/types"
import { fetchUsers, createUser, toggleUserStatus, resetUserPassword } from "@/lib/api/users"
import { fetchSchools } from "@/lib/api/schools"
import type { School } from "@/components/schools/types"

interface PaginationInfo {
  currentPage: number
  totalPages: number
  totalCount: number
  hasNextPage: boolean
  hasPrevPage: boolean
}

export function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [schools, setSchools] = useState<School[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState<PaginationInfo>({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    hasNextPage: false,
    hasPrevPage: false,
  })

  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [isResetPasswordModalOpen, setIsResetPasswordModalOpen] = useState(false)

  // Filter states
  const [roleFilter, setRoleFilter] = useState<UserRole | "all">("all")
  const [schoolFilter, setSchoolFilter] = useState<string | "all">("all")
  const [statusFilter, setStatusFilter] = useState<UserStatus | "all">("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [pageSize, setPageSize] = useState(10)

  // Memoized load functions to prevent infinite re-renders
  const loadSchools = useCallback(async () => {
    try {
      const schoolsResponse = await fetchSchools()
      setSchools(schoolsResponse.schools || [])
    } catch (err: any) {
      console.error("❌ Error loading schools:", err)
      setError(err.message || "Failed to load schools")
    }
  }, [])

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true)
      const filters = {
        role: roleFilter !== "all" ? roleFilter : undefined,
        schoolId: schoolFilter !== "all" ? schoolFilter : undefined,
        status: statusFilter !== "all" ? statusFilter : undefined,
        search: searchQuery || undefined,
        page: pagination.currentPage,
        limit: pageSize,
      }
      const response = await fetchUsers(filters)

      setUsers(response.users || [])
      setPagination(
        response.pagination || {
          currentPage: 1,
          totalPages: 1,
          totalCount: 0,
          hasNextPage: false,
          hasPrevPage: false,
        },
      )
      setError(null)
    } catch (err: any) {
      console.error("❌ Error loading users:", err)
      setError(err.message || "Failed to load users")
      setUsers([])
    } finally {
      setLoading(false)
    }
  }, [roleFilter, schoolFilter, statusFilter, searchQuery, pagination.currentPage, pageSize])

  // Load initial data on component mount
  useEffect(() => {
    loadSchools()
  }, [loadSchools])

  // Load users when dependencies change
  useEffect(() => {
    loadUsers()
  }, [loadUsers])

  // Handle filter changes
  const handleRoleFilterChange = (role: UserRole | "all") => {
    setRoleFilter(role)
    setPagination((prev) => ({ ...prev, currentPage: 1 })) // Reset to first page
  }

  const handleSchoolFilterChange = (schoolId: string | "all") => {
    setSchoolFilter(schoolId)
    setPagination((prev) => ({ ...prev, currentPage: 1 })) // Reset to first page
  }

  const handleStatusFilterChange = (status: UserStatus | "all") => {
    setStatusFilter(status)
    setPagination((prev) => ({ ...prev, currentPage: 1 })) // Reset to first page
  }

  const handleSearchChange = (query: string) => {
    setSearchQuery(query)
    setPagination((prev) => ({ ...prev, currentPage: 1 })) // Reset to first page
  }

  // Handle pagination
  const handlePageChange = (page: number) => {
    setPagination((prev) => ({ ...prev, currentPage: page }))
  }

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize)
    setPagination((prev) => ({ ...prev, currentPage: 1 })) // Reset to first page
  }

  // Handle user actions
  const handleAddUser = async (newUserData: {
    name: string
    username: string
    email: string
    password: string
    role: UserRole
    schoolId?: string
    schoolName?: string
  }) => {
    try {
      await createUser({
        name: newUserData.name,
        email: newUserData.email,
        password: newUserData.password,
        role: newUserData.role,
        schoolId: newUserData.schoolId,
        schoolName: newUserData.schoolName,
      })

      setIsAddModalOpen(false)
      await loadUsers() // Reload users to show the new one
      setError(null)
    } catch (err: any) {
      console.error("❌ Error creating user:", err)
      setError(err.message || "Failed to create user")
    }
  }

  const handleToggleUserStatus = async (userId: string) => {
    try {
      await toggleUserStatus(userId)
      await loadUsers() // Reload users to show updated status
      setError(null)
    } catch (err: any) {
      console.error("❌ Error toggling user status:", err)
      setError(err.message || "Failed to update user status")
    }
  }

  const handleResetPassword = (userId: string) => {
    const user = users.find((u) => u.id === userId)
    if (user) {
      setSelectedUser(user)
      setIsResetPasswordModalOpen(true)
    }
  }

  const handlePasswordReset = async (newPassword?: string) => {
    if (!selectedUser) return

    try {
      const response = await resetUserPassword(selectedUser.id, newPassword)

      setIsResetPasswordModalOpen(false)
      setSelectedUser(null)
      setError(null)

      // You might want to show a success message with the new password
      alert(`Password reset successful. New password: ${response.newPassword}`)
    } catch (err: any) {
      console.error("❌ Error resetting password:", err)
      setError(err.message || "Failed to reset password")
    }
  }


  if (loading && users.length === 0) {
    return (
      <main className="flex-1 overflow-y-auto p-4 md:p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--primary-color)] mx-auto mb-4"></div>
              <p className="text-gray-500">Loading users...</p>
            </div>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="flex-1 overflow-y-auto p-4 md:p-6 text-bla">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-2xl font-bold text-[var(--accent-color)]"
          >
            User Management
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <Button
              onClick={() => setIsAddModalOpen(true)}
              className="bg-[var(--primary-color)] hover:bg-[var(--secondary-color)] text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add User
            </Button>
          </motion.div>
        </div>

        {error && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertDescription className="text-red-800">{error}</AlertDescription>
          </Alert>
        )}



        <UserFilters
          onRoleFilterChange={handleRoleFilterChange}
          onSchoolFilterChange={handleSchoolFilterChange}
          onStatusFilterChange={handleStatusFilterChange}
          onSearchChange={handleSearchChange}
          schools={schools}
          roleFilter={roleFilter}
          schoolFilter={schoolFilter}
          statusFilter={statusFilter}
          searchQuery={searchQuery}
        />

        <UsersList
          users={users}
          schools={schools}
          onToggleStatus={handleToggleUserStatus}
          onResetPassword={handleResetPassword}
          loading={loading} onRefresh={function (): void {
            throw new Error("Function not implemented.")
          }} />

        <PaginationControls
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          totalCount={pagination.totalCount}
          pageSize={pageSize}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
        />

        <AddUserModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onSave={handleAddUser}
          schools={schools} onSuccess={function (): void {
            throw new Error("Function not implemented.")
          }} />

        <ResetPasswordModal
          isOpen={isResetPasswordModalOpen}
          onClose={() => {
            setIsResetPasswordModalOpen(false)
            setSelectedUser(null)
          }}
          user={selectedUser} onSuccess={function (): void {
            throw new Error("Function not implemented.")
          }} />
      </div>
    </main>
  )
}
