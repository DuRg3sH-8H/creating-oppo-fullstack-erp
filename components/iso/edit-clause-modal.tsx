"use client"

import type React from "react"

import { useState } from "react"
import { motion } from "framer-motion"
import { X, Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { updateClause } from "@/lib/api/iso"
import type { ISOClause } from "@/components/iso/types"

interface EditClauseModalProps {
  clause: ISOClause
  isOpen: boolean
  onClose: () => void
  onUpdate: (updatedClause: ISOClause) => void
}

export function EditClauseModal({ clause, isOpen, onClose, onUpdate }: EditClauseModalProps) {
  const [formData, setFormData] = useState({
    number: clause.number,
    title: clause.title,
    description: clause.description,
    requirements: [...clause.requirements],
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleRequirementChange = (index: number, value: string) => {
    const newRequirements = [...formData.requirements]
    newRequirements[index] = value
    setFormData((prev) => ({
      ...prev,
      requirements: newRequirements,
    }))
  }

  const addRequirement = () => {
    setFormData((prev) => ({
      ...prev,
      requirements: [...prev.requirements, ""],
    }))
  }

  const removeRequirement = (index: number) => {
    if (formData.requirements.length > 1) {
      const newRequirements = formData.requirements.filter((_, i) => i !== index)
      setFormData((prev) => ({
        ...prev,
        requirements: newRequirements,
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const cleanedRequirements = formData.requirements.filter((req) => req.trim() !== "")
      const updatedClause = await updateClause(clause.id, {
        ...formData,
        requirements: cleanedRequirements,
      })

      toast({
        title: "Success",
        description: "Clause updated successfully.",
      })

      onUpdate({ ...clause, ...updatedClause })
    } catch (error) {
      console.error("Error updating clause:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update clause.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-[var(--accent-color)]">Edit ISO Clause</h2>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="number">Clause Number</Label>
              <Input
                id="number"
                value={formData.number}
                onChange={(e) => handleInputChange("number", e.target.value)}
                placeholder="e.g., 4.1"
                required
              />
            </div>
            <div>
              <Label htmlFor="title">Clause Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                placeholder="e.g., Context of the Organization"
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Provide a detailed description of this clause..."
              rows={4}
              required
            />
          </div>

          <div>
            <Label>Requirements</Label>
            <div className="space-y-3 mt-2">
              {formData.requirements.map((requirement, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input
                    value={requirement}
                    onChange={(e) => handleRequirementChange(index, e.target.value)}
                    placeholder={`Requirement ${index + 1}`}
                    required
                  />
                  {formData.requirements.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeRequirement(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addRequirement}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Requirement
              </Button>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-[var(--primary-color)] hover:bg-[var(--secondary-color)] text-white"
            >
              {isSubmitting ? "Updating..." : "Update Clause"}
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}
