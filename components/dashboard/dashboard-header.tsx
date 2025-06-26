"use client"

import { useState, useEffect } from "react"
import { ChevronDown, Menu, Search } from "lucide-react"
import { cn } from "@/lib/utils"
import { useTheme } from "@/components/theme-context"
import { useLanguage } from "@/components/language-context"
import { LanguageSwitcher } from "@/components/language-switcher"
import { NotificationBell } from "@/components/notifications/notification-bell"
import { useRole, type UserRole } from "@/components/role-context"
import { useAuth } from "@/components/auth/auth-context"
import Image from "next/image"

interface DashboardHeaderProps {
  onToggleSidebar: () => void
}

export function DashboardHeader({ onToggleSidebar }: DashboardHeaderProps) {
  const { setSchoolTheme, resetTheme } = useTheme()
  const { t } = useLanguage()
  const { setUserRole, setUserName, logout } = useRole()
  const { user } = useAuth()
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [isLoadingTheme, setIsLoadingTheme] = useState(false)

  // Fetch and apply school theme based on user role and school
  useEffect(() => {
    const applyUserTheme = async () => {
      if (!user) return

      setUserName(user.name || "")
      setUserRole(user.role as UserRole)

      // Super admin uses default theme
      if (user.role === "super-admin") {
        resetTheme()
        return
      }

      // School and ECA users should use their school's theme
      if ((user.role === "school" || user.role === "eca") && user.schoolId) {
        setIsLoadingTheme(true)
        try {
          const response = await fetch(`/api/schools/theme/${user.schoolId}`, {
            credentials: "include",
          })

          if (response.ok) {
            const schoolData = await response.json()
            if (schoolData.success && schoolData.school) {
              // Apply the school's theme
              setSchoolTheme({
                id: schoolData.school._id || schoolData.school.id,
                name: schoolData.school.name,
                logo: schoolData.school.logo || "/placeholder.svg?height=80&width=80",
                primaryColor: schoolData.school.primaryColor || "#2563eb",
                secondaryColor: schoolData.school.secondaryColor || "#1d4ed8",
                accentColor: schoolData.school.accentColor || "#3b82f6",
                darkColor: schoolData.school.darkColor || "#1e40af",
                isActive: false
              })
            } else {
              // Fallback to default theme if school not found
              resetTheme()
            }
          } else {
            // Fallback to default theme on error
            resetTheme()
          }
        } catch (error) {
          console.error("Error fetching school theme:", error)
          resetTheme()
        } finally {
          setIsLoadingTheme(false)
        }
      } else {
        // No school ID, use default theme
        resetTheme()
      }
    }

    applyUserTheme()
  }, [user, setUserName, setUserRole, setSchoolTheme, resetTheme])

  const toggleUserMenu = () => {
    setShowUserMenu(!showUserMenu)
  }

  const displayName = user?.name || "User"
  const displayRole = user?.role

  return (
    <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-4 md:px-6">
      <div className="flex items-center">
        <button onClick={onToggleSidebar} className="mr-4 text-gray-500 hover:text-gray-700 focus:outline-none">
          <Menu className="h-6 w-6" />
        </button>

        <div className="relative w-64 hidden md:block">
          <input
            type="text"
            placeholder={t("search")}
            className="w-full h-9 pl-9 pr-4 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent bg-white"
          />
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
        </div>
      </div>

      <div className="flex items-center space-x-4">
        {/* Language Switcher */}
        <LanguageSwitcher />

        {/* Role Badge (display only) */}
        <div className="flex items-center">
          <span
            className={cn(
              "px-3 py-1 rounded-full text-xs font-medium",
              displayRole === "super-admin" && "bg-purple-100 text-purple-800",
              displayRole === "school" && "bg-blue-100 text-blue-800",
              displayRole === "eca" && "bg-green-100 text-green-800",
            )}
          >
            {displayRole === "super-admin" && t("super_admin")}
            {displayRole === "school" && t("school_admin")}
            {displayRole === "eca" && t("eca_coordinator")}
            {isLoadingTheme && " (Loading theme...)"}
          </span>
        </div>

        {/* Notifications */}
        <NotificationBell />

        {/* User Menu */}
        <div className="relative">
          <button onClick={toggleUserMenu} className="flex items-center space-x-2 focus:outline-none">
            <div
              className="relative h-8 w-8 rounded-full text-white flex items-center justify-center overflow-hidden"
              style={{ backgroundColor: "var(--primary-color)" }}
            >
              {displayName ? (
                displayName.charAt(0).toUpperCase()
              ) : (
                <Image src="/placeholder.svg?height=32&width=32" alt="User" width={32} height={32} />
              )}
            </div>
            <span className="hidden md:inline-block text-sm font-medium text-gray-700">{displayName}</span>
            <ChevronDown className="h-4 w-4 text-gray-500" />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 border border-gray-200">
              <a href="/dashboard/settings" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                {t("settings")}
              </a>
              <div className="border-t border-gray-100 my-1"></div>
              <button
                onClick={() => logout()}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                {t("sign_out")}
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
