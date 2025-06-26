"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { ConversationList } from "./conversation-list"
import { MessageThread } from "./message-thread"
import type { Conversation } from "./types"
import { useRole } from "@/components/role-context"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { MessageSquarePlus, RefreshCw } from "lucide-react"

export function MessagesPage() {
  // Change the type to allow all possible roles
  const { userRole: role } = useRole() as { userRole: string }
  const { toast } = useToast()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [showMobileThread, setShowMobileThread] = useState(false)

  // Use ref to track if we've done initial load
  const hasInitiallyLoaded = useRef(false)

  // Check if we're on mobile
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkIfMobile()
    window.addEventListener("resize", checkIfMobile)

    return () => {
      window.removeEventListener("resize", checkIfMobile)
    }
  }, [])

  // Load conversations function - stable reference
  const loadConversations = useCallback(
    async (showRefreshingState = false) => {
      try {
        if (showRefreshingState) {
          setRefreshing(true)
        } else if (!hasInitiallyLoaded.current) {
          setLoading(true)
        }

        const response = await fetch("/api/messages/conversations")
        const data = await response.json()

        if (data.success) {
          setConversations(data.conversations)

          // Auto-select first conversation only on initial load
          if (!hasInitiallyLoaded.current && data.conversations.length > 0) {
            setSelectedConversation(data.conversations[0])
            if (role !== "super-admin") {
              setShowMobileThread(true)
            }
          }

          // Update selected conversation if it exists in the new data
          if (selectedConversation) {
            const updatedConversation = data.conversations.find(
              (conv: Conversation) => conv.id === selectedConversation.id,
            )
            if (updatedConversation) {
              setSelectedConversation(updatedConversation)
            }
          }

          if (showRefreshingState) {
            toast({
              title: "Refreshed",
              description: "Conversations updated successfully",
            })
          }

          hasInitiallyLoaded.current = true
        } else {
          toast({
            title: "Error",
            description: "Failed to load conversations",
            variant: "destructive",
          })
        }
      } catch (error) {
        console.error("Error loading conversations:", error)
        toast({
          title: "Error",
          description: "Failed to load conversations",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
        setRefreshing(false)
      }
    },
    [role, toast], // Removed selectedConversation from dependencies
  )

  // Initial load - only run once
  useEffect(() => {
    if (!hasInitiallyLoaded.current) {
      loadConversations()
    }
  }, []) // Empty dependency array for initial load only

  // Manual refresh function
  const handleRefresh = useCallback(() => {
    loadConversations(true)
  }, [loadConversations])

  // Auto-refresh every 30 seconds - separate effect
  useEffect(() => {
    if (!hasInitiallyLoaded.current) return // Don't start auto-refresh until initial load

    const interval = setInterval(() => {
      // Silent refresh without showing loading states
      void fetch("/api/messages/conversations")
        .then((response) => response.json())
        .then((data) => {
          if (data.success) {
            setConversations(data.conversations)

            // Update selected conversation if it exists
            if (selectedConversation) {
              const updatedConversation = data.conversations.find(
                (conv: Conversation) => conv.id === selectedConversation.id,
              )
              if (updatedConversation) {
                setSelectedConversation(updatedConversation)
              }
            }
          }
        })
        .catch((error) => {
          console.error("Auto-refresh error:", error)
        })
    }, 30000)

    return () => clearInterval(interval)
  }, [selectedConversation?.id]) // Only depend on selected conversation ID

  // Auto-create conversation with super admin for school/eca users
  const createSupportConversation = useCallback(async () => {
    try {
      // Find super admin first
      const usersResponse = await fetch("/api/messages/users")
      const usersData = await usersResponse.json()

      if (usersData.success) {
        const superAdmin = usersData.users.find((user: any) => user.role === "super-admin")

        if (superAdmin) {
          const response = await fetch("/api/messages/conversations", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              participantIds: [superAdmin.id],
              title: "Support Conversation",
            }),
          })

          const data = await response.json()

          if (data.success) {
            await loadConversations()
            toast({
              title: "Success",
              description: "Support conversation created",
            })
          } else {
            toast({
              title: "Error",
              description: "Failed to create support conversation",
              variant: "destructive",
            })
          }
        }
      }
    } catch (error) {
      console.error("Error creating support conversation:", error)
      toast({
        title: "Error",
        description: "Failed to create support conversation",
        variant: "destructive",
      })
    }
  }, [loadConversations, toast])

  // Handle selecting a conversation
  const handleSelectConversation = useCallback(
    async (conversation: Conversation) => {
      setSelectedConversation(conversation)

      // Mark conversation as read
      try {
        await fetch(`/api/messages/conversations/${conversation.id}/read`, {
          method: "PUT",
        })

        // Update local state
        setConversations((prev) =>
          prev.map((conv) => (conv.id === conversation.id ? { ...conv, unreadCount: 0 } : conv)),
        )
      } catch (error) {
        console.error("Error marking conversation as read:", error)
      }

      // On mobile, show the thread view
      if (isMobile) {
        setShowMobileThread(true)
      }
    },
    [isMobile],
  )

  // Handle sending a new message
  const handleSendMessage = useCallback(
    async (conversationId: string, content: string, files?: File[]) => {
      try {
        let attachments = []

        // Upload files if any
        if (files && files.length > 0) {
          const formData = new FormData()
          files.forEach((file) => {
            formData.append("files", file)
          })

          const uploadResponse = await fetch("/api/messages/upload", {
            method: "POST",
            body: formData,
          })

          const uploadData = await uploadResponse.json()

          if (uploadData.success) {
            attachments = uploadData.files
          } else {
            toast({
              title: "Error",
              description: "Failed to upload files",
              variant: "destructive",
            })
            return
          }
        }

        const response = await fetch(`/api/messages/conversations/${conversationId}/messages`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            content,
            attachments,
          }),
        })

        const data = await response.json()

        if (data.success) {
          // Reload conversations to get updated data
          await loadConversations()

          toast({
            title: "Success",
            description: "Message sent successfully",
          })
        } else {
          toast({
            title: "Error",
            description: "Failed to send message",
            variant: "destructive",
          })
        }
      } catch (error) {
        console.error("Error sending message:", error)
        toast({
          title: "Error",
          description: "Failed to send message",
          variant: "destructive",
        })
      }
    },
    [loadConversations, toast],
  )

  // Handle creating a new conversation
  const handleCreateConversation = useCallback(
    async (userId: string, userName: string, userRole: string, schoolName?: string) => {
      try {
        const response = await fetch("/api/messages/conversations", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            participantIds: [userId],
            title: `Conversation with ${userName}`,
          }),
        })

        const data = await response.json()

        if (data.success) {
          await loadConversations()
          toast({
            title: "Success",
            description: "Conversation created successfully",
          })
        } else {
          toast({
            title: "Error",
            description: "Failed to create conversation",
            variant: "destructive",
          })
        }
      } catch (error) {
        console.error("Error creating conversation:", error)
        toast({
          title: "Error",
          description: "Failed to create conversation",
          variant: "destructive",
        })
      }
    },
    [loadConversations, toast],
  )

  // Handle back button on mobile
  const handleBackToList = useCallback(() => {
    setShowMobileThread(false)
  }, [])

  if (loading) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Loading conversations...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex flex-col space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {role === "super-admin" ? "Message Center" : "Support Messages"}
            </h1>
            <p className="text-muted-foreground">
              {role === "super-admin"
                ? "Manage conversations with schools and ECA coordinators"
                : "Get help and support from the administration team"}
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
            {refreshing ? "Refreshing..." : "Refresh"}
          </Button>
        </div>

        <div className="bg-white rounded-lg border shadow-sm overflow-hidden h-[calc(100vh-220px)]">
          <div className="flex h-full">
            {/* Conversation list */}
            {(role === "super-admin" || (role !== "super-admin" && isMobile && !showMobileThread)) && (
              <div className={`${isMobile && showMobileThread ? "hidden" : "block"} w-full md:w-1/3 border-r`}>
                <ConversationList
                  conversations={conversations}
                  selectedId={selectedConversation?.id}
                  onSelect={handleSelectConversation}
                  onCreateNew={handleCreateConversation}
                  userRole={role}
                  onRefresh={handleRefresh}
                  refreshing={refreshing}
                />
              </div>
            )}

            {/* Message thread */}
            <div
              className={`${isMobile && !showMobileThread ? "hidden" : "block"} w-full ${role === "super-admin" ? "md:w-2/3" : ""}`}
            >
              {selectedConversation ? (
                <MessageThread
                  conversation={selectedConversation}
                  onSendMessage={handleSendMessage}
                  userRole={role}
                  onBack={isMobile && role !== "super-admin" ? handleBackToList : undefined}
                  onRefresh={handleRefresh}
                  refreshing={refreshing}
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground space-y-4">
                  <div className="text-center">
                    <MessageSquarePlus className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      {role === "super-admin" ? "No conversation selected" : "No conversations yet"}
                    </h3>
                    <p className="text-sm">
                      {role === "super-admin"
                        ? "Select a conversation to view messages"
                        : "Start a conversation with support to get help"}
                    </p>
                  </div>
                  {role !== "super-admin" && (
                    <Button
                      onClick={createSupportConversation}
                      className="bg-[var(--primary-color)] hover:bg-[var(--primary-color)]/90"
                    >
                      <MessageSquarePlus className="h-4 w-4 mr-2" />
                      Start Support Conversation
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
