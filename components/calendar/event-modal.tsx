"use client"

import { useState } from "react"
import { Calendar, Clock, MapPin, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

type UserRole = "super-admin" | "school" | "eca"

type EventType = "Training" | "Competition" | "Meeting" | "Holiday" | "Exam"

interface Event {
  type: EventType
  title: string
  date: Date
  time: string
  location: string
  organizer: string
  participants: string[]
  description: string
  registrationOpen: boolean
}

interface EventModalProps {
  isOpen: boolean
  onClose: () => void
  event: Event
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

export function EventModal({ isOpen, onClose, event, userRole }: EventModalProps) {
  const [isRegistering, setIsRegistering] = useState(false)
  const [isRegistered, setIsRegistered] = useState(false)

  if (!event) return null

  const handleRegister = () => {
    setIsRegistering(true)

    // Simulate API call
    setTimeout(() => {
      setIsRegistering(false)
      setIsRegistered(true)
    }, 1000)
  }

  const canRegister = (userRole === "school" || userRole === "eca") && event.registrationOpen && !isRegistered

  const color = eventColors[event.type] || { bg: "#CCCCCC", text: "black" }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-[#02609E] flex items-center justify-between">
            <span>{event.title}</span>
            <span
              className="text-xs py-1 px-2 rounded-full"
              style={{
                backgroundColor: `${color.bg}20`,
                color: color.bg,
              }}
            >
              {event.type}
            </span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <Calendar className="h-5 w-5 text-[#017489] mt-0.5" />
            <div>
              <p className="text-sm font-medium text-[#02609E]">Date & Time</p>
              <p className="text-sm text-gray-600">
                {event.date.toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
              <p className="text-sm text-gray-600">{event.time}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <MapPin className="h-5 w-5 text-[#017489] mt-0.5" />
            <div>
              <p className="text-sm font-medium text-[#02609E]">Location</p>
              <p className="text-sm text-gray-600">{event.location}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Clock className="h-5 w-5 text-[#017489] mt-0.5" />
            <div>
              <p className="text-sm font-medium text-[#02609E]">Organizer</p>
              <p className="text-sm text-gray-600">{event.organizer}</p>
            </div>
          </div>

          {event.participants.length > 0 && (
            <div className="flex items-start gap-3">
              <Users className="h-5 w-5 text-[#017489] mt-0.5" />
              <div>
                <p className="text-sm font-medium text-[#02609E]">Participants</p>
                <p className="text-sm text-gray-600">{event.participants.join(", ")}</p>
              </div>
            </div>
          )}

          <div className="pt-2">
            <p className="text-sm font-medium text-[#02609E] mb-1">Description</p>
            <p className="text-sm text-gray-600">{event.description}</p>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            {canRegister && (
              <Button
                onClick={handleRegister}
                disabled={isRegistering || isRegistered}
                className="bg-[#017489] hover:bg-[#006955] text-white"
              >
                {isRegistering ? "Registering..." : isRegistered ? "Registered" : "Register"}
              </Button>
            )}

            {userRole === "super-admin" && (
              <>
                <Button variant="outline" className="border-[#017489]/20 text-[#02609E]">
                  Edit
                </Button>
                <Button variant="destructive">Delete</Button>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
