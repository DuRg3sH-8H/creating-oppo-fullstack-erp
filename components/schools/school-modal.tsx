"use client"

import type React from "react"

import { useState } from "react"
import { motion } from "framer-motion"
import type { School } from "@/components/schools/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { ColorPicker } from "@/components/schools/color-picker"
import { ThemePreview } from "@/components/schools/theme-preview"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2 } from "lucide-react"
import { uploadFile, validateImageFile } from "@/lib/api/upload"
import { AlertCircle } from "lucide-react"

interface SchoolModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (school: School) => void
  school?: School
  title: string
  isSubmitting?: boolean
}

const defaultSchool: School = {
  id: "",
  name: "",
  logo: "/placeholder.svg?height=80&width=80",
  primaryColor: "#017489",
  secondaryColor: "#006955",
  accentColor: "#02609E",
  darkColor: "#013A87",
  address: "",
  email: "",
  phone: "",
  website: "",
  established: "",
  isActive: false
}

export function SchoolModal({
  isOpen,
  onClose,
  onSave,
  school,
  title,
  isSubmitting: propIsSubmitting,
}: SchoolModalProps) {
  const [formData, setFormData] = useState<School>(school || defaultSchool)
  const [isSubmitting, setIsSubmitting] = useState(propIsSubmitting || false)
  const [activeTab, setActiveTab] = useState("basic")
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleColorChange = (colorType: string, color: string) => {
    setFormData((prev) => ({ ...prev, [colorType]: color }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false)
      onSave(formData)
    }, 1000)
  }

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file
    const validationError = validateImageFile(file)
    if (validationError) {
      setUploadError(validationError)
      return
    }

    setUploadError(null)
    setIsUploading(true)

    try {
      // Upload file to server
      const logoUrl = await uploadFile(file, "schools")
      setFormData((prev) => ({ ...prev, logo: logoUrl }))
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : "Upload failed")
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] bg-white p-6 rounded-lg shadow-lg text-black">
        <DialogHeader>
          <DialogTitle className="text-[#02609E]">{title}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Tabs defaultValue="basic" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="theme">Theme Colors</TabsTrigger>
              <TabsTrigger value="contact">Contact Details</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-[#02609E]">
                  School Name
                </Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter school name"
                  className="border-[#017489]/20 focus:border-[#017489] focus:ring-[#017489]/20"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="logo" className="text-[#02609E]">
                  School Logo
                </Label>
                <div className="flex items-center gap-4">
                  <div className="relative h-20 w-20 rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
                    {isUploading ? (
                      <div className="h-full w-full flex items-center justify-center">
                        <Loader2 className="h-6 w-6 animate-spin text-[#017489]" />
                      </div>
                    ) : formData.logo ? (
                      <motion.img
                        key={formData.logo}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        src={formData.logo}
                        alt="School logo preview"
                        className="h-full w-full object-contain p-2"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-gray-400">
                        <span className="text-xs">No logo</span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <Input
                      id="logo"
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      disabled={isUploading}
                      className="border-[#017489]/20 focus:border-[#017489] focus:ring-[#017489]/20"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Recommended: Square image, 200x200px or larger (Max 5MB)
                    </p>
                    {uploadError && (
                      <div className="flex items-center gap-1 mt-1 text-red-600">
                        <AlertCircle className="h-3 w-3" />
                        <span className="text-xs">{uploadError}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="established" className="text-[#02609E]">
                  Established Year
                </Label>
                <Input
                  id="established"
                  name="established"
                  value={formData.established}
                  onChange={handleChange}
                  placeholder="e.g. 1995"
                  className="border-[#017489]/20 focus:border-[#017489] focus:ring-[#017489]/20"
                />
              </div>
            </TabsContent>

            <TabsContent value="theme" className="space-y-4 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="primaryColor" className="text-[#02609E]">
                    Primary Color
                  </Label>
                  <ColorPicker
                    color={formData.primaryColor}
                    onChange={(color) => handleColorChange("primaryColor", color)}
                    id="primaryColor"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="secondaryColor" className="text-[#02609E]">
                    Secondary Color
                  </Label>
                  <ColorPicker
                    color={formData.secondaryColor}
                    onChange={(color) => handleColorChange("secondaryColor", color)}
                    id="secondaryColor"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="accentColor" className="text-[#02609E]">
                    Accent Color
                  </Label>
                  <ColorPicker
                    color={formData.accentColor}
                    onChange={(color) => handleColorChange("accentColor", color)}
                    id="accentColor"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="darkColor" className="text-[#02609E]">
                    Dark Color
                  </Label>
                  <ColorPicker
                    color={formData.darkColor}
                    onChange={(color) => handleColorChange("darkColor", color)}
                    id="darkColor"
                  />
                </div>
              </div>

              <div className="pt-4">
                <Label className="text-[#02609E] mb-2 block">Theme Preview</Label>
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <ThemePreview
                    primaryColor={formData.primaryColor}
                    secondaryColor={formData.secondaryColor}
                    accentColor={formData.accentColor}
                    darkColor={formData.darkColor}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="contact" className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="address" className="text-[#02609E]">
                  Address
                </Label>
                <Textarea
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Enter school address"
                  className="border-[#017489]/20 focus:border-[#017489] focus:ring-[#017489]/20 min-h-20"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-[#02609E]">
                    Email
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter email address"
                    className="border-[#017489]/20 focus:border-[#017489] focus:ring-[#017489]/20"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-[#02609E]">
                    Phone
                  </Label>
                  <Input
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Enter phone number"
                    className="border-[#017489]/20 focus:border-[#017489] focus:ring-[#017489]/20"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="website" className="text-[#02609E]">
                  Website
                </Label>
                <Input
                  id="website"
                  name="website"
                  value={formData.website}
                  onChange={handleChange}
                  placeholder="Enter website URL"
                  className="border-[#017489]/20 focus:border-[#017489] focus:ring-[#017489]/20"
                />
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter className="pt-4">
            <div className="flex justify-between w-full">
              <div>
                {activeTab === "basic" ? (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onClose}
                    className="border-[#017489]/20 text-[#02609E]"
                  >
                    Cancel
                  </Button>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      if (activeTab === "theme") setActiveTab("basic")
                      else if (activeTab === "contact") setActiveTab("theme")
                    }}
                    className="border-[#017489]/20 text-[#02609E]"
                  >
                    Back
                  </Button>
                )}
              </div>
              <div>
                {activeTab !== "contact" ? (
                  <Button
                    type="button"
                    onClick={() => {
                      if (activeTab === "basic") setActiveTab("theme")
                      else if (activeTab === "theme") setActiveTab("contact")
                    }}
                    className="bg-[#017489] hover:bg-[#006955] text-white"
                  >
                    Next
                  </Button>
                ) : (
                  <Button type="submit" disabled={isSubmitting} className="bg-[#017489] hover:bg-[#006955] text-white">
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      "Save School"
                    )}
                  </Button>
                )}
              </div>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
