"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"
import { Calendar, Clock, MapPin, User } from "lucide-react"

interface AddEventModalProps {
  isOpen: boolean
  onClose: () => void
  onEventCreated: () => void
}

export function AddEventModal({ isOpen, onClose, onEventCreated }: AddEventModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    type: "",
    date: "",
    startTime: "",
    endTime: "",
    location: "",
    description: "",
    organizer: "",
    registrationOpen: true,
    maxParticipants: "",
  })
  const { toast } = useToast()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleCheckboxChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, registrationOpen: checked }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          maxParticipants: formData.maxParticipants ? Number.parseInt(formData.maxParticipants) : null,
        }),
      })

      if (response.ok) {
        toast({
          title: "Event Created",
          description: "The event has been created successfully.",
        })
        onEventCreated()
        resetForm()
      } else {
        const error = await response.json()
        toast({
          title: "Creation Failed",
          description: error.error || "Failed to create event",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Creation Failed",
        description: "An error occurred while creating the event",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    setFormData({
      title: "",
      type: "",
      date: "",
      startTime: "",
      endTime: "",
      location: "",
      description: "",
      organizer: "",
      registrationOpen: true,
      maxParticipants: "",
    })
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-[#02609E] text-xl font-bold flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Create New Event
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-[#02609E] font-semibold">
                Event Title *
              </Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Enter event title"
                className="border-[#017489]/20 focus:border-[#017489] focus:ring-[#017489]/20"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type" className="text-[#02609E] font-semibold">
                  Event Type *
                </Label>
                <Select value={formData.type} onValueChange={(value) => handleSelectChange("type", value)} required>
                  <SelectTrigger className="border-[#017489]/20 focus:border-[#017489] focus:ring-[#017489]/20">
                    <SelectValue placeholder="Select event type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Training">Training</SelectItem>
                    <SelectItem value="Competition">Competition</SelectItem>
                    <SelectItem value="Meeting">Meeting</SelectItem>
                    <SelectItem value="Holiday">Holiday</SelectItem>
                    <SelectItem value="Exam">Exam</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="organizer" className="text-[#02609E] font-semibold">
                  <User className="h-4 w-4 inline mr-1" />
                  Organizer *
                </Label>
                <Input
                  id="organizer"
                  name="organizer"
                  value={formData.organizer}
                  onChange={handleChange}
                  placeholder="Enter organizer name"
                  className="border-[#017489]/20 focus:border-[#017489] focus:ring-[#017489]/20"
                  required
                />
              </div>
            </div>
          </div>

          {/* Date and Time */}
          <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-[#02609E] flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Date & Time
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date" className="text-[#02609E]">
                  Date *
                </Label>
                <Input
                  id="date"
                  name="date"
                  type="date"
                  value={formData.date}
                  onChange={handleChange}
                  className="border-[#017489]/20 focus:border-[#017489] focus:ring-[#017489]/20"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="startTime" className="text-[#02609E]">
                  Start Time *
                </Label>
                <Input
                  id="startTime"
                  name="startTime"
                  type="time"
                  value={formData.startTime}
                  onChange={handleChange}
                  className="border-[#017489]/20 focus:border-[#017489] focus:ring-[#017489]/20"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="endTime" className="text-[#02609E]">
                  End Time *
                </Label>
                <Input
                  id="endTime"
                  name="endTime"
                  type="time"
                  value={formData.endTime}
                  onChange={handleChange}
                  className="border-[#017489]/20 focus:border-[#017489] focus:ring-[#017489]/20"
                  required
                />
              </div>
            </div>
          </div>

          {/* Location and Details */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="location" className="text-[#02609E] font-semibold">
                <MapPin className="h-4 w-4 inline mr-1" />
                Location *
              </Label>
              <Input
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="Enter event location"
                className="border-[#017489]/20 focus:border-[#017489] focus:ring-[#017489]/20"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-[#02609E] font-semibold">
                Description *
              </Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Enter event description"
                className="border-[#017489]/20 focus:border-[#017489] focus:ring-[#017489]/20 min-h-24"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxParticipants" className="text-[#02609E]">
                Maximum Participants (Optional)
              </Label>
              <Input
                id="maxParticipants"
                name="maxParticipants"
                type="number"
                value={formData.maxParticipants}
                onChange={handleChange}
                placeholder="Enter maximum number of participants"
                className="border-[#017489]/20 focus:border-[#017489] focus:ring-[#017489]/20"
                min="1"
              />
            </div>
          </div>

          {/* Registration Settings */}
          <div className="p-4 bg-gradient-to-r from-[#017489]/5 to-[#02609E]/5 rounded-lg border border-[#017489]/10">
            <div className="flex items-center space-x-3">
              <Checkbox
                id="registrationOpen"
                checked={formData.registrationOpen}
                onCheckedChange={handleCheckboxChange}
                className="data-[state=checked]:bg-[#017489] data-[state=checked]:border-[#017489]"
              />
              <Label htmlFor="registrationOpen" className="text-[#02609E] font-semibold">
                Open for school registration
              </Label>
            </div>
            <p className="text-sm text-gray-600 mt-2 ml-6">
              Schools will be able to register for this event if enabled
            </p>
          </div>

          <DialogFooter className="pt-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="border-[#017489]/20 text-[#02609E] hover:bg-[#017489]/5"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-gradient-to-r from-[#017489] to-[#02609E] hover:from-[#006955] hover:to-[#013A87] text-white"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating...
                </>
              ) : (
                "Create Event"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
