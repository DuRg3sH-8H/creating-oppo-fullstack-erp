"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Edit, Key, Power, PowerOff, Trash2 } from "lucide-react"
import { ResetPasswordModal } from "./reset-password-modal"
import { EditUserModal } from "./edit-user-modal"
import { toggleUserStatus, deleteUser } from "@/lib/api/users"
import type { User } from "./types"
import { School } from "../schools/types"

export interface UsersListProps {
  users: User[]
  schools: School[]
  onToggleStatus: (userId: string) => Promise<void>
  onResetPassword: (userId: string) => void
  loading: boolean
  onRefresh: () => void
}

export function UsersList({ users, schools, onRefresh }: UsersListProps) {
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [showResetPassword, setShowResetPassword] = useState(false)
  const [showEditUser, setShowEditUser] = useState(false)
  const [isLoading, setIsLoading] = useState<string | null>(null)

  const handleToggleStatus = async (user: User) => {
    setIsLoading(user.id)
    try {
      await toggleUserStatus(user.id)
      onRefresh()
    } catch (error) {
      console.error("Failed to toggle user status:", error)
    } finally {
      setIsLoading(null)
    }
  }

  const handleDeleteUser = async (user: User) => {
    if (!confirm(`Are you sure you want to delete ${user.name}? This action cannot be undone.`)) {
      return
    }

    setIsLoading(user.id)
    try {
      await deleteUser(user.id)
      onRefresh()
    } catch (error) {
      console.error("Failed to delete user:", error)
    } finally {
      setIsLoading(null)
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case "super-admin":
        return "bg-red-100 text-red-800 border-red-200"
      case "school":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "eca":
        return "bg-green-100 text-green-800 border-green-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getStatusColor = (status: string) => {
    return status === "active"
      ? "bg-green-100 text-green-800 border-green-200"
      : "bg-red-100 text-red-800 border-red-200"
  }

  if (users.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500 text-lg mb-2">No users found</div>
        <div className="text-gray-400">Try adjusting your filters or add a new user</div>
      </div>
    )
  }

  return (
    <>
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>School</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Last Login</TableHead>
              <TableHead className="w-[50px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                      <AvatarFallback>
                        {user.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{user.name}</div>
                      <div className="text-sm text-muted-foreground">{user.email}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className={getRoleColor(user.role)}>
                    {user.role === "super-admin"
                      ? "Super Admin"
                      : user.role === "school"
                        ? "School Admin"
                        : "ECA Coordinator"}
                  </Badge>
                </TableCell>
                <TableCell>{user.schoolName || "-"}</TableCell>
                <TableCell>
                  <Badge className={getStatusColor(user.status)}>
                    {user.status === "active" ? "Active" : "Inactive"}
                  </Badge>
                </TableCell>
                <TableCell>{user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : "Never"}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0" disabled={isLoading === user.id}>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => {
                          setSelectedUser(user)
                          setShowEditUser(true)
                        }}
                      >
                        <Edit className="mr-2 h-4 w-4" />
                        Edit User
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          setSelectedUser(user)
                          setShowResetPassword(true)
                        }}
                      >
                        <Key className="mr-2 h-4 w-4" />
                        Reset Password
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => handleToggleStatus(user)} disabled={isLoading === user.id}>
                        {user.status === "active" ? (
                          <>
                            <PowerOff className="mr-2 h-4 w-4" />
                            Deactivate
                          </>
                        ) : (
                          <>
                            <Power className="mr-2 h-4 w-4" />
                            Activate
                          </>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => handleDeleteUser(user)}
                        disabled={isLoading === user.id}
                        className="text-red-600 focus:text-red-600"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete User
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Reset Password Modal */}
      <ResetPasswordModal
        user={selectedUser}
        isOpen={showResetPassword}
        onClose={() => {
          setShowResetPassword(false)
          setSelectedUser(null)
        }}
        onSuccess={onRefresh}
      />

      {/* Edit User Modal */}
      <EditUserModal
        user={selectedUser}
        schools={schools}
        isOpen={showEditUser}
        onClose={() => {
          setShowEditUser(false)
          setSelectedUser(null)
        }}
        onSuccess={onRefresh}
      />
    </>
  )
}
