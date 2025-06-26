"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { User, Mail, Building2, Shield, Lock, Eye, EyeOff, X, AlertCircle, CheckCircle, Camera } from "lucide-react"
import { createUser } from "@/lib/api/users"
import { uploadFile } from "@/lib/api/upload"

import type { UserRole } from "@/components/users/types"

interface AddUserModalProps {
  schools: Array<{ id: string; name: string }>
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  onSave: (newUserData: {
    name: string
    username: string
    email: string
    password: string
    role: UserRole
    schoolId?: string
    schoolName?: string
  }) => void | Promise<void>
}

export function AddUserModal({ schools, isOpen, onClose, onSuccess }: AddUserModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "school" as "super-admin" | "school" | "eca",
    schoolId: "",
    schoolName: "",
  })
  const [avatar, setAvatar] = useState<string>("")
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))

    // Auto-fill school name when school is selected
    if (field === "schoolId") {
      const selectedSchool = schools.find((school) => school.id === value)
      setFormData((prev) => ({
        ...prev,
        schoolId: value,
        schoolName: selectedSchool?.name || "",
      }))
    }
  }

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        setError("Please select a valid image file")
        return
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError("Image size must be less than 5MB")
        return
      }

      setAvatarFile(file)

      // Create preview URL
      const reader = new FileReader()
      reader.onload = (e) => {
        setAvatar(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const removeAvatar = () => {
    setAvatar("")
    setAvatarFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const generateRandomPassword = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*"
    let password = ""
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    setFormData((prev) => ({ ...prev, password }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validation
    if (!formData.name.trim()) {
      setError("Name is required")
      return
    }

    if (!formData.email.trim()) {
      setError("Email is required")
      return
    }

    if (!formData.password) {
      setError("Password is required")
      return
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long")
      return
    }

    if (formData.role !== "super-admin" && !formData.schoolId) {
      setError("School selection is required for school and ECA roles")
      return
    }

    setIsLoading(true)
    setError("")
    setSuccess("")

    try {
      let avatarUrl = ""

      // Upload avatar if a file was selected
      if (avatarFile) {
        const uploadResult = await uploadFile(avatarFile, "avatars")
        avatarUrl = uploadResult
      }

      // Create user
      await createUser({
        ...formData,
        avatar: avatarUrl,
      })

      setSuccess("User created successfully!")

      // Close modal after a short delay
      setTimeout(() => {
        onSuccess()
        handleClose()
      }, 1500)
    } catch (error: any) {
      setError(error.message || "Failed to create user")
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    setFormData({
      name: "",
      email: "",
      password: "",
      role: "school",
      schoolId: "",
      schoolName: "",
    })
    setAvatar("")
    setAvatarFile(null)
    setShowPassword(false)
    setError("")
    setSuccess("")
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
    onClose()
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case "super-admin":
        return "bg-red-100 text-red-800 border-red-200"
      case "school":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "eca":
        return "bg-green-100 text-green-800 border-green-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto bg-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Add New User
          </DialogTitle>
          <DialogDescription>Create a new user account with role and permissions</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Avatar Section */}
          <div className="flex items-center gap-4">
            <div className="relative">
              <Avatar className="h-20 w-20">
                <AvatarImage src={avatar || "/placeholder.svg"} alt={formData.name} />
                <AvatarFallback className="text-lg">
                  {formData.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              {avatar && (
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                  onClick={removeAvatar}
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
            <div className="space-y-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading}
                className="flex items-center gap-2"
              >
                <Camera className="h-4 w-4" />
                Upload Avatar
              </Button>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
              <p className="text-xs text-muted-foreground">Max 5MB. Supports JPG, PNG, GIF</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name">
                <User className="h-4 w-4 inline mr-1" />
                Full Name
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="Enter full name"
                disabled={isLoading}
              />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">
                <Mail className="h-4 w-4 inline mr-1" />
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                placeholder="Enter email address"
                disabled={isLoading}
              />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password">
                <Lock className="h-4 w-4 inline mr-1" />
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => handleInputChange("password", e.target.value)}
                  placeholder="Enter password"
                  className="pr-10"
                  disabled={isLoading}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              <Button type="button" variant="outline" size="sm" onClick={generateRandomPassword} disabled={isLoading}>
                Generate Random Password
              </Button>
            </div>

            {/* Role */}
            <div className="space-y-2">
              <Label>
                <Shield className="h-4 w-4 inline mr-1" />
                Role
              </Label>
              <Select
                value={formData.role}
                onValueChange={(value) => handleInputChange("role", value)}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="super-admin">Super Admin</SelectItem>
                  <SelectItem value="school">School Admin</SelectItem>
                  <SelectItem value="eca">ECA Coordinator</SelectItem>
                </SelectContent>
              </Select>
              <Badge className={getRoleColor(formData.role)}>
                {formData.role === "super-admin"
                  ? "Super Admin"
                  : formData.role === "school"
                    ? "School Admin"
                    : "ECA Coordinator"}
              </Badge>
            </div>

            {/* School Selection */}
            {formData.role !== "super-admin" && (
              <div className="space-y-2 md:col-span-2">
                <Label>
                  <Building2 className="h-4 w-4 inline mr-1" />
                  School
                </Label>
                <Select
                  value={formData.schoolId}
                  onValueChange={(value) => handleInputChange("schoolId", value)}
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a school" />
                  </SelectTrigger>
                  <SelectContent>
                    {schools.map((school) => (
                      <SelectItem key={school.id} value={school.id}>
                        {school.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="border-green-200 bg-green-50 text-green-800">
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Creating..." : "Create User"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
