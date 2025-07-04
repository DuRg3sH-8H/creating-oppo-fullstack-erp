"use client"

import type React from "react"

import { useState } from "react"
import { motion } from "framer-motion"
import { Calendar, Clock, MapPin, Users, Trash2, UserCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { EnhancedEventModal } from "@/components/calendar/enhanced-event-modal"
import { EventRegistrationsModal } from "@/components/calendar/event-registrations-modal"
import { useToast } from "@/hooks/use-toast"

type UserRole = "super-admin" | "school" | "eca"

interface CalendarViewProps {
  userRole: UserRole
  events: any[]
  onEventSelect: (event: any) => void
  refreshTrigger: number
}

export function EnhancedCalendarView({ userRole, events, onEventSelect }: CalendarViewProps) {
  const [selectedEvent, setSelectedEvent] = useState<any>(null)
  const [isEventModalOpen, setIsEventModalOpen] = useState(false)
  const [isRegistrationsModalOpen, setIsRegistrationsModalOpen] = useState(false)
  const [registrationsEvent, setRegistrationsEvent] = useState<any>(null)
  const { toast } = useToast()

  const handleEventClick = (event: any) => {
    setSelectedEvent(event)
    setIsEventModalOpen(true)
    onEventSelect(event)
  }

  const handleViewRegistrations = (event: any, e: React.MouseEvent) => {
    e.stopPropagation()
    setRegistrationsEvent(event)
    setIsRegistrationsModalOpen(true)
  }

  const handleDeleteEvent = async (eventId: string, e: React.MouseEvent) => {
    e.stopPropagation()

    if (!confirm("Are you sure you want to delete this event?")) {
      return
    }
    if (!eventId || typeof eventId !== "string" || eventId.length !== 24) {
      toast({
        title: "Invalid Event ID",
        description: "The event ID is not valid.",
        variant: "destructive",
      })
      return
    }

    try {
      const response = await fetch(`/api/events/${eventId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast({
          title: "Event Deleted",
          description: "The event has been deleted successfully.",
        })
        // Trigger refresh
        window.location.reload()
      } else {
        toast({
          title: "Delete Failed",
          description: "Failed to delete the event",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Delete Failed",
        description: "An error occurred while deleting the event",
        variant: "destructive",
      })
    }
  }

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case "Training":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "Competition":
        return "bg-red-100 text-red-800 border-red-200"
      case "Meeting":
        return "bg-green-100 text-green-800 border-green-200"
      case "Holiday":
        return "bg-purple-100 text-purple-800 border-purple-200"
      case "Exam":
        return "bg-orange-100 text-orange-800 border-orange-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const isEventPast = (dateString: string) => {
    return new Date(dateString) < new Date()
  }

  if (events.length === 0) {
    return (
      <div className="text-center py-16">
        <Calendar className="h-16 w-16 mx-auto text-gray-400 mb-4" />
        <h3 className="text-xl font-semibold text-gray-600 mb-2">No Events Found</h3>
        <p className="text-gray-500">
          {userRole === "super-admin"
            ? "Create your first event to get started!"
            : "No events are currently available."}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events
          .filter((event) => event.id && typeof event.id === "string" && event.id.length === 24)
          .map((event, index) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card
                className={`cursor-pointer hover:shadow-lg transition-all duration-300 border-l-4 ${isEventPast(event.date) ? "border-l-gray-400 opacity-75" : "border-l-[#017489] hover:border-l-[#02609E]"
                  }`}
                onClick={() => handleEventClick(event)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg font-bold text-[#02609E] mb-2 line-clamp-2">{event.title}</CardTitle>
                      <Badge className={`${getEventTypeColor(event.type)} text-xs`}>{event.type}</Badge>
                    </div>

                    {userRole === "super-admin" && (
                      <div className="flex gap-1 ml-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => handleViewRegistrations(event, e)}
                          className="h-8 w-8 p-0 hover:bg-blue-100"
                          title="View Registrations"
                        >
                          <UserCheck className="h-4 w-4 text-blue-600" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => handleDeleteEvent(event.id, e)}
                          className="h-8 w-8 p-0 hover:bg-red-100"
                          title="Delete Event"
                          disabled={!event.id || typeof event.id !== "string" || event.id.length !== 24}
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="h-4 w-4 text-[#017489]" />
                    <span>{formatDate(event.date)}</span>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock className="h-4 w-4 text-[#017489]" />
                    <span>
                      {event.startTime} - {event.endTime}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="h-4 w-4 text-[#017489]" />
                    <span className="line-clamp-1">{event.location}</span>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Users className="h-4 w-4 text-[#017489]" />
                    <span>By {event.organizer}</span>
                  </div>

                  {event.description && <p className="text-sm text-gray-600 line-clamp-2 mt-2">{event.description}</p>}

                  {event.registrationOpen && !isEventPast(event.date) && (
                    <div className="pt-2 border-t">
                      <Badge className="bg-green-100 text-green-800 text-xs">Registration Open</Badge>
                    </div>
                  )}

                  {isEventPast(event.date) && (
                    <div className="pt-2 border-t">
                      <Badge className="bg-gray-100 text-gray-600 text-xs">Event Completed</Badge>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
      </div>

      {/* Event Detail Modal */}
      <EnhancedEventModal
        isOpen={isEventModalOpen}
        onClose={() => setIsEventModalOpen(false)}
        event={selectedEvent}
        userRole={userRole}
      />

      {/* Event Registrations Modal */}
      <EventRegistrationsModal
        isOpen={isRegistrationsModalOpen}
        onClose={() => setIsRegistrationsModalOpen(false)}
        event={registrationsEvent}
      />
    </div>
  )
}
