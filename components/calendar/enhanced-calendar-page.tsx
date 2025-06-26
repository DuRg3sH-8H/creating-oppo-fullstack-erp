"use client"

import { useState, useEffect } from "react"
import { EnhancedCalendarHeader } from "@/components/calendar/enhanced-calendar-header"
import { CalendarGridView } from "@/components/calendar/calendar-grid-view"
import { EventsListView } from "@/components/calendar/events-list-view"
import { EnhancedEventModal } from "@/components/calendar/enhanced-event-modal"
import { useRole } from "@/components/role-context"
import { useToast } from "@/hooks/use-toast"
import { EventRegistrationsModal } from "@/components/calendar/event-registrations-modal"

type ViewMode = "calendar" | "list"

export function EnhancedCalendarPage() {
  const { userRole: userRole } = useRole()
  const [events, setEvents] = useState<any[]>([])
  const [selectedEvent, setSelectedEvent] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [viewMode, setViewMode] = useState<ViewMode>("calendar")
  const [selectedFilters, setSelectedFilters] = useState<string[]>([
    "Training",
    "Competition",
    "Meeting",
    "Holiday",
    "Exam",
  ])
  const [isEventModalOpen, setIsEventModalOpen] = useState(false)
  const { toast } = useToast()

  const [registrationsEvent, setRegistrationsEvent] = useState<any>(null)
  const [isRegistrationsModalOpen, setIsRegistrationsModalOpen] = useState(false)

  useEffect(() => {
    loadEvents()
  }, [refreshTrigger])

  const loadEvents = async () => {
    try {
      const response = await fetch("/api/events")
      if (response.ok) {
        const data = await response.json()
        setEvents(data)
      } else {
        toast({
          title: "Error",
          description: "Failed to load events",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error loading events:", error)
      toast({
        title: "Error",
        description: "Failed to load events",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleEventCreated = () => {
    setRefreshTrigger((prev) => prev + 1)
    toast({
      title: "Event Created",
      description: "The event has been created successfully.",
    })
  }

  const handleEventClick = (event: any) => {
    setSelectedEvent(event)
    setIsEventModalOpen(true)
  }

  const handleRefresh = () => {
    setRefreshTrigger((prev) => prev + 1)
  }

  const handleViewRegistrations = (event: any) => {
    setRegistrationsEvent(event)
    setIsRegistrationsModalOpen(true)
  }

  // Filter events based on selected filters
  const filteredEvents = events.filter((event) => selectedFilters.length === 0 || selectedFilters.includes(event.type))

  if (isLoading) {
    return (
      <main className="flex-1 overflow-y-auto p-4 md:p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#017489] mx-auto"></div>
            <p className="text-gray-500 mt-4">Loading calendar...</p>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-gradient-to-br from-gray-50 to-white min-h-screen">
      <div className="max-w-7xl mx-auto">
        <EnhancedCalendarHeader
          userRole={userRole}
          onEventCreated={handleEventCreated}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          selectedFilters={selectedFilters}
          onFiltersChange={setSelectedFilters}
        />

        {viewMode === "calendar" ? (
          <CalendarGridView
            userRole={userRole}
            events={events}
            onEventClick={handleEventClick}
            filteredEvents={filteredEvents}
            onViewRegistrations={handleViewRegistrations}
            onRefresh={handleRefresh}
          />
        ) : (
          <EventsListView
            userRole={userRole}
            events={events}
            onEventClick={handleEventClick}
            filteredEvents={filteredEvents}
            onRefresh={handleRefresh}
          />
        )}

        {/* Event Detail Modal */}
        <EnhancedEventModal
          isOpen={isEventModalOpen}
          onClose={() => setIsEventModalOpen(false)}
          event={selectedEvent}
          userRole={userRole}
        />
        <EventRegistrationsModal
          isOpen={isRegistrationsModalOpen}
          onClose={() => setIsRegistrationsModalOpen(false)}
          event={registrationsEvent}
        />
      </div>
    </main>
  )
}
