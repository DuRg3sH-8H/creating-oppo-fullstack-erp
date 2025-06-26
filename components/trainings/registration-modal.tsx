"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, User, Users } from "lucide-react"
import { format } from "date-fns"
import type { Training } from "@/components/trainings/types"

interface RegistrationModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  training: Training
  isRegistering?: boolean
}

export function RegistrationModal({
  isOpen,
  onClose,
  onConfirm,
  training,
  isRegistering = false,
}: RegistrationModalProps) {
  const registeredCount = training.registeredUsers?.length || 0
  const maxParticipants = training.maxParticipants || 0
  const isFull = maxParticipants > 0 && registeredCount >= maxParticipants

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMMM d, yyyy")
    } catch {
      return dateString
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-white">
        <DialogHeader>
          <DialogTitle>Confirm Registration</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <h3 className="font-semibold text-lg">{training.title}</h3>
            <Badge className="mt-1">{training.category}</Badge>
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex items-center text-gray-600">
              <Calendar className="h-4 w-4 mr-2" />
              <span>{formatDate(training.date)}</span>
            </div>
            <div className="flex items-center text-gray-600">
              <Clock className="h-4 w-4 mr-2" />
              <span>{training.time}</span>
            </div>
            <div className="flex items-center text-gray-600">
              <User className="h-4 w-4 mr-2" />
              <span>{training.trainer}</span>
            </div>
            <div className="flex items-center text-gray-600">
              <Users className="h-4 w-4 mr-2" />
              <span>
                {registeredCount} registered
                {maxParticipants > 0 && ` / ${maxParticipants} max`}
              </span>
            </div>
          </div>

          {isFull && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-800 text-sm">
                ⚠️ This training is currently full. You can still register to be added to the waiting list.
              </p>
            </div>
          )}

          <p className="text-gray-700">Are you sure you want to register for this training?</p>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isRegistering}>
            Cancel
          </Button>
          <Button onClick={onConfirm} disabled={isRegistering}>
            {isRegistering ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Registering...
              </>
            ) : (
              "Confirm Registration"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
