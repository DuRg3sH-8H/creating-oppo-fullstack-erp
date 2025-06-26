"use client"

import type React from "react"

import { useState } from "react"
import { X } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useTheme } from "@/components/theme-context"


export interface FeedbackModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (feedback: string, rating: number) => void
  trainingTitle: string
  isSubmitting: boolean
}

export function FeedbackModal({ isOpen, onClose, onSubmit, trainingTitle }: FeedbackModalProps) {
  const { primaryColor } = useTheme()
  const [feedback, setFeedback] = useState("")
  const [rating, setRating] = useState(0)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(feedback, rating)
    setFeedback("")
    setRating(0)
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Training Feedback</DialogTitle>
          <Button variant="ghost" size="icon" className="absolute right-4 top-4" onClick={onClose}>
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </Button>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-1">
            <p className="text-sm font-medium">Training: {trainingTitle}</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="rating">Rating</Label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="text-2xl focus:outline-none"
                  style={{ color: rating >= star ? primaryColor : "#d1d5db" }}
                >
                  ★
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="feedback">Your Feedback</Label>
            <Textarea
              id="feedback"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Please share your thoughts about this training..."
              rows={5}
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" style={{ backgroundColor: primaryColor }} disabled={!feedback || rating === 0}>
              Submit Feedback
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
