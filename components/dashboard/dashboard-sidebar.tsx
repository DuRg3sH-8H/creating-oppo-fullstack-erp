"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  BarChart3,
  BookOpen,
  Calendar,
  ChevronLeft,
  FileText,
  LayoutDashboard,
  Settings,
  Shield,
  Users,
  Award,
  GraduationCap,
  UserRound,
  MessageSquare,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/components/auth/auth-context"
import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"

interface DashboardSidebarProps {
  isOpen: boolean
  onToggle: () => void
}

interface MenuItem {
  name: string
  icon: string
  href: string
  roles: string[]
}

export function DashboardSidebar({ isOpen, onToggle }: DashboardSidebarProps) {
  const { user } = useAuth()
  const pathname = usePathname()
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchMenuItems = async () => {
      try {
        const response = await fetch("/api/navigation/menu")
        const data = await response.json()

        if (data.success) {
          setMenuItems(data.menuItems)
        }
      } catch (error) {
        console.error("Error fetching menu items:", error)
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      fetchMenuItems()
    }
  }, [user])

  const getIcon = (iconName: string) => {
    const icons: { [key: string]: React.ComponentType<any> } = {
      LayoutDashboard,
      GraduationCap,
      Shield,
      UserRound,
      BookOpen,
      Award,
      Calendar,
      FileText,
      BarChart3,
      Users,
      MessageSquare,
      Settings,
    }
    return icons[iconName] || LayoutDashboard
  }

  if (!user) return null

  return (
    <AnimatePresence initial={false}>
      <motion.aside
        initial={{ width: isOpen ? 250 : 0 }}
        animate={{ width: isOpen ? 250 : 0 }}
        exit={{ width: 0 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className={cn("bg-white border-r border-gray-200 h-screen overflow-hidden ", !isOpen && "w-0")}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: isOpen ? 1 : 0 }}
              transition={{ duration: 0.2 }}
              className="flex items-center"
            >
              {user.role !== "super-admin" && user.schoolName ? (
                <div className="flex items-center">
                  <div className="relative h-8 w-8 rounded-md overflow-hidden border border-gray-200 bg-gray-50 mr-2">
                    <Image
                      src="/placeholder.svg?height=32&width=32"
                      alt={user.schoolName || "School"}
                      fill
                      className="object-contain p-1"
                    />
                  </div>
                  <h2 className="text-blue-600 font-bold text-lg truncate max-w-[160px]">
                    {user.schoolName || "School ERP"}
                  </h2>
                </div>
              ) : (
                <>
                  <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold rounded-lg p-2 mr-2">
                    ERP
                  </div>
                  <h2 className="text-blue-600 font-bold text-lg">School ERP</h2>
                </>
              )}
            </motion.div>
            <button onClick={onToggle} className="text-blue-600 hover:text-blue-800 transition-colors">
              <ChevronLeft className="h-5 w-5" />
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto py-4">
            <ul className="space-y-1 px-2">
              {loading ? (
                <li className="px-3 py-2 text-gray-500">Loading...</li>
              ) : (
                menuItems.map((item, index) => {
                  const IconComponent = getIcon(item.icon)
                  const isActive = pathname === item.href

                  return (
                    <motion.li
                      key={item.name}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                    >
                      <Link
                        href={item.href}
                        className={cn(
                          "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
                          isActive
                            ? "bg-blue-100 text-blue-700 font-medium"
                            : "text-gray-700 hover:bg-gray-100 hover:text-gray-900",
                        )}
                      >
                        <IconComponent className="h-5 w-5" />
                        <span>{item.name}</span>
                      </Link>
                    </motion.li>
                  )
                })
              )}
            </ul>
          </nav>

          <div className="p-4 border-t border-gray-200">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: isOpen ? 1 : 0 }}
              transition={{ duration: 0.2 }}
              className="bg-blue-50 rounded-lg p-3"
            >
              <p className="text-sm text-blue-700 font-medium">Need help?</p>
              <p className="text-xs text-blue-600 mt-1">Contact our support team</p>
              <Link
                href="/dashboard/messages"
                className="mt-2 text-xs font-medium text-blue-600 hover:text-blue-800 transition-colors block"
              >
                Send message
              </Link>
            </motion.div>
          </div>
        </div>
      </motion.aside>
    </AnimatePresence>
  )
}
