"use client"

import type React from "react"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Loader2 } from "lucide-react"
import { registerForClub } from "@/lib/api/clubs"
import type { Club } from "./types"
import { useAuth } from "@/components/auth/auth-context"

interface RegistrationModalProps {
  club: Club
  isOpen: boolean
  onClose: () => void
  onSubmit: (formData: any) => void
}

export function RegistrationModal({ club, isOpen, onClose, onSubmit }: RegistrationModalProps) {
  const { user } = useAuth()
  // Type assertion to handle the schoolLogo property
  const userWithLogo = user as (typeof user & { schoolLogo?: string })
  const [formData, setFormData] = useState({
    participantCount: "",
    notes: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Auto-fill school information when modal opens
  useEffect(() => {
    if (isOpen && user?.schoolId) {
      // No need to set school name as it will be fetched from the user context
      setFormData((prev) => ({
        ...prev,
        // Reset other fields when opening
        participantCount: "",
        notes: "",
      }))
    }
  }, [isOpen, user])

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
    // Clear error when user starts typing
    if (error) setError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.participantCount.trim() || isNaN(Number(formData.participantCount))) {
      setError("Valid participant count is required")
      return
    }

    try {
      setLoading(true)
      // Use school information from user context
      const registrationData = {
        schoolName: user?.schoolName || "",
        schoolLogo: userWithLogo?.schoolLogo || undefined,
        participantCount: Number(formData.participantCount),
        notes: formData.notes.trim() || undefined,
      }
      
      const response = await registerForClub(club.id, registrationData)

      if (response.success) {
        // Reset form
        setFormData({
          participantCount: "",
          notes: "",
        })

        // Call parent callback
        onSubmit(registrationData)

        // Close modal
        onClose()
      } else {
        setError(response.error || "Failed to register for club")
      }
    } catch (err) {
      console.error("Registration error:", err)
      setError(err instanceof Error ? err.message : "Failed to register for club")
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    if (!loading) {
      setFormData({
        participantCount: "",
        notes: "",
      })
      setError(null)
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white">
        <DialogHeader>
          <DialogTitle>Register for {club.name}</DialogTitle>
          <DialogDescription>
            Register for this extracurricular activity. Please provide the required information below.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <Label htmlFor="participantCount" className="text-sm font-medium">
                Expected Number of Participants <span className="text-red-500">*</span>
              </Label>
              <Input
                id="participantCount"
                type="number"
                min="1"
                max="1000"
                value={formData.participantCount}
                onChange={(e) => handleInputChange("participantCount", e.target.value)}
                placeholder="Enter number of participants"
                required
                disabled={loading}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="notes" className="text-sm font-medium">
                Additional Notes
              </Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleInputChange("notes", e.target.value)}
                placeholder="Any additional information or special requirements..."
                disabled={loading}
                className="mt-1"
                rows={4}
              />
            </div>
          </div>

          <DialogFooter className="flex gap-2">
            <Button type="button" variant="outline" onClick={handleClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !formData.participantCount.trim()}>
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Registering...
                </>
              ) : (
                "Register School"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default RegistrationModal
