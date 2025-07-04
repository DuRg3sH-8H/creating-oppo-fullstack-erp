"use client"
import { EnhancedCalendarView } from "@/components/calendar/enhanced-calendar-view"
import { CalendarHeader } from "@/components/calendar/calendar-header"
import { useRole } from "@/components/role-context"

export function CalendarPage() {
  const { userRole: userRole } = useRole()

  return (
    <main className="flex-1 overflow-y-auto p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <CalendarHeader userRole={userRole} />
        <EnhancedCalendarView userRole={"super-admin"} events={[]} onEventSelect={function (event: any): void {
          throw new Error("Function not implemented.")
        } } refreshTrigger={0}  />
      </div>
    </main>
  )
}
