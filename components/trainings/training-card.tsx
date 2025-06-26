"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import {
  Calendar,
  Clock,
  FolderOpen,
  MoreVertical,
  User,
  Edit,
  Trash2,
  MessageSquare,
  UserPlus,
  UserMinus,
  Check,
  Users,
  Eye,
} from "lucide-react"
import { format } from "date-fns"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useTheme } from "@/components/theme-context"
import { useAuth } from "@/components/auth/auth-context"
import type { Training } from "@/components/trainings/types"
import { FeedbackModal } from "@/components/trainings/feedback-modal"
import { RegistrationModal } from "@/components/trainings/registration-modal"
import { MaterialsModal } from "@/components/trainings/materials-modal"
import { RegisteredUsersModal } from "@/components/trainings/registered-users-modal"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { submitFeedback } from "@/lib/api/trainings"

interface TrainingCardProps {
  training: Training
  userRole: "super-admin" | "school" | "eca"
  onEdit: (training: Training) => void
  onDelete: (id: string) => void
  onRegister: (id: string) => void
  onUnregister: (id: string) => void
  index: number
}

export function TrainingCard({
  training,
  userRole,
  onEdit,
  onDelete,
  onRegister,
  onUnregister,
  index,
}: TrainingCardProps) {
  const { primaryColor, accentColor } = useTheme()
  const { user } = useAuth()
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false)
  const [isRegistrationModalOpen, setIsRegistrationModalOpen] = useState(false)
  const [isMaterialsModalOpen, setIsMaterialsModalOpen] = useState(false)
  const [isRegisteredUsersModalOpen, setIsRegisteredUsersModalOpen] = useState(false)
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false)
  const [isRegistering, setIsRegistering] = useState(false)

  // Check if current user is registered
  const currentUserId = user?._id || "current-user-id"
  const isRegistered = training.registeredUsers
    ? training.registeredUsers.map(String).includes(String(currentUserId))
    : false
  const registeredCount = training.registeredUsers?.length || 0
  const maxParticipants = training.maxParticipants || 0
  const isFull = maxParticipants > 0 && registeredCount >= maxParticipants

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        delay: index * 0.1,
      },
    },
  }

  const handleSubmitFeedback = async (feedback: string, rating: number) => {

    setIsSubmittingFeedback(true)
    try {
      const response = await submitFeedback(training.id, { feedback, rating })
      if (response.success) {
        setIsFeedbackModalOpen(false)
        alert("Feedback submitted successfully!")
      } else {
        alert(`Failed to submit feedback: ${response.error}`)
      }
    } catch (error) {
      alert(`Error submitting feedback: ${error instanceof Error ? error.message : "Unknown error"}`)
      alert(`Error submitting feedback: ${error instanceof Error ? error.message : "Unknown error"}`)
    } finally {
      setIsSubmittingFeedback(false)
    }
  }

  const handleRegister = async () => {
    setIsRegistering(true)
    try {
      await onRegister(training.id)
      setIsRegistrationModalOpen(false)
    } catch (error) {
      alert(`Error registering for training: ${error instanceof Error ? error.message : "Unknown error"}`)
    } finally {
      setIsRegistering(false)
    }
  }

  const handleUnregister = async () => {
    setIsRegistering(true)
    try {
      await onUnregister(training.id)
    } catch (error) {
      console.error("❌ Unregistration error:", error)
    } finally {
      setIsRegistering(false)
    }
  }

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMMM d, yyyy")
    } catch {
      return dateString
    }
  }

  const formatTime = (timeString: string) => {
    return timeString
  }

  return (
    <motion.div variants={item}>
      <Card className="h-full flex flex-col overflow-hidden hover:shadow-md transition-shadow duration-300 relative">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <Badge style={{ backgroundColor: primaryColor, color: "white" }} className="mb-2">
              {training.category}
            </Badge>

            {userRole === "super-admin" && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreVertical className="h-4 w-4" />
                    <span className="sr-only">Open menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setIsRegisteredUsersModalOpen(true)}>
                    <Eye className="mr-2 h-4 w-4" />
                    View Registered Users
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onEdit(training)}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onDelete(training.id)} className="text-red-600">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
          <CardTitle className="text-xl">{training.title}</CardTitle>
        </CardHeader>
        <CardContent className="flex-grow pb-2">
          <div className="space-y-3 text-sm">
            <div className="flex items-center text-gray-500">
              <Calendar className="h-4 w-4 mr-2" />
              <span>{formatDate(training.date)}</span>
            </div>
            <div className="flex items-center text-gray-500">
              <Clock className="h-4 w-4 mr-2" />
              <span>{formatTime(training.time)}</span>
            </div>
            <div className="flex items-center text-gray-500">
              <User className="h-4 w-4 mr-2" />
              <span>{training.trainer}</span>
            </div>
            <div className="flex items-center text-gray-500">
              <Users className="h-4 w-4 mr-2" />
              <span>
                {registeredCount} registered
                {maxParticipants > 0 && ` / ${maxParticipants} max`}
                {isFull && (
                  <Badge variant="destructive" className="ml-2 text-xs">
                    Full
                  </Badge>
                )}
                {userRole === "super-admin" && registeredCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="ml-2 h-6 px-2 text-xs"
                    onClick={() => setIsRegisteredUsersModalOpen(true)}
                    style={{ color: primaryColor }}
                  >
                    View List
                  </Button>
                )}
              </span>
            </div>
            <p className="text-gray-700 mt-3">{training.description}</p>
          </div>
        </CardContent>
        <CardFooter className="pt-2 flex flex-col gap-2">
          {/* Materials Section */}
          {training.materials && training.materials.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-2 w-full"
              onClick={() => setIsMaterialsModalOpen(true)}
            >
              <FolderOpen className="h-4 w-4" />
              View Materials ({training.materials.length})
            </Button>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 w-full">
            {(userRole === "school" || userRole === "eca") && (
              <>
                {isRegistered ? (
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-1 flex-1"
                    onClick={handleUnregister}
                    disabled={isRegistering}
                    style={{ borderColor: "red", color: "red" }}
                  >
                    {isRegistering ? (
                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-red-500"></div>
                    ) : (
                      <UserMinus className="h-3 w-3" />
                    )}
                    {isRegistering ? "..." : "Unregister"}
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-1 flex-1"
                    onClick={() => setIsRegistrationModalOpen(true)}
                    disabled={isFull || isRegistering}
                    style={{
                      borderColor: isFull ? "#gray" : primaryColor,
                      color: isFull ? "gray" : primaryColor,
                    }}
                  >
                    {isRegistering ? (
                      <div
                        className="animate-spin rounded-full h-3 w-3 border-b-2"
                        style={{ borderColor: primaryColor }}
                      ></div>
                    ) : (
                      <UserPlus className="h-3 w-3" />
                    )}
                    {isRegistering ? "..." : isFull ? "Full" : "Register"}
                  </Button>
                )}

                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-1 flex-1"
                  onClick={() => setIsFeedbackModalOpen(true)}
                  style={{ borderColor: accentColor, color: accentColor }}
                  disabled={isSubmittingFeedback}
                >
                  <MessageSquare className="h-3 w-3" />
                  Feedback
                </Button>
              </>
            )}
          </div>
        </CardFooter>

        {isRegistered && (
          <div
            className="absolute top-2 right-2 p-1 rounded-full"
            style={{ backgroundColor: primaryColor }}
            title="You are registered for this training"
          >
            <Check className="h-4 w-4 text-white" />
          </div>
        )}
      </Card>

      <FeedbackModal
        isOpen={isFeedbackModalOpen}
        onClose={() => setIsFeedbackModalOpen(false)}
        onSubmit={handleSubmitFeedback}
        trainingTitle={training.title}
        isSubmitting={isSubmittingFeedback}
      />

      <RegistrationModal
        isOpen={isRegistrationModalOpen}
        onClose={() => setIsRegistrationModalOpen(false)}
        onConfirm={handleRegister}
        training={training}
        isRegistering={isRegistering}
      />

      <MaterialsModal
        isOpen={isMaterialsModalOpen}
        onClose={() => setIsMaterialsModalOpen(false)}
        materials={
          (training.materials || []).map((m: any) =>
            typeof m === "string" ? { name: m } : m
          )
        }
        trainingTitle={training.title}
      />

      <RegisteredUsersModal
        isOpen={isRegisteredUsersModalOpen}
        onClose={() => setIsRegisteredUsersModalOpen(false)}
        training={training}
      />
    </motion.div>
  )
}
