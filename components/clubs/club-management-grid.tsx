"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreVertical, Users, Calendar, Edit, Trash2, Eye, Settings } from "lucide-react"
import type { Club } from "./types"

interface ClubManagementGridProps {
  clubs: Club[]
  onEdit: (club: Club) => void
  onDelete: (club: Club) => void
  onViewRegistrations: (club: Club) => void
  onManageActivities: (club: Club) => void
}

export function ClubManagementGrid({
  clubs,
  onEdit,
  onDelete,
  onViewRegistrations,
  onManageActivities,
}: ClubManagementGridProps) {
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

  if (clubs.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 mb-4">
          <Settings size={48} className="mx-auto" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No clubs to manage</h3>
        <p className="text-gray-500">Create your first club to get started.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
      {clubs.map((club) => (
        <Card key={club.id} className="hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={club.logo || "/placeholder.svg"} alt={club.name} />
                  <AvatarFallback className="bg-blue-100 text-blue-600 font-semibold">
                    {club.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-lg">{club.name}</CardTitle>
                  <p className="text-sm text-gray-600">{club.leadTeacher}</p>
                </div>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreVertical size={16} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onEdit(club)}>
                    <Edit size={16} className="mr-2" />
                    Edit Club
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onManageActivities(club)}>
                    <Settings size={16} className="mr-2" />
                    Manage Activities
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onViewRegistrations(club)}>
                    <Eye size={16} className="mr-2" />
                    View Registrations ({club.registrations?.length || 0})
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onDelete(club)} className="text-red-600 focus:text-red-600">
                    <Trash2 size={16} className="mr-2" />
                    Delete Club
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="flex items-center gap-2 mt-3">
              <Badge className={getCategoryColor(club.category)}>{club.category}</Badge>
              {club.status && (
                <Badge variant="outline" className={getStatusColor(club.status)}>
                  {club.status}
                </Badge>
              )}
            </div>
          </CardHeader>

          <CardContent className="pt-0">
            <p className="text-gray-600 text-sm mb-4 line-clamp-2">{club.description}</p>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-center gap-1 text-sm text-gray-600 mb-1">
                  <Calendar size={14} />
                  Activities
                </div>
                <div className="text-lg font-semibold">{club.activities?.length || 0}</div>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-center gap-1 text-sm text-gray-600 mb-1">
                  <Users size={14} />
                  Schools
                </div>
                <div className="text-lg font-semibold">{club.registrations?.length || 0}</div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="flex-1" onClick={() => onEdit(club)}>
                <Edit size={14} className="mr-1" />
                Edit
              </Button>
              <Button variant="outline" size="sm" className="flex-1" onClick={() => onManageActivities(club)}>
                <Settings size={14} className="mr-1" />
                Activities
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
