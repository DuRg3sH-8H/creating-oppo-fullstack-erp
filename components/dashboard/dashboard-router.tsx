"use client"

import { useRole } from "@/components/role-context"
import { SuperAdminDashboard } from "@/components/dashboard/super-admin-dashboard"
import { EnhancedSchoolAdminDashboard } from "@/components/dashboard/enhanced-school-admin-dashboard"
import { EnhancedEcaDashboard } from "@/components/dashboard/enhanced-eca-dashboard"

export function DashboardRouter() {
  const { userRole, userName } = useRole()

  if (userRole === "super-admin") {
    return <SuperAdminDashboard userName={userName} />
  } else if (userRole === "school") {
    return <EnhancedSchoolAdminDashboard userName={userName} />
  } else {
    return <EnhancedEcaDashboard userName={userName} />
  }
}
