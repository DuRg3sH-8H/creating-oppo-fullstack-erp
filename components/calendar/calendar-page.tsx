"use client"
import { CalendarView } from "@/components/calendar/calendar-view"
import { CalendarHeader } from "@/components/calendar/calendar-header"
import { useRole } from "@/components/role-context"

export function CalendarPage() {
  const { userRole: userRole } = useRole()

  return (
    <main className="flex-1 overflow-y-auto p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <CalendarHeader userRole={userRole} />
        <CalendarView userRole={userRole} />
      </div>
    </main>
  )
}
