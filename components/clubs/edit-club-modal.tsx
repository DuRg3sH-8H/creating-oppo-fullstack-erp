"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Edit } from "lucide-react"
import { FileUploadZone } from "./file-upload-zone"
import type { Club, ClubCategory } from "./types"

interface EditClubModalProps {
  club: Club
  isOpen: boolean
  onClose: () => void
  onSubmit: (club: Partial<Club> & { id: string }) => void
}

export function EditClubModal({ club, isOpen, onClose, onSubmit }: EditClubModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    leadTeacher: "",
    category: "" as ClubCategory,
    description: "",
    status: "Open" as "Open" | "Closed" | "Coming Soon",
    logo: "",
  })

  const [isSubmitting, setIsSubmitting] = useState(false)

  const categories: ClubCategory[] = [
    "Eco",
    "Heritage",
    "Drama",
    "Sports",
    "Academic",
    "Technology",
    "Arts",
    "Music",
    "Other",
  ]

  useEffect(() => {
    if (club && isOpen) {
      setFormData({
        name: club.name,
        leadTeacher: club.leadTeacher,
        category: club.category,
        description: club.description,
        status: club.status || "Open",
        logo: club.logo || "",
      })
    }
  }, [club, isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      await onSubmit({
        id: club.id,
        ...formData,
        logo: formData.logo || "/placeholder.svg?height=64&width=64",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleLogoUpload = (url: string) => {
    setFormData((prev) => ({ ...prev, logo: url }))
  }

  const handleLogoRemove = () => {
    setFormData((prev) => ({ ...prev, logo: "" }))
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit className="h-5 w-5" />
            Edit Club
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Club Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                placeholder="e.g., Eco Warriors"
                required
              />
            </div>

            <div>
              <Label htmlFor="leadTeacher">Lead Teacher *</Label>
              <Input
                id="leadTeacher"
                value={formData.leadTeacher}
                onChange={(e) => handleChange("leadTeacher", e.target.value)}
                placeholder="e.g., Ms. Johnson"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="category">Category *</Label>
              <Select value={formData.category} onValueChange={(value) => handleChange("category", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value) => handleChange("status", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Open">Open</SelectItem>
                  <SelectItem value="Closed">Closed</SelectItem>
                  <SelectItem value="Coming Soon">Coming Soon</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label>Club Logo (Optional)</Label>
            <FileUploadZone
              onUpload={handleLogoUpload}
              onRemove={handleLogoRemove}
              currentFile={formData.logo}
              accept="image/*"
              placeholder="Upload club logo"
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              placeholder="Describe what this club is about, its goals, and activities..."
              rows={4}
              required
            />
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <h4 className="font-semibold text-amber-900 mb-2">Club Statistics:</h4>
            <div className="grid grid-cols-2 gap-4 text-amber-700 text-sm">
              <div>
                <span className="font-medium">Total Activities:</span> {club.totalActivities}
              </div>
              <div>
                <span className="font-medium">Registered Schools:</span> {club.registrations?.length || 0}
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || !formData.name || !formData.category} className="flex-1">
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
