"use client"

import type React from "react"

import { useState, useEffect, useCallback, useRef } from "react"
import { Send, Paperclip, ArrowLeft, RefreshCw, Download, ImageIcon, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useToast } from "@/hooks/use-toast"
import type { Conversation, Message } from "./types"
import { formatDistanceToNow } from "date-fns"

interface MessageThreadProps {
  conversation: Conversation
  onSendMessage: (conversationId: string, content: string, files?: File[]) => void
  userRole: string
  onBack?: () => void
  onRefresh?: () => void
  refreshing?: boolean
}

export function MessageThread({
  conversation,
  onSendMessage,
  userRole,
  onBack,
  onRefresh,
  refreshing = false,
}: MessageThreadProps) {
  const { toast } = useToast()
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [sending, setSending] = useState(false)
  const [loadingMessages, setLoadingMessages] = useState(true)
  const [refreshingMessages, setRefreshingMessages] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Load messages for the conversation
  const loadMessages = useCallback(
    async (showRefreshingState = false) => {
      if (!conversation?.id) return

      try {
        if (showRefreshingState) {
          setRefreshingMessages(true)
        } else {
          setLoadingMessages(true)
        }

        const response = await fetch(`/api/messages/conversations/${conversation.id}/messages`)
        const data = await response.json()

        if (data.success) {
          setMessages(data.messages || [])

          if (showRefreshingState) {
            toast({
              title: "Messages Refreshed",
              description: "Latest messages loaded successfully",
            })
          }
        } else {
          toast({
            title: "Error",
            description: "Failed to load messages",
            variant: "destructive",
          })
        }
      } catch (error) {
        console.error("Error loading messages:", error)
        toast({
          title: "Error",
          description: "Failed to load messages",
          variant: "destructive",
        })
      } finally {
        setLoadingMessages(false)
        setRefreshingMessages(false)
      }
    },
    [conversation?.id, toast],
  )

  // Load messages when conversation changes
  useEffect(() => {
    if (conversation?.id) {
      loadMessages()
    }
  }, [conversation?.id, loadMessages])

  // Auto-refresh messages every 10 seconds
  useEffect(() => {
    if (!conversation?.id) return

    const interval = setInterval(() => {
      // Silent refresh without showing loading states
      void fetch(`/api/messages/conversations/${conversation.id}/messages`)
        .then((response) => response.json())
        .then((data) => {
          if (data.success) {
            setMessages(data.messages || [])
          }
        })
        .catch((error) => {
          console.error("Auto-refresh messages error:", error)
        })
    }, 10000)

    return () => clearInterval(interval)
  }, [conversation?.id])

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Handle refresh button click
  const handleRefreshMessages = useCallback(() => {
    loadMessages(true)
  }, [loadMessages])

  // Handle file selection
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    const validFiles = files.filter((file) => {
      const maxSize = 10 * 1024 * 1024 // 10MB
      if (file.size > maxSize) {
        toast({
          title: "File too large",
          description: `${file.name} is larger than 10MB`,
          variant: "destructive",
        })
        return false
      }
      return true
    })

    setSelectedFiles((prev) => [...prev, ...validFiles])
  }

  // Remove selected file
  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index))
  }

  // Handle send message
  const handleSend = async () => {
    if (!newMessage.trim() && selectedFiles.length === 0) return

    try {
      setSending(true)
      await onSendMessage(conversation.id, newMessage, selectedFiles)
      setNewMessage("")
      setSelectedFiles([])

      // Refresh messages after sending
      setTimeout(() => {
        loadMessages()
      }, 500)
    } catch (error) {
      console.error("Error sending message:", error)
    } finally {
      setSending(false)
    }
  }

  // Handle key press
  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault()
      handleSend()
    }
  }

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

  // Get conversation title
  const getConversationTitle = () => {
    if (conversation.title) return conversation.title

    const participantsArray = Array.isArray(conversation.participants) ? conversation.participants : []
    const otherParticipant = participantsArray.find((p) => p.userRole !== userRole)
    return otherParticipant?.userName || "Conversation"
  }

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  // Handle file download
  const handleFileDownload = (attachment: any) => {
    const link = document.createElement("a")
    link.href = attachment.url
    link.download = attachment.name
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  if (loadingMessages) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading messages...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b bg-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {onBack && (
              <Button variant="ghost" size="sm" onClick={onBack}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
            <div>
              <h2 className="font-semibold">{getConversationTitle()}</h2>
              <p className="text-sm text-muted-foreground">{conversation.participants?.length || 0} participants</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefreshMessages}
              disabled={refreshingMessages}
              className="flex items-center gap-1"
            >
              <RefreshCw className={`h-3 w-3 ${refreshingMessages ? "animate-spin" : ""}`} />
              {refreshingMessages ? "Refreshing" : "Refresh"}
            </Button>
            {onRefresh && (
              <Button
                variant="outline"
                size="sm"
                onClick={onRefresh}
                disabled={refreshing}
                className="flex items-center gap-1"
              >
                <RefreshCw className={`h-3 w-3 ${refreshing ? "animate-spin" : ""}`} />
                All
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((message) => {
            const isOwnMessage = message.senderRole === userRole
            return (
              <div key={message.id} className={`flex gap-3 ${isOwnMessage ? "flex-row-reverse" : ""}`}>
                <Avatar className={`h-8 w-8 ${getAvatarColor(message.senderRole)}`}>
                  <AvatarFallback className="text-xs">{getInitials(message.senderName)}</AvatarFallback>
                </Avatar>
                <div className={`flex-1 max-w-xs lg:max-w-md ${isOwnMessage ? "text-right" : ""}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium">{message.senderName}</span>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(message.timestamp), { addSuffix: true })}
                    </span>
                  </div>
                  <div
                    className={`rounded-lg p-3 ${
                      isOwnMessage ? "bg-[var(--primary-color)] text-white" : "bg-gray-100 text-gray-900"
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    {message.attachments && message.attachments.length > 0 && (
                      <div className="mt-2 space-y-2">
                        {message.attachments.map((attachment, index) => (
                          <div
                            key={index}
                            className={`flex items-center gap-2 p-2 rounded border ${
                              isOwnMessage ? "border-white/20 bg-white/10" : "border-gray-200 bg-white"
                            }`}
                          >
                            {attachment.type?.startsWith("image/") ? (
                              <ImageIcon className="h-4 w-4" />
                            ) : (
                              <FileText className="h-4 w-4" />
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium truncate">{attachment.name}</p>
                              <p className="text-xs opacity-75">{formatFileSize(attachment.size)}</p>
                            </div>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleFileDownload(attachment)}
                              className={`h-6 w-6 p-0 ${
                                isOwnMessage ? "text-white hover:bg-white/20" : "text-gray-600 hover:bg-gray-100"
                              }`}
                            >
                              <Download className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Selected Files Preview */}
      {selectedFiles.length > 0 && (
        <div className="p-4 border-t bg-gray-50">
          <div className="space-y-2">
            <p className="text-sm font-medium">Selected files:</p>
            {selectedFiles.map((file, index) => (
              <div key={index} className="flex items-center gap-2 p-2 bg-white rounded border">
                {file.type.startsWith("image/") ? (
                  <ImageIcon className="h-4 w-4 text-blue-500" />
                ) : (
                  <FileText className="h-4 w-4 text-gray-500" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{file.name}</p>
                  <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                </div>
                <Button size="sm" variant="ghost" onClick={() => removeFile(index)} className="h-6 w-6 p-0">
                  ×
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Message Input */}
      <div className="p-4 border-t bg-white">
        <div className="flex gap-2">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={handleFileSelect}
            accept="image/*,.pdf,.doc,.docx,.txt,.csv,.xls,.xlsx"
          />
          <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} className="shrink-0">
            <Paperclip className="h-4 w-4" />
          </Button>
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            className="flex-1"
            disabled={sending}
          />
          <Button
            onClick={handleSend}
            disabled={sending || (!newMessage.trim() && selectedFiles.length === 0)}
            className="shrink-0 bg-[var(--primary-color)] hover:bg-[var(--primary-color)]/90"
          >
            {sending ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
