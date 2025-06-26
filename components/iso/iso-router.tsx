"use client"

import { useRole } from "@/components/role-context"
import { useTheme } from "@/components/theme-context"
import { motion } from "framer-motion"
import { SuperAdminISOView } from "@/components/iso/super-admin-iso-view"
import { SchoolAdminISOView } from "@/components/iso/school-admin-iso-view"
import { useRouter } from "next/navigation"

export function IsoRouter() {
  const { userRole } = useRole()
  const { schoolName } = useTheme()
  const router = useRouter()

  // Redirect ECA users
  if (userRole === "eca") {
    if (typeof window !== "undefined") {
      router.push("/dashboard")
    }
    return null
  }

  return (
    <main className="flex-1 overflow-y-auto p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-2xl font-bold text-[var(--accent-color)]"
          >
            ISO 21001 Management
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-[var(--accent-color)]/70 mt-1"
          >
            {userRole === "super-admin"
              ? "Monitor and approve ISO compliance for all schools"
              : `Track and manage ISO compliance for ${schoolName || "your school"}`}
          </motion.p>
        </div>

        {userRole === "super-admin" ? (
          <SuperAdminISOView />
        ) : (
          <SchoolAdminISOView userRole={userRole as "school" | "eca"} />
        )}
      </div>
    </main>
  )
}
