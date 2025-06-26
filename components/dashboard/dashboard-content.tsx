"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { KpiCards } from "@/components/dashboard/kpi-cards"
import { ShortcutSection } from "@/components/dashboard/shortcut-section"
import { RecentActivities } from "@/components/dashboard/recent-activities"
import { useAuth } from "@/components/auth/auth-context"
import { Loader2 } from "lucide-react"
import type { DashboardStats } from "@/lib/db/dashboard"

export function DashboardContent() {
  const { user } = useAuth()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const response = await fetch("/api/dashboard/stats")
        const data = await response.json()

        if (data.success) {
          setStats(data.stats)
        } else {
          setError(data.message || "Failed to fetch dashboard data")
        }
      } catch (err) {
        console.error("Error fetching dashboard stats:", err)
        setError("An error occurred while fetching dashboard data")
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      fetchDashboardStats()
    }
  }, [user])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-red-600 mb-2">Error loading dashboard</p>
          <p className="text-gray-500 text-sm">{error}</p>
        </div>
      </div>
    )
  }

  if (!user || !stats) {
    return null
  }

  const getRoleTitle = () => {
    switch (user.role) {
      case "super-admin":
        return "Manage your entire school network"
      case "school":
        return `Manage ${user.schoolName || "your school's"} activities and performance`
      case "eca":
        return `Manage ${user.schoolName || "your"} extra-curricular activities`
      default:
        return "Welcome to your dashboard"
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-7xl mx-auto"
    >
      <div className="mb-8">
        <motion.h1
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-3xl font-bold text-gray-900"
        >
          Welcome, {user.name}
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-gray-600 mt-1"
        >
          {getRoleTitle()}
        </motion.p>
      </div>

      <KpiCards userRole={user.role || ""} kpiData={stats.kpiData} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
        <div className="lg:col-span-2">
          <ShortcutSection userRole={user.role || "school"} />
        </div>
        <div>
          <RecentActivities userRole={user.role || ""} activities={stats.recentActivities} />
        </div>
      </div>
    </motion.div>
  )
}
