"use client"

import { useRole } from "@/components/role-context"
import { TrainingsPage } from "@/components/trainings/trainings-page"

export function TrainingsRouter() {
  const { userRole } = useRole()

  return <TrainingsPage userRole={userRole} />
}
