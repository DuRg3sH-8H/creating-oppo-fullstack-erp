"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { X, Plus, Trash2 } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Training, TrainingMaterial } from "@/components/trainings/types"

interface TrainingModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (training: Training) => void
  title: string
  training?: Training
}

export function TrainingModal({ isOpen, onClose, onSave, title, training }: TrainingModalProps) {
  const [formData, setFormData] = useState<Omit<Training, "id"> & { id?: string }>({
    title: "",
    description: "",
    date: "",
    time: "",
    trainer: "",
    category: "Professional Development",
    materials: [],
  })

  useEffect(() => {
    if (training) {
      setFormData(training)
    } else {
      setFormData({
        title: "",
        description: "",
        date: "",
        time: "",
        trainer: "",
        category: "Professional Development",
        materials: [],
      })
    }
  }, [training, isOpen])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleCategoryChange = (value: string) => {
    setFormData((prev) => ({ ...prev, category: value }))
  }

  const handleAddMaterial = () => {
    setFormData((prev) => ({
      ...prev,
      materials: [...prev.materials, { name: "", url: "" }],
    }))
  }

  const handleMaterialChange = (index: number, field: keyof TrainingMaterial, value: string) => {
    setFormData((prev) => {
      const updatedMaterials = [...prev.materials]
      updatedMaterials[index] = { ...updatedMaterials[index], [field]: value }
      return { ...prev, materials: updatedMaterials }
    })
  }

  const handleRemoveMaterial = (index: number) => {
    setFormData((prev) => {
      const updatedMaterials = [...prev.materials]
      updatedMaterials.splice(index, 1)
      return { ...prev, materials: updatedMaterials }
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({ ...formData, id: formData.id || Date.now().toString() } as Training)
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto bg-white">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <Button variant="ghost" size="icon" className="absolute right-4 top-4" onClick={onClose}>
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </Button>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input id="title" name="title" value={formData.title} onChange={handleChange} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input id="date" name="date" type="date" value={formData.date} onChange={handleChange} required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="time">Time</Label>
                <Input id="time" name="time" type="time" value={formData.time} onChange={handleChange} required />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="trainer">Trainer</Label>
              <Input id="trainer" name="trainer" value={formData.trainer} onChange={handleChange} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={formData.category} onValueChange={handleCategoryChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Professional Development">Professional Development</SelectItem>
                  <SelectItem value="ISO Training">ISO Training</SelectItem>
                  <SelectItem value="Technical Skills">Technical Skills</SelectItem>
                  <SelectItem value="Leadership">Leadership</SelectItem>
                  <SelectItem value="Compliance">Compliance</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Training Materials</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddMaterial}
                  className="flex items-center gap-1"
                >
                  <Plus className="h-3 w-3" />
                  Add Material
                </Button>
              </div>

              {formData.materials.map((material, index) => (
                <div key={index} className="grid grid-cols-[1fr_1fr_auto] gap-2 items-end">
                  <div>
                    <Label htmlFor={`material-name-${index}`} className="text-xs">
                      Name
                    </Label>
                    <Input
                      id={`material-name-${index}`}
                      value={material.name}
                      onChange={(e) => handleMaterialChange(index, "name", e.target.value)}
                      placeholder="Material name"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor={`material-url-${index}`} className="text-xs">
                      URL
                    </Label>
                    <Input
                      id={`material-url-${index}`}
                      value={material.url}
                      onChange={(e) => handleMaterialChange(index, "url", e.target.value)}
                      placeholder="https://..."
                      required
                    />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveMaterial(index)}
                    className="h-10 w-10 text-red-500"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Remove material</span>
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Save Training</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
