"use client"
import { useState, useEffect } from "react"
import { useRole } from "@/components/role-context"
import { useLanguage } from "@/components/language-context"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"
import {
  Edit2,
  Save,
  Mail,
  Calendar,
  Shield,
  Clock,
  Eye,
  EyeOff,
  AlertCircle,
  Camera,
  Lock,
  Activity,
  Settings,
  UserCheck,
  Building,
  User,
} from "lucide-react"
import type { User as UserModel } from "@/models/user"

interface PasswordChangeData {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

export function SettingsPage() {
  const { t } = useLanguage()
  const { userRole: userRole } = useRole()
  const { toast } = useToast()

  const [user, setUser] = useState<UserModel | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [activeTab, setActiveTab] = useState("profile")
  const [error, setError] = useState<string | null>(null)

  const [passwordData, setPasswordData] = useState<PasswordChangeData>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  // Fetch user profile on component mount
  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch("/api/profile", {
        credentials: "include",
        cache: "no-store",
      })

  

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `HTTP ${response.status}`)
      }

      const data = await response.json()
      setUser(data.user)
    } catch (error) {
      console.error("Error fetching profile:", error)
      const errorMessage = error instanceof Error ? error.message : "Failed to load profile data"
      setError(errorMessage)
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleProfileUpdate = async () => {
    if (!user) return

    try {
      setIsSaving(true)
      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(user),
      })

      if (!response.ok) {
        throw new Error("Failed to update profile")
      }

      const data = await response.json()
      setUser(data.user)

      toast({
        title: "Success",
        description: "Profile updated successfully",
      })

      setIsEditing(false)
    } catch (error) {
      console.error("Error updating profile:", error)
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handlePasswordChange = async () => {
    try {
      if (passwordData.newPassword !== passwordData.confirmPassword) {
        toast({
          title: "Error",
          description: "New passwords do not match",
          variant: "destructive",
        })
        return
      }

      const response = await fetch("/api/profile/password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(passwordData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to change password")
      }

      toast({
        title: "Success",
        description: "Password changed successfully",
      })

      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      })
    } catch (error) {
      console.error("Error changing password:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to change password",
        variant: "destructive",
      })
    }
  }

  const handleAvatarUpload = async (file: File) => {
    try {
      const formData = new FormData()
      formData.append("avatar", file)

      const response = await fetch("/api/profile/avatar", {
        method: "POST",
        credentials: "include",
        body: formData,
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to upload avatar")
      }

      const data = await response.json()

      toast({
        title: "Success",
        description: "Avatar uploaded successfully",
      })

      fetchProfile() // Refresh profile data
    } catch (error) {
      console.error("Error uploading avatar:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to upload avatar",
        variant: "destructive",
      })
    }
  }

  const formatDate = (dateString?: string | Date) => {
    if (!dateString) return "Not set"
    const options: Intl.DateTimeFormatOptions = { year: "numeric", month: "long", day: "numeric" }
    return new Date(dateString).toLocaleDateString(undefined, options)
  }

  const formatDateTime = (dateTimeString?: string | Date) => {
    if (!dateTimeString) return "Never"
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }
    return new Date(dateTimeString).toLocaleDateString(undefined, options)
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "super-admin":
        return "bg-purple-100 text-purple-800 hover:bg-purple-100"
      case "school":
        return "bg-blue-100 text-blue-800 hover:bg-blue-100"
      case "eca":
        return "bg-green-100 text-green-800 hover:bg-green-100"
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-100"
    }
  }

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case "super-admin":
        return "Super Administrator"
      case "school":
        return "School Administrator"
      case "eca":
        return "ECA Coordinator"
      default:
        return role
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-6 px-4 md:px-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p>Loading profile...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !user) {
    return (
      <div className="container mx-auto py-6 px-4 md:px-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error || "Failed to load profile data. Please refresh the page."}
            <Button variant="outline" size="sm" className="ml-4" onClick={fetchProfile}>
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 px-4 md:px-6">
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold">Settings & Profile</h1>
            <p className="text-gray-600 mt-1">Manage your account settings and preferences</p>
          </div>
          <Button
            onClick={() => (isEditing ? handleProfileUpdate() : setIsEditing(true))}
            disabled={isSaving}
            className={isEditing ? "bg-green-600 hover:bg-green-700" : ""}
          >
            {isSaving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Saving...
              </>
            ) : isEditing ? (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </>
            ) : (
              <>
                <Edit2 className="mr-2 h-4 w-4" />
                Edit Profile
              </>
            )}
          </Button>
        </div>

        {/* Profile Header Card */}
        <Card className="overflow-hidden">
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 h-32"></div>
          <CardContent className="relative pt-0 pb-6">
            <div className="flex flex-col md:flex-row gap-6 items-center md:items-start -mt-16">
              <div className="relative">
                <Avatar className="h-32 w-32 border-4 border-white shadow-lg">
                  <AvatarImage src={user.avatar || "/placeholder.svg?height=128&width=128"} alt={user.name} />
                  <AvatarFallback className="text-2xl">{user.name?.charAt(0)?.toUpperCase()}</AvatarFallback>
                </Avatar>
                {isEditing && (
                  <label className="absolute bottom-0 right-0 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-2 cursor-pointer shadow-lg">
                    <Camera className="h-4 w-4" />
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) handleAvatarUpload(file)
                      }}
                    />
                  </label>
                )}
              </div>

              <div className="text-center md:text-left mt-4 md:mt-16">
                <h2 className="text-2xl font-bold">{user.name}</h2>
                <p className="text-gray-600 flex items-center justify-center md:justify-start mt-1">
                  <Mail className="h-4 w-4 mr-2" />
                  {user.email}
                </p>
                <div className="flex flex-wrap gap-2 mt-3 justify-center md:justify-start">
                  <Badge variant="secondary" className={getRoleBadgeColor(user.role)}>
                    <Shield className="h-3 w-3 mr-1" />
                    {getRoleDisplayName(user.role)}
                  </Badge>
                  <Badge
                    variant="secondary"
                    className={user.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}
                  >
                    <UserCheck className="h-3 w-3 mr-1" />
                    {user.isActive ? "Active" : "Inactive"}
                  </Badge>
                  {user.schoolName && (
                    <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                      <Building className="h-3 w-3 mr-1" />
                      {user.schoolName}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Lock className="h-4 w-4" />
              Security
            </TabsTrigger>
            <TabsTrigger value="preferences" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Preferences
            </TabsTrigger>
            <TabsTrigger value="activity" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Activity
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                  <CardDescription>Your basic personal details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    {isEditing ? (
                      <Input
                        id="name"
                        value={user.name || ""}
                        onChange={(e) => setUser({ ...user, name: e.target.value })}
                      />
                    ) : (
                      <p className="text-sm text-gray-700">{user.name}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <div className="flex items-center">
                      <Mail className="h-4 w-4 mr-2 text-gray-500" />
                      <span className="text-sm">{user.email}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Role</Label>
                    <div className="flex items-center">
                      <Shield className="h-4 w-4 mr-2 text-gray-500" />
                      <span className="text-sm">{getRoleDisplayName(user.role)}</span>
                    </div>
                  </div>

                  {user.schoolName && (
                    <div className="space-y-2">
                      <Label>School</Label>
                      <div className="flex items-center">
                        <Building className="h-4 w-4 mr-2 text-gray-500" />
                        <span className="text-sm">{user.schoolName}</span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Account Information</CardTitle>
                  <CardDescription>Your account details and status</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Account Status</Label>
                    <div className="flex items-center">
                      <UserCheck className="h-4 w-4 mr-2 text-gray-500" />
                      <Badge
                        variant="secondary"
                        className={user.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}
                      >
                        {user.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Member Since</Label>
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                      <span className="text-sm">{formatDate(user.createdAt)}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Last Login</Label>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-2 text-gray-500" />
                      <span className="text-sm">{formatDateTime(user.lastLogin)}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Last Updated</Label>
                    <div className="flex items-center">
                      <Activity className="h-4 w-4 mr-2 text-gray-500" />
                      <span className="text-sm">{formatDateTime(user.updatedAt)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle>Change Password</CardTitle>
                <CardDescription>Update your account password</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <div className="relative">
                    <Input
                      id="currentPassword"
                      type={showPassword ? "text" : "password"}
                      value={passwordData.currentPassword}
                      onChange={(e) =>
                        setPasswordData({
                          ...passwordData,
                          currentPassword: e.target.value,
                        })
                      }
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        newPassword: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        confirmPassword: e.target.value,
                      })
                    }
                  />
                </div>

                <Button onClick={handlePasswordChange} className="w-full">
                  <Lock className="mr-2 h-4 w-4" />
                  Change Password
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Preferences Tab */}
          <TabsContent value="preferences">
            <Card>
              <CardHeader>
                <CardTitle>Preferences</CardTitle>
                <CardDescription>Customize your experience</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="language">Language</Label>
                    <Select defaultValue="en">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="es">Spanish</SelectItem>
                        <SelectItem value="fr">French</SelectItem>
                        <SelectItem value="de">German</SelectItem>
                        <SelectItem value="ar">Arabic</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="timezone">Timezone</Label>
                    <Select defaultValue="UTC">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="UTC-8">UTC-8 (Pacific Time)</SelectItem>
                        <SelectItem value="UTC-7">UTC-7 (Mountain Time)</SelectItem>
                        <SelectItem value="UTC-6">UTC-6 (Central Time)</SelectItem>
                        <SelectItem value="UTC-5">UTC-5 (Eastern Time)</SelectItem>
                        <SelectItem value="UTC">UTC (GMT)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">Notification Preferences</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Email Notifications</p>
                        <p className="text-sm text-gray-500">Receive notifications via email</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Push Notifications</p>
                        <p className="text-sm text-gray-500">Receive push notifications in browser</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">System Updates</p>
                        <p className="text-sm text-gray-500">Receive system updates and announcements</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Activity Tab */}
          <TabsContent value="activity">
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Your recent account activity</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Last Login</p>
                    <p className="text-sm text-gray-500">{formatDateTime(user.lastLogin)}</p>
                  </div>
                  <Clock className="h-5 w-5 text-gray-400" />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Account Created</p>
                    <p className="text-sm text-gray-500">{formatDateTime(user.createdAt)}</p>
                  </div>
                  <Calendar className="h-5 w-5 text-gray-400" />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Last Updated</p>
                    <p className="text-sm text-gray-500">{formatDateTime(user.updatedAt)}</p>
                  </div>
                  <Activity className="h-5 w-5 text-gray-400" />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
