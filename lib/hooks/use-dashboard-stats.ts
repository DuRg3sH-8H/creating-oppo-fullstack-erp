"use client"

import { useState, useEffect } from "react"

interface SchoolAdminStats {
  totalStudents: number
  totalTeachers: number
  totalClubs: number
  totalEvents: number
  isoProgress: number
  documentCount: number
  recentActivities: any[]
}

interface EcaStats {
  managedClubs: number
  totalMembers: number
  totalEvents: number
  completedEvents: number
  upcomingEvents: number
  studentEngagement: number
  monthlyParticipation: number
  clubDetails: any[]
}

export function useDashboardStats() {
  const [stats, setStats] = useState<SchoolAdminStats | EcaStats | null>(null)
  const [role, setRole] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchStats = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch("/api/dashboard/stats", {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      if (data.success) {
        setStats(data.data)
        setRole(data.role)
        setError(null)
      } else {
        setError(data.message || "Failed to fetch stats")
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Network error occurred"
      setError(errorMessage)
      console.error("Error fetching dashboard stats:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()
  }, [])

  return { stats, role, loading, error, refetch: fetchStats }
}

// Legacy hooks for backward compatibility
export function useSchoolAdminStats() {
  const { stats, role, loading, error, refetch } = useDashboardStats()

  return {
    stats: role === "school" ? (stats as SchoolAdminStats) : null,
    loading,
    error,
    refetch,
  }
}

export function useEcaStats() {
  const { stats, role, loading, error, refetch } = useDashboardStats()

  return {
    stats: role === "eca" ? (stats as EcaStats) : null,
    loading,
    error,
    refetch,
  }
}
