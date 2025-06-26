"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import type { User } from "@/models/user"
import { isAuthenticated, clearAuthCookies } from "@/lib/auth-utils"

interface AuthContextType {
  user: Partial<User> | null
  loading: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; message: string }>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Partial<User> | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Check if user is logged in
    const checkAuth = async () => {
      try {
        // First check if authentication cookie exists
        if (!isAuthenticated()) {
          setUser(null)
          setLoading(false)
          return
        }

        const res = await fetch("/api/auth/me", {
          credentials: "include",
          cache: "no-store",
        })

        if (res.ok) {
          const data = await res.json()
          setUser(data.user)
        } else {
          setUser(null)
          // Clear invalid cookies
          clearAuthCookies()
        }
      } catch (error) {
        console.error("Auth check error:", error)
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [])

  const login = async (email: string, password: string) => {
    try {
      setLoading(true)
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()

      if (data.success) {
        setUser(data.user)
        // Use router.push instead of window.location for better UX
        router.push("/dashboard")
        // Also trigger a page refresh to ensure middleware runs
        setTimeout(() => {
          window.location.reload()
        }, 100)
        return { success: true, message: "Login successful" }
      } else {
        return { success: false, message: data.message || "Login failed" }
      }
    } catch (error) {
      console.error("Login error:", error)
      return { success: false, message: "An error occurred during login" }
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      })
      setUser(null)
      clearAuthCookies()
      router.push("/")
      // Clear any cached data
      setTimeout(() => {
        window.location.reload()
      }, 100)
    } catch (error) {
      console.error("Logout error:", error)
      // Even if logout fails, clear local state
      setUser(null)
      clearAuthCookies()
      router.push("/")
    }
  }

  return <AuthContext.Provider value={{ user, loading, login, logout }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
