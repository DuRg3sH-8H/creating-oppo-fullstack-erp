"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { KpiCards } from "@/components/dashboard/kpi-cards"
import { ShortcutSection } from "@/components/dashboard/shortcut-section"
import { RecentActivities } from "@/components/dashboard/recent-activities"
import type { DashboardStats } from "@/lib/db/dashboard"

interface SuperAdminDashboardProps {
  userName: string
}

export function SuperAdminDashboard({ userName }: SuperAdminDashboardProps) {
  const [dashboardData, setDashboardData] = useState<DashboardStats>({
    kpiData: [],
    recentActivities: [],
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true)
        const response = await fetch("/api/dashboard/stats", {
          credentials: "include",
        })

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data = await response.json()
        if (data.success) {
          setDashboardData(data.stats)
        } else {
          throw new Error(data.message || "Failed to load dashboard data")
        }
      } catch (err) {
        console.error("Error fetching dashboard data:", err)
        setError(err instanceof Error ? err.message : "An error occurred")
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[var(--accent-color)]">Welcome, {userName}</h1>
          <p className="text-[var(--accent-color)]/70 mt-1">Manage your entire school network</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow p-6 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-full"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[var(--accent-color)]">Welcome, {userName}</h1>
          <p className="text-[var(--accent-color)]/70 mt-1">Manage your entire school network</p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">Error loading dashboard data: {error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-7xl mx-auto p-6"
    >
      <div className="mb-8">
        <motion.h1
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-3xl font-bold text-[var(--accent-color)]"
        >
          Welcome, {userName}
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-[var(--accent-color)]/70 mt-1"
        >
          Manage your entire school network
        </motion.p>
      </div>

      <KpiCards userRole="super-admin" kpiData={dashboardData.kpiData} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
        <div className="lg:col-span-2">
          <ShortcutSection userRole="super-admin" />
        </div>
        <div>
          <RecentActivities userRole="super-admin" activities={dashboardData.recentActivities} />
        </div>
      </div>
    </motion.div>
  )
}
