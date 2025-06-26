"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PlusCircle } from "lucide-react"
import { FileUploadZone } from "./file-upload-zone"
import type { Club, ClubCategory } from "./types"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface AddClubModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (club: Omit<Club, "id" | "totalActivities" | "activities" | "registrations">) => void
}

export function AddClubModal({ isOpen, onClose, onSubmit }: AddClubModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    leadTeacher: "",
    category: "" as ClubCategory,
    description: "",
    status: "Open" as "Open" | "Closed" | "Coming Soon",
    logo: "",
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate required fields
    if (!formData.name.trim()) {
      setError("Club name is required")
      return
    }

    if (!formData.leadTeacher.trim()) {
      setError("Lead teacher is required")
      return
    }

    if (!formData.category) {
      setError("Category is required")
      return
    }

    if (!formData.description.trim()) {
      setError("Description is required")
      return
    }

    setIsSubmitting(true)
    setError("")

    try {
      const clubData = {
        name: formData.name.trim(),
        leadTeacher: formData.leadTeacher.trim(),
        category: formData.category,
        description: formData.description.trim(),
        status: formData.status,
        logo: formData.logo || "/placeholder.svg?height=64&width=64",
      }

      await onSubmit(clubData)

      // Reset form on success
      setFormData({
        name: "",
        leadTeacher: "",
        category: "" as ClubCategory,
        description: "",
        status: "Open",
        logo: "",
      })
      setError("")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create club")
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
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <PlusCircle className="h-5 w-5" />
            Add New Club
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
                  <SelectValue placeholder={formData.status} />
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

          {error && (
            <Alert variant="destructive">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 mb-2">After creating the club:</h4>
            <ul className="text-blue-700 text-sm space-y-1">
              <li>• You can add activities and manage club content</li>
              <li>• Schools will be able to register for the club</li>
              <li>• You'll receive notifications about new registrations</li>
              <li>• You can edit or delete the club at any time</li>
            </ul>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={
                isSubmitting ||
                !formData.name.trim() ||
                !formData.leadTeacher.trim() ||
                !formData.category ||
                !formData.description.trim()
              }
              className="flex-1"
            >
              {isSubmitting ? "Creating..." : "Create Club"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
