"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useRole } from "@/components/role-context"
import { SchoolsPage } from "@/components/schools/schools-page"
import { useTheme } from "@/components/theme-context"

export function SchoolsRouter() {
  const { userRole } = useRole()
  const router = useRouter()
  const { resetTheme } = useTheme()

  // Reset to default theme for Super Admin
  useEffect(() => {
    if (userRole === "super-admin") {
      resetTheme()
    }
  }, [userRole, resetTheme])

  // Only super-admin can access schools management
  useEffect(() => {
    if (userRole !== "super-admin") {
      router.push("/dashboard")
    }
  }, [userRole, router])

  if (userRole !== "super-admin") {
    return null
  }

  return <SchoolsPage />
}
