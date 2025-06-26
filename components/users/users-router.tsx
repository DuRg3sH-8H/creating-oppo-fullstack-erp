"use client"

import { useState, useEffect } from "react"
import { useRole } from "@/components/role-context"
import { UsersPage } from "@/components/users/users-page"
import { motion } from "framer-motion"

export function UsersRouter() {
  const { userRole, loading: roleLoading } = useRole()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Show loading while role is being determined
  if (!mounted || roleLoading) {
    return (
      <main className="flex-1 overflow-y-auto p-4 md:p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--primary-color)] mx-auto mb-4"></div>
              <p className="text-gray-500">Loading...</p>
            </div>
          </div>
        </div>
      </main>
    )
  }

  // Only super-admin can access user management
  if (userRole !== "super-admin") {
    return (
      <main className="flex-1 overflow-y-auto p-4 md:p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center"
            >
              <div className="mb-4">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Access Restricted</h3>
              <p className="text-gray-500 mb-4">
                You don't have permission to access user management. This feature is only available to super
                administrators.
              </p>
              <p className="text-sm text-gray-400">
                Current role: <span className="font-medium">{userRole}</span>
              </p>
            </motion.div>
          </div>
        </div>
      </main>
    )
  }

  // Render the Users page for super-admin
  return <UsersPage />
}
