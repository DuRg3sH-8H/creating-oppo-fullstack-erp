"use client"

import { useState, useEffect } from "react"
import { X, Users, Calendar, Clock, User, RefreshCw, Mail, Building } from "lucide-react"
import { format } from "date-fns"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useTheme } from "@/components/theme-context"
import type { Training } from "@/components/trainings/types"

interface RegisteredUser {
  id: string
  name: string
  email: string
  role: string
  schoolName?: string
  registeredAt: string
  registrationOrder: number
}

interface RegisteredUsersModalProps {
  isOpen: boolean
  onClose: () => void
  training: Training
}

export function RegisteredUsersModal({ isOpen, onClose, training }: RegisteredUsersModalProps) {
  const { primaryColor } = useTheme()
  const [users, setUsers] = useState<RegisteredUser[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchRegisteredUsers = async () => {
    if (!training.id) return

    setIsLoading(true)
    setError(null)

    try {

      const response = await fetch(`/api/trainings/${training.id}/registered-users`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch registered users")
      }

      setUsers(data.users || [])
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to load users")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (isOpen) {
      fetchRegisteredUsers()
    }
  }, [isOpen, training.id])

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMMM d, yyyy")
    } catch {
      return dateString
    }
  }

  const formatDateTime = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMM d, yyyy 'at' h:mm a")
    } catch {
      return dateString
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case "super-admin":
        return "bg-purple-100 text-purple-800 border-purple-200"
      case "school":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "eca":
        return "bg-green-100 text-green-800 border-green-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const registeredCount = users.length
  const maxParticipants = training.maxParticipants || 0
  const isFull = maxParticipants > 0 && registeredCount >= maxParticipants

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col bg-white">
        <DialogHeader className="flex-shrink-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-semibold">Registered Users - {training.title}</DialogTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={fetchRegisteredUsers}
                disabled={isLoading}
                className="flex items-center gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
                Refresh
              </Button>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-4">
          {/* Training Info Card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="h-5 w-5" style={{ color: primaryColor }} />
                Training Details
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span>{formatDate(training.date)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-gray-500" />
                <span>{training.time}</span>
              </div>
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-gray-500" />
                <span>{training.trainer}</span>
              </div>
            </CardContent>
          </Card>

          {/* Users List */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Users className="h-5 w-5" style={{ color: primaryColor }} />
                  Registered Users ({registeredCount}
                  {maxParticipants > 0 && ` / ${maxParticipants}`})
                </CardTitle>
                {isFull && (
                  <Badge variant="destructive" className="text-xs">
                    Full
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="flex items-center gap-2 text-gray-500">
                    <div
                      className="animate-spin rounded-full h-5 w-5 border-b-2"
                      style={{ borderColor: primaryColor }}
                    ></div>
                    Loading users...
                  </div>
                </div>
              ) : error ? (
                <div className="text-center py-8">
                  <p className="text-red-600 mb-4">{error}</p>
                  <Button variant="outline" onClick={fetchRegisteredUsers} className="flex items-center gap-2">
                    <RefreshCw className="h-4 w-4" />
                    Try Again
                  </Button>
                </div>
              ) : users.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium mb-2">No users registered yet</p>
                  <p className="text-sm">Users will appear here once they register for this training.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {users.map((user) => (
                    <Card key={user.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <Avatar className="h-10 w-10 flex-shrink-0">
                            <AvatarFallback
                              style={{ backgroundColor: primaryColor, color: "white" }}
                              className="text-sm font-medium"
                            >
                              {getInitials(user.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-medium text-sm truncate">{user.name}</h4>
                              <Badge variant="outline" className={`text-xs ${getRoleColor(user.role)}`}>
                                {user.role}
                              </Badge>
                            </div>
                            <div className="space-y-1 text-xs text-gray-600">
                              <div className="flex items-center gap-1">
                                <Mail className="h-3 w-3" />
                                <span className="truncate">{user.email}</span>
                              </div>
                              {user.schoolName && (
                                <div className="flex items-center gap-1">
                                  <Building className="h-3 w-3" />
                                  <span className="truncate">{user.schoolName}</span>
                                </div>
                              )}
                              <div className="text-xs text-gray-500 mt-2">
                                <span className="font-medium">#{user.registrationOrder}</span> • Registered{" "}
                                {formatDateTime(user.registeredAt)}
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Footer Stats */}
        {users.length > 0 && (
          <div className="flex-shrink-0 border-t pt-4">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>
                Total: {registeredCount} user{registeredCount !== 1 ? "s" : ""}
              </span>
              {maxParticipants > 0 && (
                <span>
                  Capacity: {registeredCount} / {maxParticipants} (
                  {Math.round((registeredCount / maxParticipants) * 100)}% full)
                </span>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
