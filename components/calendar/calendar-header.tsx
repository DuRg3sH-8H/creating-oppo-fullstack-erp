"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { ChevronDown, Filter, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { AddEventModal } from "@/components/calendar/add-event-modal"

type UserRole = "super-admin" | "school" | "eca"

interface CalendarHeaderProps {
  userRole: UserRole
}

export function CalendarHeader({ userRole }: CalendarHeaderProps) {
  const [isAddEventModalOpen, setIsAddEventModalOpen] = useState(false)
  const [selectedEventTypes, setSelectedEventTypes] = useState<string[]>([
    "Training",
    "Competition",
    "Meeting",
    "Holiday",
    "Exam",
  ])

  const eventTypes = ["Training", "Competition", "Meeting", "Holiday", "Exam"]

  const toggleEventType = (type: string) => {
    if (selectedEventTypes.includes(type)) {
      setSelectedEventTypes(selectedEventTypes.filter((t) => t !== type))
    } else {
      setSelectedEventTypes([...selectedEventTypes, type])
    }
  }

  return (
    <div className="mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-2xl font-bold text-[#02609E]"
        >
          Calendar
        </motion.h1>

        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="border-[#017489]/20 text-[#02609E]">
                <Filter className="h-4 w-4 mr-2" />
                Filter Events
                <ChevronDown className="h-4 w-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Event Types</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {eventTypes.map((type) => (
                <DropdownMenuCheckboxItem
                  key={type}
                  checked={selectedEventTypes.includes(type)}
                  onCheckedChange={() => toggleEventType(type)}
                >
                  {type}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {userRole === "super-admin" && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <Button
                onClick={() => setIsAddEventModalOpen(true)}
                className="bg-[#017489] hover:bg-[#006955] text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Event
              </Button>
            </motion.div>
          )}
        </div>
      </div>

      <AddEventModal isOpen={isAddEventModalOpen} onClose={() => setIsAddEventModalOpen(false)} onEventCreated={function (): void {
        throw new Error("Function not implemented.")
      } } />
    </div>
  )
}
