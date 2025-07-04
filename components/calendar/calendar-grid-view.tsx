"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronLeft, ChevronRight, Calendar, Clock, Trash2, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

type UserRole = "super-admin" | "school" | "eca"

interface CalendarGridViewProps {
  userRole: UserRole
  events: any[]
  onEventClick: (event: any) => void
  filteredEvents: any[]
  onViewRegistrations?: (event: any) => void
  onRefresh?: () => void
}

// Event types and their colors
const eventColors = {
  Training: {
    bg: "from-[#017489] to-[#006955]",
    text: "text-white",
    badge: "bg-[#017489]/10 text-[#017489] border-[#017489]/20",
  },
  Competition: {
    bg: "from-[#02609E] to-[#013A87]",
    text: "text-white",
    badge: "bg-[#02609E]/10 text-[#02609E] border-[#02609E]/20",
  },
  Meeting: {
    bg: "from-[#006955] to-[#017489]",
    text: "text-white",
    badge: "bg-[#006955]/10 text-[#006955] border-[#006955]/20",
  },
  Holiday: {
    bg: "from-[#013A87] to-[#02609E]",
    text: "text-white",
    badge: "bg-[#013A87]/10 text-[#013A87] border-[#013A87]/20",
  },
  Exam: {
    bg: "from-purple-600 to-purple-800",
    text: "text-white",
    badge: "bg-purple-100 text-purple-700 border-purple-200",
  },
}

type EventType = keyof typeof eventColors

export function CalendarGridView({
  userRole,
  events,
  onEventClick,
  filteredEvents,
  onViewRegistrations,
  onRefresh,
}: CalendarGridViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [animationDirection, setAnimationDirection] = useState<"left" | "right">("right")

  // Get current month and year
  const currentMonth = currentDate.getMonth()
  const currentYear = currentDate.getFullYear()

  // Get first day of the month and total days
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay()
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()

  // Get previous month's days to fill in the first week
  const daysInPreviousMonth = new Date(currentYear, currentMonth, 0).getDate()

  // Generate calendar days array
  const generateCalendarDays = () => {
    const days = []

    // Previous month's days
    for (let i = firstDayOfMonth - 1; i >= 0; i--) {
      days.push({
        day: daysInPreviousMonth - i,
        currentMonth: false,
        date: new Date(currentYear, currentMonth - 1, daysInPreviousMonth - i),
      })
    }

    // Current month's days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        day: i,
        currentMonth: true,
        date: new Date(currentYear, currentMonth, i),
        today:
          new Date().getDate() === i &&
          new Date().getMonth() === currentMonth &&
          new Date().getFullYear() === currentYear,
      })
    }

    // Next month's days to fill the last week
    const remainingDays = 42 - days.length // 6 rows * 7 days = 42
    for (let i = 1; i <= remainingDays; i++) {
      days.push({
        day: i,
        currentMonth: false,
        date: new Date(currentYear, currentMonth + 1, i),
      })
    }

    return days
  }

  const calendarDays = generateCalendarDays()

  // Get events for a specific day
  const getEventsForDay = (date: Date) => {
    return filteredEvents.filter((event) => {
      const eventDate = new Date(event.date)
      return (
        eventDate.getDate() === date.getDate() &&
        eventDate.getMonth() === date.getMonth() &&
        eventDate.getFullYear() === date.getFullYear()
      )
    })
  }

  // Handle month navigation
  const goToPreviousMonth = () => {
    setAnimationDirection("left")
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1))
  }

  const goToNextMonth = () => {
    setAnimationDirection("right")
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1))
  }

  // Month names
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ]

  const handleDeleteEvent = async (eventId: string) => {
    try {
      const response = await fetch(`/api/events/${eventId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        onRefresh?.()
      }
    } catch (error) {
      console.error("Error deleting event:", error)
    }
  }

  return (
    <div className="space-y-6">
      {/* Calendar Navigation */}
      <Card className="border-0 shadow-lg bg-gradient-to-r from-white to-gray-50">
        <CardContent className="p-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={goToPreviousMonth}
                className="text-[#02609E] hover:text-[#013A87] hover:bg-[#017489]/10 rounded-full"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>

              <AnimatePresence mode="wait">
                <motion.h2
                  key={`${currentMonth}-${currentYear}`}
                  initial={{ opacity: 0, x: animationDirection === "right" ? 20 : -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: animationDirection === "right" ? -20 : 20 }}
                  transition={{ duration: 0.3 }}
                  className="text-2xl font-bold text-[#02609E]"
                >
                  {monthNames[currentMonth]} {currentYear}
                </motion.h2>
              </AnimatePresence>

              <Button
                variant="ghost"
                size="icon"
                onClick={goToNextMonth}
                className="text-[#02609E] hover:text-[#013A87] hover:bg-[#017489]/10 rounded-full"
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>

            <Button
              variant="outline"
              onClick={() => setCurrentDate(new Date())}
              className="text-[#02609E] border-[#017489]/20 hover:bg-[#017489]/10"
            >
              <Calendar className="h-4 w-4 mr-2" />
              Today
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Calendar Grid */}
      <Card className="border-0 shadow-lg overflow-hidden">
        <CardContent className="p-0">
          <div className="grid grid-cols-7">
            {/* Day headers */}
            {["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].map((day) => (
              <div
                key={day}
                className="bg-gradient-to-r from-[#017489] to-[#02609E] text-white text-center py-4 font-semibold"
              >
                <span className="hidden sm:inline">{day}</span>
                <span className="sm:hidden">{day.slice(0, 3)}</span>
              </div>
            ))}

            {/* Calendar days */}
            <AnimatePresence mode="wait">
              <motion.div
                key={`${currentMonth}-${currentYear}-grid`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="contents"
              >
                {calendarDays.map((day, index) => {
                  const dayEvents = getEventsForDay(day.date)

                  return (
                    <motion.div
                      key={`${day.date.toISOString()}-${index}`}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.2, delay: index * 0.01 }}
                      className={cn(
                        "min-h-32 p-3 border-r border-b border-gray-100 relative bg-white hover:bg-gray-50/50 transition-colors",
                        !day.currentMonth && "bg-gray-50/50",
                        day.today && "bg-gradient-to-br from-[#017489]/5 to-[#02609E]/5 ring-2 ring-[#017489]/20",
                      )}
                    >
                      <div
                        className={cn(
                          "text-sm font-semibold h-7 w-7 flex items-center justify-center rounded-full mb-2 transition-all",
                          day.today
                            ? "bg-gradient-to-r from-[#017489] to-[#02609E] text-white shadow-lg"
                            : day.currentMonth
                              ? "text-[#02609E] hover:bg-[#017489]/10"
                              : "text-gray-400",
                        )}
                      >
                        {day.day}
                      </div>

                      <div className="space-y-1">
                        {dayEvents.slice(0, 2).map((event, idx) => (
                          <motion.div
                            key={event._id ? `${event._id}-${idx}` : `event-${idx}`}
                            whileHover={{ scale: 1.02, y: -1 }}
                            className={cn(
                              "text-xs p-2 rounded-lg cursor-pointer truncate shadow-sm border transition-all duration-200 group",
                              eventColors[event.type as EventType]?.badge,
                              "hover:shadow-md",
                            )}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex-1 min-w-0" onClick={() => onEventClick(event)}>
                                <div className="flex items-center gap-1">
                                  <div
                                    className={cn(
                                      "w-2 h-2 rounded-full bg-gradient-to-r",
                                      eventColors[event.type as EventType]?.bg
                                        .replace("from-", "from-")
                                        .replace("to-", "to-"),
                                    )}
                                  />
                                  <span className="font-medium truncate">{event.title}</span>
                                </div>
                                <div className="flex items-center gap-1 mt-1 text-xs opacity-75">
                                  <Clock className="h-3 w-3" />
                                  <span>{event.startTime}</span>
                                </div>
                              </div>

                              {/* Super Admin Controls */}
                              {userRole === "super-admin" && (
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      onViewRegistrations?.(event)
                                    }}
                                    className="p-1 hover:bg-blue-100 rounded text-blue-600"
                                    title="View Registrations"
                                  >
                                    <Users className="h-3 w-3" />
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      let id = event._id;
                                      // If _id is an object (e.g., ObjectId), try toString
                                      if (id && typeof id !== "string" && typeof id.toString === "function") {
                                        id = id.toString();
                                      }
                                      if (typeof id === "string" && /^[a-fA-F0-9]{24}$/.test(id)) {
                                        if (confirm("Delete this event?")) {
                                          handleDeleteEvent(id);
                                        }
                                      } else {
                                        alert("Invalid event ID. Cannot delete this event.");
                                      }
                                    }}
                                    className="p-1 hover:bg-red-100 rounded text-red-600"
                                    title="Delete Event"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </button>
                                </div>
                              )}
                            </div>
                          </motion.div>
                        ))}

                        {dayEvents.length > 2 && (
                          <motion.div
                            whileHover={{ scale: 1.05 }}
                            className="text-xs text-[#02609E] font-semibold cursor-pointer bg-[#02609E]/5 rounded-lg p-1 text-center border border-[#02609E]/10"
                            onClick={() => {
                              // Show first event from the remaining ones
                              if (dayEvents[2]) {
                                onEventClick(dayEvents[2])
                              }
                            }}
                          >
                            +{dayEvents.length - 2} more
                          </motion.div>
                        )}
                      </div>
                    </motion.div>
                  )
                })}
              </motion.div>
            </AnimatePresence>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
