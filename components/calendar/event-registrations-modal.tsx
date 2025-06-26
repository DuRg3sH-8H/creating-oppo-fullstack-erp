"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useToast } from "@/hooks/use-toast"
import { Users, School, CheckCircle, XCircle, Clock, Calendar } from "lucide-react"
import { motion } from "framer-motion"

interface EventRegistrationsModalProps {
  isOpen: boolean
  onClose: () => void
  event: any
}

export function EventRegistrationsModal({ isOpen, onClose, event }: EventRegistrationsModalProps) {
  const [registrations, setRegistrations] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (isOpen && event) {
      loadRegistrations()
    }
  }, [isOpen, event])

  const loadRegistrations = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/events/${event.id}/registrations`)
      if (response.ok) {
        const data = await response.json()
        setRegistrations(data)
      } else {
        toast({
          title: "Error",
          description: "Failed to load registrations",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error loading registrations:", error)
      toast({
        title: "Error",
        description: "Failed to load registrations",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const updateRegistrationStatus = async (registrationId: string, status: string) => {
    try {
      const response = await fetch(`/api/events/${event.id}/registrations/${registrationId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      })

      if (response.ok) {
        toast({
          title: "Status Updated",
          description: `Registration ${status.toLowerCase()} successfully`,
        })
        loadRegistrations() // Reload registrations
      } else {
        toast({
          title: "Update Failed",
          description: "Failed to update registration status",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "An error occurred while updating status",
        variant: "destructive",
      })
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Approved</Badge>
      case "rejected":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Rejected</Badge>
      default:
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Pending</Badge>
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "rejected":
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <Clock className="h-4 w-4 text-yellow-500" />
    }
  }

  if (!event) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto bg-white">
        <DialogHeader>
          <DialogTitle className="text-[#02609E] text-xl font-bold flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-[#017489] to-[#02609E] rounded-xl">
              <Users className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Event Registrations</h2>
              <p className="text-sm text-gray-600 font-normal">{event.title}</p>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Event Summary */}
          <div className="p-4 bg-gradient-to-r from-[#017489]/5 to-[#02609E]/5 rounded-lg border border-[#017489]/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-[#017489]" />
                <div>
                  <p className="font-semibold text-[#02609E]">{event.title}</p>
                  <p className="text-sm text-gray-600">
                    {new Date(event.date).toLocaleDateString()} • {event.startTime} - {event.endTime}
                  </p>
                </div>
              </div>
              <Badge variant="secondary" className="text-[#02609E]">
                {registrations.length} Registration{registrations.length !== 1 ? "s" : ""}
              </Badge>
            </div>
          </div>

          {/* Registration Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg text-center border border-blue-100">
              <div className="text-2xl font-bold text-blue-600">{registrations.length}</div>
              <div className="text-sm text-blue-600">Total</div>
            </div>
            <div className="p-4 bg-green-50 rounded-lg text-center border border-green-100">
              <div className="text-2xl font-bold text-green-600">
                {registrations.filter((r) => r.status === "approved").length}
              </div>
              <div className="text-sm text-green-600">Approved</div>
            </div>
            <div className="p-4 bg-yellow-50 rounded-lg text-center border border-yellow-100">
              <div className="text-2xl font-bold text-yellow-600">
                {registrations.filter((r) => r.status === "pending").length}
              </div>
              <div className="text-sm text-yellow-600">Pending</div>
            </div>
            <div className="p-4 bg-red-50 rounded-lg text-center border border-red-100">
              <div className="text-2xl font-bold text-red-600">
                {registrations.filter((r) => r.status === "rejected").length}
              </div>
              <div className="text-sm text-red-600">Rejected</div>
            </div>
          </div>

          {/* Registrations List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-[#02609E] flex items-center gap-2">
                <School className="h-5 w-5" />
                School Registrations
              </h3>
              <Button
                onClick={loadRegistrations}
                variant="outline"
                size="sm"
                className="border-[#017489]/20 text-[#02609E] hover:bg-[#017489]/5"
              >
                Refresh
              </Button>
            </div>

            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#017489] mx-auto"></div>
                <p className="text-gray-500 mt-2">Loading registrations...</p>
              </div>
            ) : registrations.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-lg">
                <Users className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Registrations Yet</h3>
                <p className="text-gray-500">
                  No schools have registered for this event yet. Registrations will appear here once schools sign up.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {registrations.map((registration, index) => (
                  <motion.div
                    key={registration.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-all duration-200 bg-white"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src="/placeholder.svg" />
                          <AvatarFallback className="bg-gradient-to-br from-[#017489] to-[#02609E] text-white font-semibold">
                            {registration.schoolName?.charAt(0) || "S"}
                          </AvatarFallback>
                        </Avatar>

                        <div>
                          <h4 className="font-semibold text-gray-900 text-lg">
                            {registration.schoolName || "Unknown School"}
                          </h4>
                          <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              Registered on {new Date(registration.registeredAt).toLocaleDateString()}
                            </span>
                            <span className="flex items-center gap-1">
                              {getStatusIcon(registration.status)}
                              Status: {registration.status}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        {getStatusBadge(registration.status)}

                        {registration.status === "pending" && (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => updateRegistrationStatus(registration.id, "approved")}
                              className="bg-green-600 hover:bg-green-700 text-white"
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateRegistrationStatus(registration.id, "rejected")}
                              className="border-red-200 text-red-600 hover:bg-red-50"
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Reject
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>

                    {registration.notes && (
                      <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                        <p className="text-sm text-gray-700">
                          <span className="font-semibold">Notes:</span> {registration.notes}
                        </p>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
