"use client"

import type React from "react"

import { useState } from "react"
import { motion } from "framer-motion"
import { Calendar, Clock, MapPin, Users, Trash2, UserCheck, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { EventRegistrationsModal } from "@/components/calendar/event-registrations-modal"

type UserRole = "super-admin" | "school" | "eca"

interface EventsListViewProps {
  userRole: UserRole
  events: any[]
  onEventClick: (event: any) => void
  filteredEvents: any[]
  onRefresh: () => void
}

export function EventsListView({ userRole, events, onEventClick, filteredEvents, onRefresh }: EventsListViewProps) {
  const [registrationsEvent, setRegistrationsEvent] = useState<any>(null)
  const [isRegistrationsModalOpen, setIsRegistrationsModalOpen] = useState(false)
  const { toast } = useToast()

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

    try {
      const response = await fetch(`/api/events/${eventId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast({
          title: "Event Deleted",
          description: "The event has been deleted successfully.",
        })
        onRefresh()
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

  const sortedEvents = [...filteredEvents].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  if (sortedEvents.length === 0) {
    return (
      <div className="text-center py-16">
        <Calendar className="h-16 w-16 mx-auto text-gray-400 mb-4" />
        <h3 className="text-xl font-semibold text-gray-600 mb-2">No Events Found</h3>
        <p className="text-gray-500">
          {userRole === "super-admin"
            ? "Create your first event to get started!"
            : "No events match your current filters."}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {sortedEvents.map((event, index) => (
        <motion.div
          key={event._id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.05 }}
        >
          <Card
            className={`cursor-pointer hover:shadow-lg transition-all duration-300 border-l-4 ${
              isEventPast(event.date) ? "border-l-gray-400 opacity-75" : "border-l-[#017489] hover:border-l-[#02609E]"
            }`}
            onClick={() => onEventClick(event)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <CardTitle className="text-xl font-bold text-[#02609E]">{event.title}</CardTitle>
                    <Badge className={`${getEventTypeColor(event.type)} text-sm`}>{event.type}</Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-[#017489]" />
                      <span>{formatDate(event.date)}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-[#017489]" />
                      <span>
                        {event.startTime} - {event.endTime}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-[#017489]" />
                      <span className="truncate">{event.location}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-[#017489]" />
                      <span>By {event.organizer}</span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons for Super Admin */}
                {userRole === "super-admin" && (
                  <div className="flex gap-2 ml-4">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => handleViewRegistrations(event, e)}
                      className="h-9 w-9 p-0 hover:bg-blue-100"
                      title="View Registrations"
                    >
                      <UserCheck className="h-4 w-4 text-blue-600" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => onEventClick(event)}
                      className="h-9 w-9 p-0 hover:bg-green-100"
                      title="View Details"
                    >
                      <Eye className="h-4 w-4 text-green-600" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => handleDeleteEvent(event._id, e)}
                      className="h-9 w-9 p-0 hover:bg-red-100"
                      title="Delete Event"
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>

            <CardContent className="pt-0">
              {event.description && <p className="text-gray-600 text-sm mb-4 line-clamp-2">{event.description}</p>}

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {event.registrationOpen && !isEventPast(event.date) && (
                    <Badge className="bg-green-100 text-green-800">Registration Open</Badge>
                  )}

                  {isEventPast(event.date) && <Badge className="bg-gray-100 text-gray-600">Event Completed</Badge>}

                  {!event.registrationOpen && !isEventPast(event.date) && (
                    <Badge className="bg-yellow-100 text-yellow-800">Registration Closed</Badge>
                  )}
                </div>

                {event.maxParticipants && (
                  <div className="text-sm text-gray-500">Max: {event.maxParticipants} participants</div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}

      {/* Event Registrations Modal */}
      <EventRegistrationsModal
        isOpen={isRegistrationsModalOpen}
        onClose={() => setIsRegistrationsModalOpen(false)}
        event={registrationsEvent}
      />
    </div>
  )
}
