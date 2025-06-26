"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Bell, Check, CheckCheck, Trash2 } from "lucide-react"
import Link from "next/link"
import { useNotifications } from "./notification-context"
import { formatDistanceToNow } from "date-fns"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { NotificationPriority } from "@/models/notification"

export function NotificationBell() {
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification } = useNotifications()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const toggleDropdown = () => {
    setIsOpen(!isOpen)
  }

  const handleMarkAsRead = async (id: string, event: React.MouseEvent) => {
    event.stopPropagation()
    await markAsRead(id)
  }

  const handleDelete = async (id: string, event: React.MouseEvent) => {
    event.stopPropagation()
    await deleteNotification(id)
  }

  const handleMarkAllAsRead = async (event: React.MouseEvent) => {
    event.stopPropagation()
    await markAllAsRead()
  }

  const getPriorityColor = (priority: NotificationPriority) => {
    switch (priority) {
      case "urgent":
        return "bg-red-100 border-red-200"
      case "high":
        return "bg-orange-100 border-orange-200"
      case "medium":
        return "bg-blue-100 border-blue-200"
      case "low":
        return "bg-gray-100 border-gray-200"
      default:
        return "bg-gray-100 border-gray-200"
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "success":
        return "✅"
      case "warning":
        return "⚠️"
      case "error":
        return "❌"
      case "info":
        return "ℹ️"
      default:
        return "📢"
    }
  }

  // Get recent notifications (last 5)
  const recentNotifications = [...notifications]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5)

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={toggleDropdown}
        className="text-gray-500 hover:text-gray-700 focus:outline-none relative p-1 rounded-full hover:bg-gray-100 transition-colors"
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center animate-pulse">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-lg py-1 z-50 border border-gray-200 max-h-96 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 flex justify-between items-center">
            <h3 className="text-sm font-semibold text-gray-700">Notifications</h3>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleMarkAllAsRead}
                  className="text-xs text-blue-600 hover:text-blue-800"
                >
                  <CheckCheck className="h-3 w-3 mr-1" />
                  Mark all read
                </Button>
              )}
              <Link
                href="/dashboard/notifications"
                className="text-xs text-blue-600 hover:text-blue-800"
                onClick={() => setIsOpen(false)}
              >
                View all
              </Link>
            </div>
          </div>

          <div className="max-h-80 overflow-y-auto">
            {recentNotifications.length > 0 ? (
              recentNotifications.map((notification) => (
                <div
                  key={notification._id}
                  className={cn(
                    "px-4 py-3 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors relative",
                    !notification.read && "bg-blue-50",
                    getPriorityColor(notification.priority),
                  )}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1 min-w-0">
                      {notification.actionUrl ? (
                        <Link
                          href={notification.actionUrl}
                          className="block"
                          onClick={() => {
                            setIsOpen(false)
                            if (!notification.read) {
                              markAsRead(notification._id!)
                            }
                          }}
                        >
                          <div className="flex items-start gap-2">
                            <span className="text-sm">{getTypeIcon(notification.type)}</span>
                            <div className="flex-1 min-w-0">
                              <h4
                                className={cn(
                                  "text-sm truncate",
                                  !notification.read ? "font-semibold text-gray-800" : "font-medium text-gray-700",
                                )}
                              >
                                {notification.title}
                              </h4>
                              <p className="text-xs text-gray-500 mt-1 line-clamp-2">{notification.message}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs text-gray-400">
                                  {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                                </span>
                                <Badge variant="secondary" className="text-xs">
                                  {notification.category}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </Link>
                      ) : (
                        <div className="flex items-start gap-2">
                          <span className="text-sm">{getTypeIcon(notification.type)}</span>
                          <div className="flex-1 min-w-0">
                            <h4
                              className={cn(
                                "text-sm",
                                !notification.read ? "font-semibold text-gray-800" : "font-medium text-gray-700",
                              )}
                            >
                              {notification.title}
                            </h4>
                            <p className="text-xs text-gray-500 mt-1 line-clamp-2">{notification.message}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs text-gray-400">
                                {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                              </span>
                              <Badge variant="secondary" className="text-xs">
                                {notification.category}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-1 ml-2">
                      {!notification.read && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => handleMarkAsRead(notification._id!, e)}
                          className="h-6 w-6 p-0 text-gray-500 hover:text-gray-700"
                          title="Mark as read"
                        >
                          <Check className="h-3 w-3" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => handleDelete(notification._id!, e)}
                        className="h-6 w-6 p-0 text-gray-500 hover:text-red-600"
                        title="Delete"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="px-4 py-8 text-center text-gray-500 text-sm">
                <Bell className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                <p>No notifications yet</p>
              </div>
            )}
          </div>

          {recentNotifications.length > 0 && (
            <div className="px-4 py-2 border-t border-gray-100 text-center">
              <Link
                href="/dashboard/notifications"
                className="text-xs text-gray-500 hover:text-gray-700 block"
                onClick={() => setIsOpen(false)}
              >
                View all {notifications.length} notifications
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
