"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, FileText, ImageIcon, Plus, Edit, Trash2, X } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import type { Club, ClubActivity } from "./types"
import {
  fetchClubActivities,
  createClubActivity,
  updateClubActivity,
  deleteClubActivity,
  type CreateActivityData,
} from "@/lib/api/clubs"

interface ClubActivitiesModalProps {
  club: Club
  isOpen: boolean
  onClose: () => void
  onSave: (activities: ClubActivity[]) => void
}

export function ClubActivitiesModal({ club, isOpen, onClose, onSave }: ClubActivitiesModalProps) {
  const [activities, setActivities] = useState<ClubActivity[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingActivity, setEditingActivity] = useState<ClubActivity | null>(null)
  const [submitting, setSubmitting] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    date: "",
    description: "",
    images: [] as string[],
    minutesUrl: "",
  })

  // Load activities when modal opens
  useEffect(() => {
    if (isOpen && club?.id) {
      loadActivities()
    }
  }, [isOpen, club?.id])

  const loadActivities = async () => {
    if (!club?.id) return

    setLoading(true)
    setError(null)

    try {
      const response = await fetchClubActivities(club.id)
      if (response.success) {
        const activitiesData = response.data || []
        setActivities(activitiesData)
        // Remove this line that's causing the modal to close:
        // onSave(activitiesData)
      } else {
        setError(response.error || "Failed to load activities")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load activities")
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      title: "",
      date: "",
      description: "",
      images: [],
      minutesUrl: "",
    })
    setEditingActivity(null)
    setShowAddForm(false)
  }

  const handleEdit = (activity: ClubActivity) => {
    setFormData({
      title: activity.title,
      date: activity.date,
      description: activity.description,
      images: activity.images || [],
      minutesUrl: activity.minutesUrl || "",
    })
    setEditingActivity(activity)
    setShowAddForm(true)
  }

  const handleSubmitActivity = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title.trim() || !formData.date || !formData.description.trim()) {
      setError("Please fill in all required fields")
      return
    }

    if (!club?.id) {
      setError("Club ID is required")
      return
    }

    setSubmitting(true)
    setError(null)

    try {
      const activityData: CreateActivityData = {
        title: formData.title.trim(),
        date: formData.date,
        description: formData.description.trim(),
        images: formData.images.filter((img) => img.trim()),
        minutesUrl: formData.minutesUrl.trim() || undefined,
      }

      let response
      if (editingActivity) {
        // Update existing activity
        response = await updateClubActivity(club.id, editingActivity.id, activityData)
      } else {
        // Create new activity
        response = await createClubActivity(club.id, activityData)
      }

      if (response.success) {
        // Reload activities to get updated list
        await loadActivities()
        resetForm()
        setError(null)
        // Only call onSave here when we actually save an activity
        onSave(activities)
      } else {
        setError(response.error || "Failed to save activity")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save activity")
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteActivity = async (activityId: string) => {
    if (!confirm("Are you sure you want to delete this activity?")) {
      return
    }

    if (!club?.id) {
      setError("Club ID is required")
      return
    }

    setError(null)

    try {
      const response = await deleteClubActivity(club.id, activityId)
      if (response.success) {
        // Reload activities to get updated list
        await loadActivities()
        // Call onSave to update parent component
        const updatedActivities = activities.filter((a) => a.id !== activityId)
        onSave(updatedActivities)
      } else {
        setError(response.error || "Failed to delete activity")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete activity")
    }
  }

  const handleImageAdd = () => {
    const url = prompt("Enter image URL:")
    if (url && url.trim()) {
      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, url.trim()],
      }))
    }
  }

  const handleImageRemove = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }))
  }

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString()
    } catch {
      return dateString
    }
  }

  const handleSaveAndClose = () => {
    onSave(activities)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            {club?.name || "Club"} - Activities
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Add Activity Button */}
          {!showAddForm && (
            <Button onClick={() => setShowAddForm(true)} className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Add New Activity
            </Button>
          )}

          {/* Add/Edit Activity Form */}
          {showAddForm && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  {editingActivity ? "Edit Activity" : "Add New Activity"}
                  <Button variant="ghost" size="sm" onClick={resetForm}>
                    <X className="h-4 w-4" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmitActivity} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="title">Activity Title *</Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                        placeholder="Enter activity title"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="date">Date *</Label>
                      <Input
                        id="date"
                        type="date"
                        value={formData.date}
                        onChange={(e) => setFormData((prev) => ({ ...prev, date: e.target.value }))}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="description">Description *</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                      placeholder="Describe the activity..."
                      rows={3}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="minutesUrl">Meeting Minutes URL</Label>
                    <Input
                      id="minutesUrl"
                      value={formData.minutesUrl}
                      onChange={(e) => setFormData((prev) => ({ ...prev, minutesUrl: e.target.value }))}
                      placeholder="https://..."
                      type="url"
                    />
                  </div>

                  {/* Images Section */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label>Activity Images</Label>
                      <Button type="button" variant="outline" size="sm" onClick={handleImageAdd}>
                        <ImageIcon className="h-4 w-4 mr-2" />
                        Add Image
                      </Button>
                    </div>
                    {formData.images.length > 0 && (
                      <div className="space-y-2">
                        {formData.images.map((image, index) => (
                          <div key={index} className="flex items-center gap-2 p-2 border rounded">
                            <img
                              src={image || "/placeholder.svg?height=48&width=48"}
                              alt={`Activity ${index + 1}`}
                              className="h-12 w-12 object-cover rounded"
                            />
                            <span className="flex-1 text-sm truncate">{image}</span>
                            <Button type="button" variant="ghost" size="sm" onClick={() => handleImageRemove(index)}>
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button type="submit" disabled={submitting}>
                      {submitting ? "Saving..." : editingActivity ? "Update Activity" : "Add Activity"}
                    </Button>
                    <Button type="button" variant="outline" onClick={resetForm}>
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Activities List */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Activities ({activities.length})</h3>

            {loading ? (
              <div className="text-center py-8">Loading activities...</div>
            ) : activities.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No activities found. Add the first activity above.
              </div>
            ) : (
              <div className="grid gap-4">
                {activities.map((activity) => (
                  <Card key={activity.id}>
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">{activity.title}</CardTitle>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {formatDate(activity.date)}
                            </div>
                            {activity.images && activity.images.length > 0 && (
                              <Badge variant="secondary">
                                <ImageIcon className="h-3 w-3 mr-1" />
                                {activity.images.length} image{activity.images.length !== 1 ? "s" : ""}
                              </Badge>
                            )}
                            {activity.minutesUrl && (
                              <Badge variant="secondary">
                                <FileText className="h-3 w-3 mr-1" />
                                Minutes
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="sm" onClick={() => handleEdit(activity)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteActivity(activity.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <p className="text-sm text-muted-foreground mb-3">{activity.description}</p>

                      {activity.images && activity.images.length > 0 && (
                        <div className="flex gap-2 mb-3 overflow-x-auto">
                          {activity.images.map((image, index) => (
                            <img
                              key={index}
                              src={image || "/placeholder.svg?height=80&width=80"}
                              alt={`${activity.title} ${index + 1}`}
                              className="h-20 w-20 object-cover rounded border flex-shrink-0"
                            />
                          ))}
                        </div>
                      )}

                      {activity.minutesUrl && (
                        <a
                          href={activity.minutesUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                        >
                          <FileText className="h-4 w-4" />
                          View Meeting Minutes
                        </a>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button onClick={handleSaveAndClose}>Save & Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
