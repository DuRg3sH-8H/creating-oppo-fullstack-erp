"use client"

import { useState, useEffect } from "react"
import { Search, Plus, School, RefreshCw } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import type { Conversation } from "./types"
import { formatDistanceToNow } from "date-fns"

interface ConversationListProps {
  conversations: Conversation[]
  selectedId?: string
  onSelect: (conversation: Conversation) => void
  onCreateNew?: (userId: string, userName: string, userRole: string, schoolName?: string) => void
  userRole: string
  onRefresh?: () => void
  refreshing?: boolean
}

interface AvailableUser {
  id: string
  name: string
  email: string
  role: string
  schoolId?: string
  schoolName?: string
}

export function ConversationList({
  conversations,
  selectedId,
  onSelect,
  onCreateNew,
  userRole,
  onRefresh,
  refreshing = false,
}: ConversationListProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [availableUsers, setAvailableUsers] = useState<AvailableUser[]>([])
  const [loadingUsers, setLoadingUsers] = useState(false)

  // Load available users when dialog opens
  useEffect(() => {
    if (isCreateDialogOpen && onCreateNew) {
      loadAvailableUsers()
    }
  }, [isCreateDialogOpen, onCreateNew])

  const loadAvailableUsers = async () => {
    try {
      setLoadingUsers(true)
      const response = await fetch("/api/messages/users")
      const data = await response.json()

      if (data.success) {
        setAvailableUsers(data.users)
      } else {
        console.error("Failed to load users:", data.error)
      }
    } catch (error) {
      console.error("Error loading users:", error)
    } finally {
      setLoadingUsers(false)
    }
  }

  // Filter conversations based on search query
  const filteredConversations = conversations.filter((conversation) => {
    const searchLower = searchQuery.toLowerCase()

    // Get the other participant (not current user)
    const otherParticipant =
      Array.isArray(conversation.participants) && conversation.participants.length > 0
        ? conversation.participants.find((p) => p.userRole !== userRole) || conversation.participants[0]
        : undefined

    if (!otherParticipant) return false

    return (
      (otherParticipant.userName?.toLowerCase?.().includes(searchLower) ?? false) ||
      (otherParticipant.schoolName && otherParticipant.schoolName.toLowerCase().includes(searchLower)) ||
      (conversation.lastMessage && conversation.lastMessage.toLowerCase().includes(searchLower))
    )
  })

  // Get initials for avatar
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2)
  }

  // Get avatar color based on user role
  const getAvatarColor = (userRole: string) => {
    switch (userRole) {
      case "school":
        return "bg-blue-100 text-blue-800"
      case "eca":
        return "bg-green-100 text-green-800"
      case "super-admin":
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  // Get display info for conversation
  const getConversationDisplayInfo = (conversation: Conversation) => {
    const participantsArr = Array.isArray(conversation.participants) ? conversation.participants : []
    // For super-admin, show the other participant
    if (userRole === "super-admin") {
      const otherParticipant = participantsArr.find((p) => p.userRole !== "super-admin")
      if (otherParticipant) {
        return {
          name: otherParticipant.userName || "Unknown User",
          role: otherParticipant.userRole || "unknown",
          schoolName: otherParticipant.schoolName,
        }
      }
    } else {
      // For school/eca, show super-admin or the other participant
      const superAdmin = participantsArr.find((p) => p.userRole === "super-admin")
      if (superAdmin) {
        return {
          name: superAdmin.userName || "Unknown User",
          role: superAdmin.userRole || "unknown",
          schoolName: undefined,
        }
      }

      const otherParticipant = participantsArr.find((p) => p.userRole !== userRole)
      if (otherParticipant) {
        return {
          name: otherParticipant.userName || "Unknown User",
          role: otherParticipant.userRole || "unknown",
          schoolName: otherParticipant.schoolName,
        }
      }
    }

    return {
      name: "Unknown User",
      role: "unknown",
      schoolName: undefined,
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b">
        <div className="flex items-center gap-2 mb-3">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search messages..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          {onRefresh && (
            <Button
              size="sm"
              variant="outline"
              onClick={onRefresh}
              disabled={refreshing}
              className="flex items-center gap-1"
            >
              <RefreshCw className={`h-3 w-3 ${refreshing ? "animate-spin" : ""}`} />
              {refreshing ? "Refreshing" : "Refresh"}
            </Button>
          )}
          {onCreateNew && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsCreateDialogOpen(true)}
              className="flex items-center gap-1"
            >
              <Plus className="h-3 w-3" />
              New
            </Button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {filteredConversations.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground">
            {searchQuery ? "No conversations match your search" : "No conversations yet"}
          </div>
        ) : (
          <ul>
            {filteredConversations.map((conversation) => {
              const displayInfo = getConversationDisplayInfo(conversation)

              return (
                <li key={conversation.id}>
                  <button
                    className={`w-full text-left px-4 py-3 border-b hover:bg-gray-50 transition-colors flex items-start gap-3 ${selectedId === conversation.id ? "bg-[var(--primary-color)]/5" : ""
                      }`}
                    onClick={() => onSelect(conversation)}
                  >
                    <Avatar className={`h-10 w-10 ${getAvatarColor(displayInfo.role)}`}>
                      <AvatarFallback>{getInitials(displayInfo.name)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline">
                        <h3 className="font-medium truncate">{displayInfo.name}</h3>
                        <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                          {conversation.lastMessageTime &&
                            formatDistanceToNow(new Date(conversation.lastMessageTime), { addSuffix: true })}
                        </span>
                      </div>
                      {displayInfo.schoolName && (
                        <div className="text-xs text-muted-foreground flex items-center gap-1 mb-1">
                          <School className="h-3 w-3" />
                          <span className="truncate">{displayInfo.schoolName}</span>
                        </div>
                      )}
                      <p className="text-sm text-muted-foreground truncate">
                        {conversation.lastMessage || "No messages yet"}
                      </p>
                    </div>
                    {conversation.unreadCount > 0 && (
                      <div className="bg-[var(--primary-color)] text-white text-xs font-medium rounded-full h-5 min-w-[20px] flex items-center justify-center">
                        {conversation.unreadCount}
                      </div>
                    )}
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </div>

      {onCreateNew && (
        <NewConversationDialog
          isOpen={isCreateDialogOpen}
          onClose={() => setIsCreateDialogOpen(false)}
          onCreateNew={onCreateNew}
          availableUsers={availableUsers}
          loadingUsers={loadingUsers}
          userRole={userRole}
        />
      )}
    </div>
  )
}

// Form schema for new conversation
const formSchema = z.object({
  userId: z.string().min(1, "Please select a recipient"),
})

interface NewConversationDialogProps {
  isOpen: boolean
  onClose: () => void
  onCreateNew: (userId: string, userName: string, userRole: string, schoolName?: string) => void
  availableUsers: AvailableUser[]
  loadingUsers: boolean
  userRole: string
}

function NewConversationDialog({
  isOpen,
  onClose,
  onCreateNew,
  availableUsers,
  loadingUsers,
  userRole,
}: NewConversationDialogProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      userId: "",
    },
  })

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    const selectedUser = availableUsers.find((user) => user.id === values.userId)

    if (selectedUser) {
      onCreateNew(selectedUser.id, selectedUser.name, selectedUser.role, selectedUser.schoolName)
      form.reset()
      onClose()
    }
  }

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case "super-admin":
        return "Super Admin"
      case "school":
        return "School Admin"
      case "eca":
        return "ECA Coordinator"
      default:
        return role
    }
  }

  const getDialogTitle = () => {
    if (userRole === "super-admin") {
      return "New Conversation"
    }
    return "Contact Support"
  }

  const getDialogDescription = () => {
    if (userRole === "super-admin") {
      return "Select a user to start a conversation with"
    }
    return "Start a conversation with the support team"
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{getDialogTitle()}</DialogTitle>
          <p className="text-sm text-muted-foreground">{getDialogDescription()}</p>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
            <FormField
              control={form.control}
              name="userId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{userRole === "super-admin" ? "Recipient" : "Support Team"}</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={loadingUsers ? "Loading..." : "Select recipient"} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {loadingUsers ? (
                        <SelectItem value="loading" disabled>
                          Loading users...
                        </SelectItem>
                      ) : availableUsers.length === 0 ? (
                        <SelectItem value="no-users" disabled>
                          No users available
                        </SelectItem>
                      ) : (
                        availableUsers.map((user) => (
                          <SelectItem key={user.id} value={user.id}>
                            <div className="flex items-center gap-2">
                              <span>{user.name}</span>
                              <span className="text-xs text-muted-foreground">
                                ({getRoleDisplayName(user.role)}
                                {user.schoolName ? ` - ${user.schoolName}` : ""})
                              </span>
                            </div>
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-[var(--primary-color)] hover:bg-[var(--primary-color)]/90"
                disabled={loadingUsers}
              >
                {userRole === "super-admin" ? "Start Conversation" : "Contact Support"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
