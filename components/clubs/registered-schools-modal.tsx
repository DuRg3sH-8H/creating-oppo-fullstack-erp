"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Users, Calendar, RefreshCw, Mail, AlertCircle } from "lucide-react"
import type { Club } from "./types"
import { fetchClubRegistrations } from "@/lib/api/clubs"

interface RegisteredSchoolsModalProps {
  club: Club
  isOpen: boolean
  onClose: () => void
}

export function RegisteredSchoolsModal({ club, isOpen, onClose }: RegisteredSchoolsModalProps) {
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [registrations, setRegistrations] = useState(club.registrations || [])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load registrations when modal opens
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
        setRegistrations(response.data || [])
      } else {
        setError(response.error || "Failed to load registrations")
      }
    } catch (err) {
      setError("Failed to load registrations")
      console.error("Error loading registrations:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await loadRegistrations()
    setIsRefreshing(false)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Avatar className="h-12 w-12">
                <AvatarImage src={club.logo || "/placeholder.svg"} alt={club.name} />
                <AvatarFallback className="bg-blue-100 text-blue-600 font-semibold">
                  {club.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div>
                <DialogTitle className="text-xl">{club.name} - Registered Schools</DialogTitle>
                <div className="flex items-center gap-2 mt-1">
                  <Badge className={getCategoryColor(club.category)}>{club.category}</Badge>
                  <span className="text-sm text-gray-600">{registrations?.length || 0} schools registered</span>
                </div>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isRefreshing || loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
        </DialogHeader>

        <div className="mt-6">
          {/* Club Summary */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-600">{registrations?.length || 0}</div>
                <div className="text-sm text-gray-600">Registered Schools</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {registrations?.reduce((sum, reg) => sum + (reg.participantCount || 0), 0) || 0}
                </div>
                <div className="text-sm text-gray-600">Total Participants</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600">{club.totalActivities || 0}</div>
                <div className="text-sm text-gray-600">Club Activities</div>
              </div>
            </div>
          </div>

          {/* Error State */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-2 text-red-700">
                <AlertCircle className="h-5 w-5" />
                <span className="font-medium">Error loading registrations</span>
              </div>
              <p className="text-red-600 mt-1">{error}</p>
              <Button variant="outline" size="sm" onClick={loadRegistrations} className="mt-2">
                Try Again
              </Button>
            </div>
          )}

          {/* Registered Schools List */}
          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-12">
                <RefreshCw className="h-12 w-12 mx-auto text-gray-400 mb-4 animate-spin" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Loading registrations...</h3>
                <p className="text-gray-500">Please wait while we fetch the registered schools.</p>
              </div>
            ) : !registrations || registrations.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No schools registered yet</h3>
                <p className="text-gray-500">Schools will appear here when they register for this club.</p>
              </div>
            ) : (
              registrations.map((registration, index) => (
                <Card key={registration.id || index} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0">
                        <Avatar className="h-12 w-12">
                          <AvatarImage
                            src={registration.schoolLogo || "/placeholder.svg"}
                            alt={registration.schoolName}
                          />
                          <AvatarFallback className="bg-blue-100 text-blue-600 font-semibold">
                            {registration.schoolName?.charAt(0) || "S"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="text-center mt-2">
                          <Badge variant="outline" className="text-xs">
                            #{index + 1}
                          </Badge>
                        </div>
                      </div>

                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="text-lg font-semibold text-gray-900">{registration.schoolName}</h4>
                            <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                              <span className="flex items-center gap-1">
                                <Users size={14} />
                                {registration.participantCount || 0} participants
                              </span>
                              {registration.registrationDate && (
                                <span className="flex items-center gap-1">
                                  <Calendar size={14} />
                                  Registered {formatDate(registration.registrationDate)}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {registration.notes && (
                          <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                            <p className="text-sm text-gray-700 italic">"{registration.notes}"</p>
                          </div>
                        )}

                        
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
