"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { ChevronDown, Filter, Plus, Calendar, Grid, List } from "lucide-react"
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
import { cn } from "@/lib/utils"

type UserRole = "super-admin" | "school" | "eca"
type ViewMode = "calendar" | "list"

interface CalendarHeaderProps {
  userRole: UserRole
  onEventCreated: () => void
  viewMode: ViewMode
  onViewModeChange: (mode: ViewMode) => void
  selectedFilters: string[]
  onFiltersChange: (filters: string[]) => void
}

export function EnhancedCalendarHeader({
  userRole,
  onEventCreated,
  viewMode,
  onViewModeChange,
  selectedFilters,
  onFiltersChange,
}: CalendarHeaderProps) {
  const [isAddEventModalOpen, setIsAddEventModalOpen] = useState(false)

  const eventTypes = ["Training", "Competition", "Meeting", "Holiday", "Exam"]

  const toggleEventType = (type: string) => {
    if (selectedFilters.includes(type)) {
      onFiltersChange(selectedFilters.filter((t) => t !== type))
    } else {
      onFiltersChange([...selectedFilters, type])
    }
  }

  const handleEventCreated = () => {
    setIsAddEventModalOpen(false)
    onEventCreated()
  }

  return (
    <div className="mb-8">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-4"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-[#017489] to-[#02609E] rounded-xl">
              <Calendar className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-[#02609E]">Event Calendar</h1>
              <p className="text-gray-600 text-sm">Manage and track school events</p>
            </div>
          </div>
        </motion.div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* View Mode Toggle */}
          <div className="flex items-center bg-gray-100 rounded-lg p-1">
            <Button
              variant={viewMode === "calendar" ? "default" : "ghost"}
              size="sm"
              onClick={() => onViewModeChange("calendar")}
              className={cn(
                "h-8 px-3",
                viewMode === "calendar" ? "bg-white shadow-sm text-[#02609E]" : "text-gray-600 hover:text-[#02609E]",
              )}
            >
              <Grid className="h-4 w-4 mr-2" />
              Calendar
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="sm"
              onClick={() => onViewModeChange("list")}
              className={cn(
                "h-8 px-3",
                viewMode === "list" ? "bg-white shadow-sm text-[#02609E]" : "text-gray-600 hover:text-[#02609E]",
              )}
            >
              <List className="h-4 w-4 mr-2" />
              List
            </Button>
          </div>

          {/* Filter Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="border-[#017489]/20 text-[#02609E] hover:bg-[#017489]/5">
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
                  checked={selectedFilters.includes(type)}
                  onCheckedChange={() => toggleEventType(type)}
                >
                  {type}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Create Event Button (Super Admin Only) */}
          {userRole === "super-admin" && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <Button
                onClick={() => setIsAddEventModalOpen(true)}
                className="bg-gradient-to-r from-[#017489] to-[#02609E] hover:from-[#006955] hover:to-[#013A87] text-white shadow-lg"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Event
              </Button>
            </motion.div>
          )}
        </div>
      </div>

      <AddEventModal
        isOpen={isAddEventModalOpen}
        onClose={() => setIsAddEventModalOpen(false)}
        onEventCreated={handleEventCreated}
      />
    </div>
  )
}
