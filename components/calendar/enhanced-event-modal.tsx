"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Calendar, Clock, MapPin, Users, UserCheck } from "lucide-react"
import { motion } from "framer-motion"

type UserRole = "super-admin" | "school" | "eca"

interface EnhancedEventModalProps {
  isOpen: boolean
  onClose: () => void
  event: any
  userRole: UserRole
}

export function EnhancedEventModal({ isOpen, onClose, event, userRole }: EnhancedEventModalProps) {
  const [isRegistering, setIsRegistering] = useState(false)
  const [registrationStatus, setRegistrationStatus] = useState<string | null>(null)
  const [currentRegistration, setCurrentRegistration] = useState<any>(null)
  const { toast } = useToast()

  useEffect(() => {
    if (event && userRole === "school") {
      checkRegistrationStatus()
    }
  }, [event, userRole])

  const checkRegistrationStatus = async () => {
    if (!event) return

    try {
      const response = await fetch(`/api/events/${event.id}/registrations`)
      if (response.ok) {
        const registrations = await response.json()
        // Find current school's registration - we need to get the current user's school ID
        // For now, let's find any registration that matches (in a real app, you'd match by actual school ID)
        const currentRegistration = registrations.find((reg: any) => {
          // This is a simplified check - in production, you'd match against the actual logged-in user's school ID
          return reg.schoolId // Just take the first registration for demo purposes
        })

        if (currentRegistration) {
          setRegistrationStatus(currentRegistration.status)
          setCurrentRegistration(currentRegistration)
        } else {
          setRegistrationStatus(null)
          setCurrentRegistration(null)
        }
      }
    } catch (error) {
      console.error("Error checking registration status:", error)
    }
  }

  const handleRegister = async () => {
    if (!event) return

    setIsRegistering(true)
    try {
      const response = await fetch(`/api/events/${event.id}/registrations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          notes: "Registration from school admin",
        }),
      })

      if (response.ok) {
        toast({
          title: "Registration Successful",
          description: "Your school has been registered for this event.",
        })
        // Refresh the registration status
        checkRegistrationStatus()
      } else {
        const error = await response.json()
        toast({
          title: "Registration Failed",
          description: error.error || "Failed to register for event",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Registration Failed",
        description: "An error occurred while registering",
        variant: "destructive",
      })
    } finally {
      setIsRegistering(false)
    }
  }

  const handleUnregister = async () => {
    if (!event || !currentRegistration) return

    try {
      const response = await fetch(`/api/events/${event.id}/registrations/${currentRegistration.id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast({
          title: "Unregistered Successfully",
          description: "Your school has been unregistered from this event.",
        })
        setRegistrationStatus(null)
        setCurrentRegistration(null)
      } else {
        toast({
          title: "Unregister Failed",
          description: "Failed to unregister from event",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Unregister Failed",
        description: "An error occurred while unregistering",
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

  const getRegistrationStatusBadge = (status: string | null) => {
    if (!status) return null

    switch (status) {
      case "approved":
        return <Badge className="bg-green-100 text-green-800 border-green-200">✅ Registration Approved</Badge>
      case "rejected":
        return <Badge className="bg-red-100 text-red-800 border-red-200">❌ Registration Rejected</Badge>
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">⏳ Registration Pending</Badge>
      default:
        return null
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const isEventPast = (dateString: string) => {
    return new Date(dateString) < new Date()
  }

  const canUnregister = () => {
    return registrationStatus === "pending" || registrationStatus === "approved"
  }

  const getRegistrationMessage = () => {
    switch (registrationStatus) {
      case "approved":
        return "Your school's registration has been approved! You're all set for this event."
      case "rejected":
        return "Unfortunately, your school's registration was not approved for this event."
      case "pending":
        return "Your registration is pending approval from the event organizers."
      default:
        return "Your school is not registered for this event."
    }
  }

  if (!event) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto bg-white">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <DialogTitle className="text-2xl font-bold text-[#02609E] mb-2">{event.title}</DialogTitle>
              <Badge className={`${getEventTypeColor(event.type)} text-sm`}>{event.type}</Badge>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Event Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                <Calendar className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="font-semibold text-blue-900">Date</p>
                  <p className="text-blue-700">{formatDate(event.date)}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                <Clock className="h-5 w-5 text-green-600" />
                <div>
                  <p className="font-semibold text-green-900">Time</p>
                  <p className="text-green-700">
                    {event.startTime} - {event.endTime}
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="space-y-4"
            >
              <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                <MapPin className="h-5 w-5 text-purple-600" />
                <div>
                  <p className="font-semibold text-purple-900">Location</p>
                  <p className="text-purple-700">{event.location}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
                <Users className="h-5 w-5 text-orange-600" />
                <div>
                  <p className="font-semibold text-orange-900">Organizer</p>
                  <p className="text-orange-700">{event.organizer}</p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Description */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="p-4 bg-gray-50 rounded-lg"
          >
            <h3 className="font-semibold text-[#02609E] mb-2">Description</h3>
            <p className="text-gray-700 leading-relaxed">{event.description}</p>
          </motion.div>

          {/* Registration Status for School Admins */}
          {userRole === "school" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.3 }}
              className="p-4 bg-gradient-to-r from-[#017489]/5 to-[#02609E]/5 rounded-lg border border-[#017489]/10"
            >
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-[#02609E] mb-2">Registration Status</h3>
                  {getRegistrationStatusBadge(registrationStatus)}
                  <p className="text-sm text-gray-600 mt-2">{getRegistrationMessage()}</p>
                </div>

                {event.registrationOpen && !isEventPast(event.date) && (
                  <div className="flex gap-2">
                    {!registrationStatus ? (
                      <Button
                        onClick={handleRegister}
                        disabled={isRegistering}
                        className="bg-gradient-to-r from-[#017489] to-[#02609E] hover:from-[#006955] hover:to-[#013A87] text-white"
                      >
                        {isRegistering ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Registering...
                          </>
                        ) : (
                          <>
                            <UserCheck className="h-4 w-4 mr-2" />
                            Register School
                          </>
                        )}
                      </Button>
                    ) : canUnregister() ? (
                      <Button
                        onClick={handleUnregister}
                        variant="outline"
                        className="border-red-200 text-red-600 hover:bg-red-50"
                      >
                        Cancel Registration
                      </Button>
                    ) : null}
                  </div>
                )}

                {registrationStatus === "rejected" && (
                  <div className="mt-2">
                    <Button
                      onClick={handleRegister}
                      disabled={isRegistering}
                      variant="outline"
                      className="border-[#017489] text-[#017489] hover:bg-[#017489]/5"
                    >
                      Register Again
                    </Button>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Event Status */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <span className="font-semibold text-gray-700">Event Status:</span>
              {isEventPast(event.date) ? (
                <Badge className="bg-gray-100 text-gray-600 ml-2">Completed</Badge>
              ) : event.registrationOpen ? (
                <Badge className="bg-green-100 text-green-800 ml-2">Registration Open</Badge>
              ) : (
                <Badge className="bg-yellow-100 text-yellow-800 ml-2">Registration Closed</Badge>
              )}
            </div>

            {event.maxParticipants && (
              <div className="text-sm text-gray-600">Max Participants: {event.maxParticipants}</div>
            )}
          </div>
        </div>

        <DialogFooter className="pt-6 border-t">
          <Button
            variant="outline"
            onClick={onClose}
            className="border-[#017489]/20 text-[#02609E] hover:bg-[#017489]/5"
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
