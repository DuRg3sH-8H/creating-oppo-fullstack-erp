"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { EventModal } from "@/components/calendar/event-modal"
import { cn } from "@/lib/utils"

type UserRole = "super-admin" | "school" | "eca"

interface CalendarViewProps {
  userRole: UserRole
}

// Event types and their colors
const eventColors = {
  Training: { bg: "#017489", text: "white" },
  Competition: { bg: "#02609E", text: "white" },
  Meeting: { bg: "#006955", text: "white" },
  Holiday: { bg: "#013A87", text: "white" },
  Exam: { bg: "#9C27B0", text: "white" },
}

type EventType = keyof typeof eventColors

// Sample events data
const generateEvents = () => {
  const today = new Date()
  const currentMonth = today.getMonth()
  const currentYear = today.getFullYear()

  const events = [
    {
      id: 1,
      title: "Science Competition",
      type: "Competition" as EventType,
      date: new Date(currentYear, currentMonth, 5),
      time: "9:00 AM - 12:00 PM",
      location: "Main Auditorium",
      description: "Annual inter-school science competition",
      organizer: "Science Department",
      participants: ["School A", "School B", "School C"],
      registrationOpen: true,
    },
    {
      id: 2,
      title: "Teacher Training",
      type: "Training" as EventType,
      date: new Date(currentYear, currentMonth, 10),
      time: "2:00 PM - 4:00 PM",
      location: "Conference Room 2",
      description: "Professional development training for teachers",
      organizer: "HR Department",
      participants: [],
      registrationOpen: true,
    },
    {
      id: 3,
      title: "Board Meeting",
      type: "Meeting" as EventType,
      date: new Date(currentYear, currentMonth, 15),
      time: "10:00 AM - 12:00 PM",
      location: "Board Room",
      description: "Monthly board meeting to discuss school policies",
      organizer: "Principal's Office",
      participants: ["Board Members"],
      registrationOpen: false,
    },
    {
      id: 4,
      title: "Mid-term Break",
      type: "Holiday" as EventType,
      date: new Date(currentYear, currentMonth, 20),
      time: "All Day",
      location: "School-wide",
      description: "Mid-term break for all students and staff",
      organizer: "School Administration",
      participants: ["All Students", "All Staff"],
      registrationOpen: false,
    },
    {
      id: 5,
      title: "Mathematics Exam",
      type: "Exam" as EventType,
      date: new Date(currentYear, currentMonth, 25),
      time: "9:00 AM - 11:00 AM",
      location: "Examination Hall",
      description: "End of term mathematics examination",
      organizer: "Examination Department",
      participants: ["Grade 10", "Grade 11", "Grade 12"],
      registrationOpen: false,
    },
    {
      id: 6,
      title: "Sports Day",
      type: "Competition" as EventType,
      date: new Date(currentYear, currentMonth, 28),
      time: "8:00 AM - 4:00 PM",
      location: "Sports Ground",
      description: "Annual sports day competition",
      organizer: "Physical Education Department",
      participants: ["All Students"],
      registrationOpen: true,
    },
  ]

  // Add some events for next month
  events.push(
    {
      id: 7,
      title: "Leadership Training",
      type: "Training" as EventType,
      date: new Date(currentYear, currentMonth + 1, 3),
      time: "9:00 AM - 3:00 PM",
      location: "Conference Room 1",
      description: "Leadership training for school prefects",
      organizer: "Student Affairs",
      participants: ["School Prefects"],
      registrationOpen: true,
    },
    {
      id: 8,
      title: "Parent-Teacher Meeting",
      type: "Meeting" as EventType,
      date: new Date(currentYear, currentMonth + 1, 8),
      time: "4:00 PM - 7:00 PM",
      location: "School Hall",
      description: "Term end parent-teacher meeting",
      organizer: "Academic Department",
      participants: ["Teachers", "Parents"],
      registrationOpen: false,
    },
  )

  // Add some events for previous month
  events.push(
    {
      id: 9,
      title: "Staff Development",
      type: "Training" as EventType,
      date: new Date(currentYear, currentMonth - 1, 25),
      time: "9:00 AM - 1:00 PM",
      location: "Conference Room 3",
      description: "Professional development for staff",
      organizer: "HR Department",
      participants: ["All Staff"],
      registrationOpen: false,
    },
    {
      id: 10,
      title: "Cultural Day",
      type: "Competition" as EventType,
      date: new Date(currentYear, currentMonth - 1, 28),
      time: "10:00 AM - 3:00 PM",
      location: "School Grounds",
      description: "Annual cultural day celebration",
      organizer: "Cultural Committee",
      participants: ["All Students", "All Staff"],
      registrationOpen: true,
    },
  )

  return events
}

const events = generateEvents()

export function CalendarView({ userRole }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedEvent, setSelectedEvent] = useState<any | null>(null)
  const [isEventModalOpen, setIsEventModalOpen] = useState(false)
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
    return events.filter(
      (event) =>
        event.date.getDate() === date.getDate() &&
        event.date.getMonth() === date.getMonth() &&
        event.date.getFullYear() === date.getFullYear(),
    )
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

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={goToPreviousMonth}
            className="text-[#02609E] hover:text-[#013A87] hover:bg-[#017489]/10"
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
              className="text-xl font-semibold text-[#02609E] px-2"
            >
              {monthNames[currentMonth]} {currentYear}
            </motion.h2>
          </AnimatePresence>

          <Button
            variant="ghost"
            size="icon"
            onClick={goToNextMonth}
            className="text-[#02609E] hover:text-[#013A87] hover:bg-[#017489]/10"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>

        <Button
          variant="outline"
          onClick={() => {
            setCurrentDate(new Date())
          }}
          className="text-[#02609E] border-[#017489]/20 hover:bg-[#017489]/10"
        >
          Today
        </Button>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {/* Day headers */}
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div key={day} className="text-center py-2 font-medium text-[#02609E]">
            {day}
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
                    "min-h-24 p-1 border border-gray-100 relative",
                    day.currentMonth ? "bg-white" : "bg-gray-50",
                    day.today && "ring-2 ring-[#017489]/30",
                  )}
                >
                  <div
                    className={cn(
                      "text-sm font-medium h-6 w-6 flex items-center justify-center rounded-full mb-1",
                      day.today ? "bg-[#017489] text-white" : day.currentMonth ? "text-[#02609E]" : "text-gray-400",
                    )}
                  >
                    {day.day}
                  </div>

                  <div className="space-y-1">
                    {dayEvents.slice(0, 3).map((event) => (
                      <motion.div
                        key={event.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          setSelectedEvent(event)
                          setIsEventModalOpen(true)
                        }}
                        className="text-xs p-1 rounded cursor-pointer truncate"
                        style={{
                          backgroundColor: `${eventColors[event.type].bg}20`,
                          color: eventColors[event.type].bg,
                        }}
                      >
                        {event.title}
                      </motion.div>
                    ))}

                    {dayEvents.length > 3 && (
                      <div
                        className="text-xs text-[#02609E] font-medium cursor-pointer"
                        onClick={() => {
                          // Could show a modal with all events for this day
                        }}
                      >
                        +{dayEvents.length - 3} more
                      </div>
                    )}
                  </div>
                </motion.div>
              )
            })}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Event Modal */}
      <EventModal
        isOpen={isEventModalOpen}
        onClose={() => setIsEventModalOpen(false)}
        event={selectedEvent}
        userRole={userRole}
      />
    </div>
  )
}
