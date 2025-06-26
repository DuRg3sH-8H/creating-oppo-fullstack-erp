"use client"

import { SuperAdminDashboard } from "@/components/dashboard/super-admin-dashboard"
import { EnhancedSchoolAdminDashboard } from "@/components/dashboard/enhanced-school-admin-dashboard"
import { EnhancedEcaDashboard } from "@/components/dashboard/enhanced-eca-dashboard"
import { useRole } from "@/components/role-context"

export function DashboardSelector() {
  const { userRole, userName } = useRole()

  return (
    <div className="p-4 md:p-6">
      {userRole === "super-admin" && <SuperAdminDashboard userName={userName} />}
      {userRole === "school" && <EnhancedSchoolAdminDashboard userName={userName} />}
      {userRole === "eca" && <EnhancedEcaDashboard userName={userName} />}
    </div>
  )
}
