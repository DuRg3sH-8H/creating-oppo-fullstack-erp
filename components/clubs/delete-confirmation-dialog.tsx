"use client"

import { useState } from "react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { AlertTriangle, Users, Calendar } from "lucide-react"
import type { Club } from "./types"

interface DeleteConfirmationDialogProps {
  club: Club
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
}

export function DeleteConfirmationDialog({ club, isOpen, onClose, onConfirm }: DeleteConfirmationDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false)

  const handleConfirm = async () => {
    setIsDeleting(true)
    try {
      await onConfirm()
    } finally {
      setIsDeleting(false)
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

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <AlertDialogTitle className="text-left">Delete Club</AlertDialogTitle>
          </div>
          <AlertDialogDescription asChild>
            <div className="space-y-4">
              <p>Are you sure you want to delete this club? This action cannot be undone.</p>

              {/* Club Info */}
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={club.logo || "/placeholder.svg"} alt={club.name} />
                    <AvatarFallback className="bg-blue-100 text-blue-600 font-semibold">
                      {club.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">{club.name}</h4>
                    <p className="text-sm text-gray-600">{club.leadTeacher}</p>
                    <Badge className={`${getCategoryColor(club.category)} mt-1 text-xs px-2 py-0.5`}>
                      {club.category}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Impact Warning */}
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <h4 className="font-semibold text-red-900 mb-2">This will permanently delete:</h4>
                <ul className="text-red-700 text-sm space-y-1">
                  <li className="flex items-center gap-2">
                    <Calendar size={14} />
                    {club.totalActivities} activities and their data
                  </li>
                  <li className="flex items-center gap-2">
                    <Users size={14} />
                    {club.registrations?.length || 0} school registrations
                  </li>
                  <li>• All club history and content</li>
                  <li>• Associated files and images</li>
                </ul>
              </div>

              {(club.registrations?.length || 0) > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                  <p className="text-amber-800 text-sm font-medium">
                    ⚠️ Warning: {club.registrations?.length} schools are currently registered for this club. They will
                    lose access to all club content.
                  </p>
                </div>
              )}
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={isDeleting}
            className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
          >
            {isDeleting ? "Deleting..." : "Delete Club"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
