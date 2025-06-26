"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar"
import { SuperAdminISOView } from "@/components/iso/super-admin-iso-view"
import { SchoolAdminISOView } from "@/components/iso/school-admin-iso-view"
import { useTheme } from "@/components/theme-context"

export function ISOManagementPage() {
  // In a real app, this would come from authentication
  const [userRole, setUserRole] = useState<"super-admin" | "school" | "eca">("super-admin")
  const [userName, setUserName] = useState("Alex Johnson")
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)

  const { schoolName } = useTheme()

  // For demo purposes - allows switching between roles
  const handleRoleChange = (role: "super-admin" | "school" | "eca") => {
    setUserRole(role)

    // Update name based on role for demo
    if (role === "super-admin") setUserName("Alex Johnson")
    else if (role === "school") setUserName("Sarah Williams")
    else setUserName("Michael Chen")
  }

  return (
    <div className="flex h-screen bg-[#f8f9fa]">
      <DashboardSidebar userRole={userRole} isOpen={isSidebarOpen} onToggle={() => setIsSidebarOpen(!isSidebarOpen)} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader
          userName={userName}
          userRole={userRole}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          onRoleChange={handleRoleChange}
        />

        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="max-w-7xl mx-auto">
            <div className="mb-6">
              <motion.h1
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-2xl font-bold text-[var(--accent-color)]"
              >
                ISO 21001 Management System
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="text-[var(--accent-color)]/70 mt-1"
              >
                {userRole === "super-admin"
                  ? "Manage ISO clauses, review submissions, and monitor certification progress across all schools"
                  : `Track and manage ISO compliance for ${schoolName || "your school"}`}
              </motion.p>
            </div>

            {userRole === "super-admin" ? <SuperAdminISOView /> : <SchoolAdminISOView userRole={userRole} />}
          </div>
        </main>
      </div>
    </div>
  )
}
