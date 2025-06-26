"use client"

import React, { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { getCookie } from "@/lib/auth-utils"

export type UserRole = "super-admin" | "school" | "eca"

type RoleContextType = {
  userRole: UserRole
  userName: string
  isAuthenticated: boolean
  setUserRole: (role: UserRole) => void
  setUserName: (name: string) => void
  login: (role: UserRole, name: string) => void
  logout: () => void
}

const defaultContext: RoleContextType = {
  userRole: "super-admin",
  userName: "Admin User",
  isAuthenticated: false,
  setUserRole: () => {},
  setUserName: () => {},
  login: () => {},
  logout: () => {},
}

const RoleContext = createContext<RoleContextType>(defaultContext)

export const useRole = () => useContext(RoleContext)

interface RoleProviderProps {
  children: ReactNode
}

export function RoleProvider({ children }: RoleProviderProps) {
  const [mounted, setMounted] = useState(false)

  // Initialize state from localStorage if available, otherwise use defaults
  const [userRole, setUserRoleState] = useState<UserRole>("super-admin")
  const [userName, setUserNameState] = useState<string>("Admin User")
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false)

  // Initialize state from localStorage and cookies on client-side only
  useEffect(() => {
    setMounted(true)

    // Use a try-catch block to handle potential localStorage errors
    try {
      // Get authentication status from cookies
      const authFromCookie = getCookie("isAuthenticated") === "true"

      // Get user role from localStorage or cookies (fallback)
      const savedRole =
        (localStorage.getItem("userRole") as UserRole | null) || (getCookie("userRole") as UserRole | null)
      const savedName = localStorage.getItem("userName") || getCookie("userName")


      if (savedRole) setUserRoleState(savedRole as UserRole)
      if (savedName) setUserNameState(savedName)
      setIsAuthenticated(authFromCookie)
    } catch (error) {
      console.error("Error accessing localStorage/cookies:", error)
    }
  }, [])

  // Memoize the setUserRole function to prevent it from changing on every render
  const setUserRole = React.useCallback((newRole: UserRole) => {
    setUserRoleState(newRole)
    try {
      localStorage.setItem("userRole", newRole)
      // Also set in cookie for consistency
      document.cookie = `userRole=${newRole}; path=/; max-age=86400`
    } catch (error) {
      console.error("Error setting userRole:", error)
    }
  }, [])

  // Memoize the setUserName function to prevent it from changing on every render
  const setUserName = React.useCallback((newName: string) => {
    setUserNameState(newName)
    try {
      localStorage.setItem("userName", newName)
      // Also set in cookie for consistency
      document.cookie = `userName=${encodeURIComponent(newName)}; path=/; max-age=86400`
    } catch (error) {
      console.error("Error setting userName:", error)
    }
  }, [])

  // Login function
  const login = React.useCallback((role: UserRole, name: string) => {
    setUserRoleState(role)
    setUserNameState(name)
    setIsAuthenticated(true)

    try {
      localStorage.setItem("userRole", role)
      localStorage.setItem("userName", name)
      localStorage.setItem("isAuthenticated", "true")

      // Set cookies for server-side authentication checks
      document.cookie = `isAuthenticated=true; path=/; max-age=86400`
      document.cookie = `userRole=${role}; path=/; max-age=86400`
      document.cookie = `userName=${encodeURIComponent(name)}; path=/; max-age=86400`
    } catch (error) {
      console.error("Error during login:", error)
    }
  }, [])

  // Logout function
  const logout = React.useCallback(() => {
    setIsAuthenticated(false)

    try {
      localStorage.removeItem("isAuthenticated")
      localStorage.removeItem("userRole")
      localStorage.removeItem("userName")

      // Clear authentication cookies
      document.cookie = "isAuthenticated=; path=/; max-age=0"
      document.cookie = "userRole=; path=/; max-age=0"
      document.cookie = "userName=; path=/; max-age=0"
    } catch (error) {
      console.error("Error during logout:", error)
    }
  }, [])

  // Create a memoized context value to prevent unnecessary re-renders
  const contextValue = React.useMemo(
    () => ({
      userRole,
      setUserRole,
      userName,
      setUserName,
      isAuthenticated,
      login,
      logout,
    }),
    [userRole, setUserRole, userName, setUserName, isAuthenticated, login, logout],
  )

  // Don't render anything until mounted to prevent hydration mismatch
  if (!mounted) {
    return <>{children}</>
  }

  return <RoleContext.Provider value={contextValue}>{children}</RoleContext.Provider>
}
