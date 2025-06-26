"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, Users, MapPin, Clock, FileText, ImageIcon, UserCheck, Loader2 } from "lucide-react"
import type { Club } from "./types"
import { fetchClubRegistrations } from "@/lib/api/clubs"

interface ClubDetailModalProps {
  club: Club
  isOpen: boolean
  onClose: () => void
  onRegister: () => void
}

export function ClubDetailModal({ club, isOpen, onClose, onRegister }: ClubDetailModalProps) {
  const [registrations, setRegistrations] = useState(club.registrations || [])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen && club.id) {
      loadRegistrations()
    }
  }, [isOpen, club.id])

  const loadRegistrations = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetchClubRegistrations(club.id)
      if (response.success) {
        setRegistrations(response.data)
      }
    } catch (err) {
      setError("Failed to load registrations")
      console.error("Error loading registrations:", err)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status?: string) => {
    switch (status) {
      case "Open":
        return "bg-green-100 text-green-800 border-green-200"
      case "Closed":
        return "bg-red-100 text-red-800 border-red-200"
      case "Coming Soon":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getCategoryColor = (category: string) => {
    const colors = {
      Eco: "bg-green-100 text-green-700",
      Heritage: "bg-purple-100 text-purple-700",
      Drama: "bg-pink-100 text-pink-700",
      Sports: "bg-blue-100 text-blue-700",
      Academic: "bg-indigo-100 text-indigo-700",
      Technology: "bg-cyan-100 text-cyan-700",
      Arts: "bg-orange-100 text-orange-700",
      Music: "bg-violet-100 text-violet-700",
      Other: "bg-gray-100 text-gray-700",
    }
    return colors[category as keyof typeof colors] || colors.Other
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white">
        <DialogHeader>
          <div className="flex items-center space-x-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={club.logo || "/placeholder.svg"} alt={club.name} />
              <AvatarFallback className="bg-blue-100 text-blue-600 font-semibold text-xl">
                {club.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <DialogTitle className="text-2xl">{club.name}</DialogTitle>
              <p className="text-gray-600 mt-1">Led by {club.leadTeacher}</p>
              <div className="flex items-center gap-2 mt-2">
                <Badge className={getCategoryColor(club.category)}>{club.category}</Badge>
                {club.status && (
                  <Badge variant="outline" className={getStatusColor(club.status)}>
                    {club.status}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="mt-6">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="activities">Activities ({club.activities?.length || 0})</TabsTrigger>
              <TabsTrigger value="schools">Schools ({registrations.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-6">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3">About This Club</h3>
                  <p className="text-gray-700 leading-relaxed">{club.description}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="p-4 text-center">
                      <Calendar className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                      <div className="text-2xl font-bold">{club.activities?.length || 0}</div>
                      <div className="text-sm text-gray-600">Total Activities</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <Users className="h-8 w-8 mx-auto mb-2 text-green-600" />
                      <div className="text-2xl font-bold">{registrations.length}</div>
                      <div className="text-sm text-gray-600">Registered Schools</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <MapPin className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                      <div className="text-2xl font-bold">{club.category}</div>
                      <div className="text-sm text-gray-600">Category</div>
                    </CardContent>
                  </Card>
                </div>

                {club.status === "Open" && !club.isRegistered && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-blue-900">Ready to Join?</h4>
                        <p className="text-blue-700 text-sm">
                          Register your school for this club and start participating in activities.
                        </p>
                      </div>
                      <Button onClick={onRegister} className="flex items-center gap-2">
                        <UserCheck size={16} />
                        Register Now
                      </Button>
                    </div>
                  </div>
                )}

                {club.isRegistered && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center gap-2">
                      <UserCheck className="h-5 w-5 text-green-600" />
                      <span className="font-semibold text-green-900">You're registered for this club!</span>
                    </div>
                    <p className="text-green-700 text-sm mt-1">
                      You'll receive notifications about upcoming activities and events.
                    </p>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="activities" className="mt-6">
              <div className="space-y-4">
                {!club.activities || club.activities.length === 0 ? (
                  <div className="text-center py-8">
                    <Calendar className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No activities yet</h3>
                    <p className="text-gray-500">Activities will be posted here when they become available.</p>
                  </div>
                ) : (
                  club.activities.map((activity) => (
                    <Card key={activity.id}>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-lg">{activity.title}</CardTitle>
                            <div className="flex items-center gap-2 mt-2 text-sm text-gray-600">
                              <Clock size={14} />
                              {formatDate(activity.date)}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            {activity.images && activity.images.length > 0 && (
                              <Badge variant="outline" className="flex items-center gap-1">
                                <ImageIcon size={12} />
                                {activity.images.length} photo{activity.images.length > 1 ? "s" : ""}
                              </Badge>
                            )}
                            {activity.minutesUrl && (
                              <Badge variant="outline" className="flex items-center gap-1">
                                <FileText size={12} />
                                Minutes
                              </Badge>
                            )}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-700 mb-4">{activity.description}</p>
                        {activity.images && activity.images.length > 0 && (
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-4">
                            {activity.images.map((image, index) => (
                              <img
                                key={index}
                                src={image || "/placeholder.svg"}
                                alt={`${activity.title} - Image ${index + 1}`}
                                className="w-full h-24 object-cover rounded-lg"
                              />
                            ))}
                          </div>
                        )}
                        {activity.minutesUrl && (
                          <Button variant="outline" size="sm" asChild>
                            <a href={activity.minutesUrl} target="_blank" rel="noopener noreferrer">
                              <FileText size={14} className="mr-2" />
                              View Minutes
                            </a>
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>

            <TabsContent value="schools" className="mt-6">
              <div className="space-y-4">
                {loading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                ) : error ? (
                  <div className="text-center py-8">
                    <p className="text-red-600">{error}</p>
                  </div>
                ) : registrations.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No schools registered yet</h3>
                    <p className="text-gray-500">Be the first school to register for this club!</p>
                  </div>
                ) : (
                  registrations.map((registration) => (
                    <Card key={registration.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-4">
                          <Avatar className="h-12 w-12">
                            <AvatarImage
                              src={registration.schoolLogo || "/placeholder.svg"}
                              alt={registration.schoolName}
                            />
                            <AvatarFallback className="bg-blue-100 text-blue-600 font-semibold">
                              {registration.schoolName.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <h4 className="font-semibold">{registration.schoolName}</h4>
                            <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                              <span className="flex items-center gap-1">
                                <Users size={14} />
                                {registration.participantCount} participants
                              </span>
                              <span className="flex items-center gap-1">
                                <Calendar size={14} />
                                Registered {formatDate(registration.registrationDate)}
                              </span>
                            </div>
                            {registration.notes && (
                              <p className="text-sm text-gray-600 mt-2 italic">"{registration.notes}"</p>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  )
}
