"use client"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Info, Users, Calendar, Edit, Trash, CheckCircle, XCircle } from "lucide-react"
import Image from "next/image"
import type { Club } from "./types"
import { cn } from "@/lib/utils"

interface ClubExplorerGridProps {
  clubs: Club[]
  onViewDetails: (club: Club) => void
  onRegister: (club: Club) => void
  onUnregister: (club: Club) => void
  userRole: string
  theme: any
  viewMode: "grid" | "list"
  showAdminActions?: boolean
  onEdit?: (club: Club) => void
  onDelete?: (club: Club) => void
  onViewRegistrations?: (club: Club) => void
  onManageActivities?: (club: Club) => void
}

export function ClubExplorerGrid({
  clubs,
  onViewDetails,
  onRegister,
  onUnregister,
  userRole,
  theme,
  viewMode,
  showAdminActions = false,
  onEdit,
  onDelete,
  onViewRegistrations,
  onManageActivities,
}: ClubExplorerGridProps) {
  const isAdmin = userRole === "super-admin"
  const isSchoolAdmin = userRole === "school"

  const getStatusColor = (status: string | undefined) => {
    switch (status) {
      case "Open":
        return "bg-green-100 text-green-800 hover:bg-green-200"
      case "Closed":
        return "bg-red-100 text-red-800 hover:bg-red-200"
      case "Coming Soon":
        return "bg-blue-100 text-blue-800 hover:bg-blue-200"
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-200"
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Sports":
        return "bg-orange-100 text-orange-800 hover:bg-orange-200"
      case "Academic":
        return "bg-blue-100 text-blue-800 hover:bg-blue-200"
      case "Arts":
        return "bg-purple-100 text-purple-800 hover:bg-purple-200"
      case "Music":
        return "bg-indigo-100 text-indigo-800 hover:bg-indigo-200"
      case "Technology":
        return "bg-cyan-100 text-cyan-800 hover:bg-cyan-200"
      case "Eco":
        return "bg-green-100 text-green-800 hover:bg-green-200"
      case "Heritage":
        return "bg-amber-100 text-amber-800 hover:bg-amber-200"
      case "Drama":
        return "bg-pink-100 text-pink-800 hover:bg-pink-200"
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-200"
    }
  }

  if (clubs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center bg-gray-50 rounded-lg border border-dashed border-gray-300">
        <XCircle className="h-12 w-12 text-gray-400 mb-3" />
        <h3 className="text-lg font-medium text-gray-900">No clubs found</h3>
        <p className="text-gray-500 mt-1">Try adjusting your search or filter criteria.</p>
      </div>
    )
  }

  return (
    <div
      className={
        viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "flex flex-col space-y-4"
      }
    >
      {clubs.map((club) => (
        <Card
          key={club.id}
          className={cn("overflow-hidden transition-all hover:shadow-md", viewMode === "list" && "flex flex-row")}
        >
          <div className={cn("relative h-48 bg-gray-100", viewMode === "list" && "w-1/4 h-auto min-h-full")}>
            {club.logo ? (
              <Image
                src={club.logo || "/placeholder.svg"}
                alt={club.name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-200">
                <span className="text-gray-400 text-lg font-medium">{club.name.substring(0, 2).toUpperCase()}</span>
              </div>
            )}
            <div className="absolute top-2 right-2">
              <Badge className={getStatusColor(club.status)}>{club.status}</Badge>
            </div>
          </div>

          <div className={cn("flex-1", viewMode === "list" && "flex flex-col")}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="line-clamp-1">{club.name}</CardTitle>
                  <CardDescription className="flex items-center mt-1">
                    <Badge variant="outline" className="mr-2">
                      {club.leadTeacher}
                    </Badge>
                    <Badge className={getCategoryColor(club.category)}>{club.category}</Badge>
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent>
              <p className={cn("text-gray-600 line-clamp-3", viewMode === "list" && "line-clamp-2")}>
                {club.description}
              </p>

              <div className="flex items-center mt-4 text-sm text-gray-500">
                <div className="flex items-center mr-4">
                  <Users className="h-4 w-4 mr-1" />
                  <span>{club.registeredSchools || 0} schools</span>
                </div>
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  <span>{club.totalActivities || 0} activities</span>
                </div>
              </div>
            </CardContent>

            <CardFooter className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={() => onViewDetails(club)}>
                <Info className="h-4 w-4 mr-1" />
                Details
              </Button>

              {/* Only show register/unregister buttons for non-admin users */}
              {!isAdmin &&
                club.status === "Open" &&
                (club.isRegistered ? (
                  <Button variant="destructive" size="sm" onClick={() => onUnregister(club)}>
                    <XCircle className="h-4 w-4 mr-1" />
                    Unregister
                  </Button>
                ) : (
                  <Button variant="default" size="sm" onClick={() => onRegister(club)}>
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Register
                  </Button>
                ))}

              {showAdminActions && (
                <>
                  {onEdit && (
                    <Button variant="outline" size="sm" onClick={() => onEdit(club)}>
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                  )}
                  {onManageActivities && (
                    <Button variant="outline" size="sm" onClick={() => onManageActivities(club)}>
                      <Calendar className="h-4 w-4 mr-1" />
                      Activities
                    </Button>
                  )}
                  {onViewRegistrations && (
                    <Button variant="outline" size="sm" onClick={() => onViewRegistrations(club)}>
                      <Users className="h-4 w-4 mr-1" />
                      Registrations
                    </Button>
                  )}
                  {onDelete && (
                    <Button variant="outline" size="sm" className="text-red-500" onClick={() => onDelete(club)}>
                      <Trash className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                  )}
                </>
              )}
            </CardFooter>
          </div>
        </Card>
      ))}
    </div>
  )
}
