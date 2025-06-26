"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import type { GamificationStats } from "@/lib/db/gamification"

interface GamificationContextType {
  stats: GamificationStats | null
  loading: boolean
  error: string | null
  refreshStats: () => Promise<void>
    completeTask: (taskType: string, metadata?: any) => Promise<void>

}

const GamificationContext = createContext<GamificationContextType | undefined>(undefined)

export function GamificationProvider({ children }: { children: React.ReactNode }) {
  const [stats, setStats] = useState<GamificationStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchStats = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch("/api/gamification/stats", {
        credentials: "include",
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      if (data.success) {
        setStats(data.stats)
      } else {
        throw new Error(data.message || "Failed to fetch gamification stats")
      }
    } catch (error) {
      console.error("Error fetching gamification stats:", error)
      setError(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  const refreshStats = async () => {
    await fetchStats()
  }

  const completeTask = async (taskType: string, metadata?: any) => {
    try {
      setLoading(true)
      
      const response = await fetch("/api/gamification/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ taskType, metadata }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      await refreshStats()
    } catch (error) {
      console.error("Error completing task:", error)
      setError(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()
  }, [])

  return (
    <GamificationContext.Provider
      value={{
        stats,
        loading,
        error,
        refreshStats,
        completeTask,
      }}
    >
      {children}
    </GamificationContext.Provider>
  )
}

export function useGamification() {
  const context = useContext(GamificationContext)
  if (context === undefined) {
    throw new Error("useGamification must be used within a GamificationProvider")
  }
  return context
}
