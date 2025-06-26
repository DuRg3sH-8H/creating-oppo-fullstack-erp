"use client"

import { useRole } from "@/components/role-context"
import { StudentManagementPage } from "@/components/students/student-management-page"
import { Unauthorized } from "@/components/auth/unauthorized"

export function StudentsRouter() {
  const { userRole } = useRole()

  // Only school admins can access student management
  if (userRole !== "school") {
    return <Unauthorized />
  }

  return <StudentManagementPage />
}
