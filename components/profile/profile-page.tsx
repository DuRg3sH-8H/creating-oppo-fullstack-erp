"use client"

import type React from "react"

import { useState } from "react"
import { useRole } from "@/components/role-context"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Edit2, Save, Mail, Phone, MapPin, Calendar, Briefcase, User, Shield, Clock } from "lucide-react"

export function ProfilePage() {
  const { userRole: userRole } = useRole()
  const [isEditing, setIsEditing] = useState(false)

  // Mock user data - in a real app, this would come from an API or context
  const [userData, setUserData] = useState({
    name: "Alex Johnson",
    email: "alex.johnson@example.com",
    role: userRole,
    phone: "+1 (555) 123-4567",
    address: "123 School Lane, Education City, EC 12345",
    bio: "Experienced education administrator with a passion for improving school systems and student outcomes.",
    position:
      userRole === "super-admin"
        ? "System Administrator"
        : userRole === "school"
          ? "School Principal"
          : "ECA Coordinator",
    department:
      userRole === "super-admin"
        ? "IT Administration"
        : userRole === "school"
          ? "School Management"
          : "Extracurricular Activities",
    joinDate: "2022-01-15",
    lastActive: "2023-05-14T09:32:45",
    status: "active",
    timezone: "UTC-5 (Eastern Time)",
    language: "English",
    notifications: {
      email: true,
      push: true,
      sms: false,
    },
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setUserData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSave = () => {
    // In a real app, this would save to an API
    setIsEditing(false)
  }

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: "numeric", month: "long", day: "numeric" }
    return new Date(dateString).toLocaleDateString(undefined, options)
  }

  const formatDateTime = (dateTimeString: string) => {
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

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 hover:bg-green-100"
      case "inactive":
        return "bg-red-100 text-red-800 hover:bg-red-100"
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-100"
    }
  }

  return (
    <main className="flex-1 overflow-y-auto p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <h1 className="text-2xl font-bold">My Profile</h1>
          <Button
            onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
            className={isEditing ? "bg-green-600 hover:bg-green-700" : ""}
          >
            {isEditing ? (
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

        <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6">
          <div className="p-6 flex flex-col md:flex-row gap-6 items-center md:items-start border-b border-gray-200">
            <div className="relative">
              <Avatar className="h-24 w-24">
                <AvatarImage src="/placeholder.svg?height=96&width=96" alt={userData.name} />
                <AvatarFallback>
                  {userData.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              {isEditing && (
                <Button size="sm" className="absolute bottom-0 right-0 h-8 w-8 rounded-full p-0">
                  <Edit2 className="h-4 w-4" />
                </Button>
              )}
            </div>

            <div className="text-center md:text-left">
              <h2 className="text-xl font-bold">{userData.name}</h2>
              <p className="text-gray-500 flex items-center justify-center md:justify-start mt-1">
                <Mail className="h-4 w-4 mr-2" />
                {userData.email}
              </p>
              <div className="flex flex-wrap gap-2 mt-3 justify-center md:justify-start">
                <Badge variant="secondary" className={getRoleBadgeColor(userData.role)}>
                  {userData.role === "super-admin"
                    ? "Super Admin"
                    : userData.role === "school"
                      ? "School Admin"
                      : "ECA Coordinator"}
                </Badge>
                <Badge variant="secondary" className={getStatusBadgeColor(userData.status)}>
                  {userData.status === "active" ? "Active" : "Inactive"}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        <Tabs defaultValue="personal" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="personal">Personal Info</TabsTrigger>
            <TabsTrigger value="contact">Contact Details</TabsTrigger>
            <TabsTrigger value="account">Account Info</TabsTrigger>
          </TabsList>

          <TabsContent value="personal">
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>Your personal details and biography</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  {isEditing ? (
                    <Input id="name" name="name" value={userData.name} onChange={handleInputChange} />
                  ) : (
                    <div className="flex items-center">
                      <User className="h-4 w-4 mr-2 text-gray-500" />
                      <span>{userData.name}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="position">Position</Label>
                  {isEditing ? (
                    <Input id="position" name="position" value={userData.position} onChange={handleInputChange} />
                  ) : (
                    <div className="flex items-center">
                      <Briefcase className="h-4 w-4 mr-2 text-gray-500" />
                      <span>{userData.position}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="department">Department</Label>
                  {isEditing ? (
                    <Input id="department" name="department" value={userData.department} onChange={handleInputChange} />
                  ) : (
                    <div className="flex items-center">
                      <Briefcase className="h-4 w-4 mr-2 text-gray-500" />
                      <span>{userData.department}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Biography</Label>
                  {isEditing ? (
                    <Textarea id="bio" name="bio" value={userData.bio} onChange={handleInputChange} rows={4} />
                  ) : (
                    <p className="text-gray-700">{userData.bio}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="contact">
            <Card>
              <CardHeader>
                <CardTitle>Contact Details</CardTitle>
                <CardDescription>Your contact information and address</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  {isEditing ? (
                    <Input id="email" name="email" type="email" value={userData.email} onChange={handleInputChange} />
                  ) : (
                    <div className="flex items-center">
                      <Mail className="h-4 w-4 mr-2 text-gray-500" />
                      <span>{userData.email}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  {isEditing ? (
                    <Input id="phone" name="phone" value={userData.phone} onChange={handleInputChange} />
                  ) : (
                    <div className="flex items-center">
                      <Phone className="h-4 w-4 mr-2 text-gray-500" />
                      <span>{userData.phone}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  {isEditing ? (
                    <Textarea id="address" name="address" value={userData.address} onChange={handleInputChange} />
                  ) : (
                    <div className="flex items-start">
                      <MapPin className="h-4 w-4 mr-2 mt-0.5 text-gray-500" />
                      <span>{userData.address}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="account">
            <Card>
              <CardHeader>
                <CardTitle>Account Information</CardTitle>
                <CardDescription>Your account details and preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Account Role</Label>
                  <div className="flex items-center">
                    <Shield className="h-4 w-4 mr-2 text-gray-500" />
                    <span className="capitalize">
                      {userData.role === "super-admin"
                        ? "Super Admin"
                        : userData.role === "school"
                          ? "School Admin"
                          : "ECA Coordinator"}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Join Date</Label>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                    <span>{formatDate(userData.joinDate)}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Last Active</Label>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-2 text-gray-500" />
                    <span>{formatDateTime(userData.lastActive)}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="language">Preferred Language</Label>
                  {isEditing ? (
                    <select
                      id="language"
                      name="language"
                      value={userData.language}
                      onChange={(e) => setUserData({ ...userData, language: e.target.value })}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    >
                      <option value="English">English</option>
                      <option value="Spanish">Spanish</option>
                      <option value="French">French</option>
                      <option value="German">German</option>
                      <option value="Arabic">Arabic</option>
                    </select>
                  ) : (
                    <div className="flex items-center">
                      <span>{userData.language}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  {isEditing ? (
                    <select
                      id="timezone"
                      name="timezone"
                      value={userData.timezone}
                      onChange={(e) => setUserData({ ...userData, timezone: e.target.value })}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    >
                      <option value="UTC-8 (Pacific Time)">UTC-8 (Pacific Time)</option>
                      <option value="UTC-7 (Mountain Time)">UTC-7 (Mountain Time)</option>
                      <option value="UTC-6 (Central Time)">UTC-6 (Central Time)</option>
                      <option value="UTC-5 (Eastern Time)">UTC-5 (Eastern Time)</option>
                      <option value="UTC+0 (GMT)">UTC+0 (GMT)</option>
                    </select>
                  ) : (
                    <div className="flex items-center">
                      <span>{userData.timezone}</span>
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={() => {}}>
                  Change Password
                </Button>
                <Button variant="destructive" onClick={() => {}}>
                  Deactivate Account
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  )
}
