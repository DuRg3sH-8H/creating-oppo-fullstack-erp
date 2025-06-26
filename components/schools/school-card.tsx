"use client"

import { motion } from "framer-motion"
import { Award, Edit, Eye, Globe, Mail, MapPin, Phone, Trash, Power, PowerOff } from "lucide-react"
import type { School } from "@/components/schools/types"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ThemePreview } from "@/components/schools/theme-preview"
import Image from "next/image"

interface SchoolCardProps {
  school: School
  onEdit: (school: School) => void
  onDelete: (id: string) => void
  onToggleStatus: (id: string) => void
  // onPreviewTheme: (school: School) => void
}

export function SchoolCard({ school, onEdit, onDelete, onToggleStatus }: SchoolCardProps) {
  // Check if school is ISO certified (for demo purposes)
  const isISOCertified = school.id === "1" // Only Greenfield is certified in our demo

  return (
    <motion.div
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      className={`bg-white rounded-xl shadow-sm border overflow-hidden ${
        school.isActive ? "border-gray-100" : "border-red-200 bg-red-50/30"
      }`}
    >
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center">
            <div className="relative h-16 w-16 rounded-lg overflow-hidden border border-gray-200 bg-gray-50 mr-4">
              <Image
                src={school.logo || "/placeholder.svg"}
                alt={`${school.name} logo`}
                fill
                className="object-contain p-2"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold text-[var(--accent-color)]">{school.name}</h3>
                <Badge variant={school.isActive ? "default" : "destructive"} className="text-xs">
                  {school.isActive ? "Active" : "Inactive"}
                </Badge>
                {isISOCertified && (
                  <div className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-xs font-medium flex items-center">
                    <Award className="h-3 w-3 mr-1" />
                    ISO 21001
                  </div>
                )}
              </div>
              {school.established && <p className="text-sm text-gray-500">Est. {school.established}</p>}
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500">
                <span className="sr-only">Open menu</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-4 w-4"
                >
                  <circle cx="12" cy="12" r="1" />
                  <circle cx="12" cy="5" r="1" />
                  <circle cx="12" cy="19" r="1" />
                </svg>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(school)}>
                <Edit className="mr-2 h-4 w-4" />
                <span>Edit</span>
              </DropdownMenuItem>
              {/* <DropdownMenuItem onClick={() => onPreviewTheme(school)}>
                <Eye className="mr-2 h-4 w-4" />
                <span>Preview Theme</span>
              </DropdownMenuItem> */}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onToggleStatus(school.id)}>
                {school.isActive ? (
                  <>
                    <PowerOff className="mr-2 h-4 w-4" />
                    <span>Deactivate</span>
                  </>
                ) : (
                  <>
                    <Power className="mr-2 h-4 w-4" />
                    <span>Activate</span>
                  </>
                )}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  if (
                    confirm("Are you sure you want to permanently delete this school? This action cannot be undone.")
                  ) {
                    onDelete(school.id)
                  }
                }}
                className="text-red-600"
              >
                <Trash className="mr-2 h-4 w-4" />
                <span>Delete Permanently</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="mb-4">
          <h4 className="text-sm font-medium text-[var(--accent-color)] mb-2">Theme Colors</h4>
          <ThemePreview
            primaryColor={school.primaryColor}
            secondaryColor={school.secondaryColor}
            accentColor={school.accentColor}
            darkColor={school.darkColor}
          />
        </div>

        <div className="space-y-2 text-sm">
          {school.address && (
            <div className="flex items-start">
              <MapPin className="h-4 w-4 text-[var(--primary-color)] mt-0.5 mr-2" />
              <span className="text-gray-600">{school.address}</span>
            </div>
          )}
          {school.email && (
            <div className="flex items-center">
              <Mail className="h-4 w-4 text-[var(--primary-color)] mr-2" />
              <span className="text-gray-600">{school.email}</span>
            </div>
          )}
          {school.phone && (
            <div className="flex items-center">
              <Phone className="h-4 w-4 text-[var(--primary-color)] mr-2" />
              <span className="text-gray-600">{school.phone}</span>
            </div>
          )}
          {school.website && (
            <div className="flex items-center">
              <Globe className="h-4 w-4 text-[var(--primary-color)] mr-2" />
              <span className="text-gray-600">{school.website}</span>
            </div>
          )}
        </div>
      </div>

      <div className="border-t border-gray-100 p-4 bg-gray-50 flex justify-between">
        {/* <Button
          variant="outline"
          size="sm"
          onClick={() => onPreviewTheme(school)}
          className="text-[var(--primary-color)] border-[var(--primary-color)]/30 hover:bg-[var(--primary-color)]/10"
        >
          <Eye className="h-4 w-4 mr-2" />
          Preview Theme
        </Button> */}

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onToggleStatus(school.id)}
            className={
              school.isActive
                ? "text-red-600 border-red-300 hover:bg-red-50"
                : "text-green-600 border-green-300 hover:bg-green-50"
            }
          >
            {school.isActive ? (
              <>
                <PowerOff className="h-4 w-4 mr-2" />
                Deactivate
              </>
            ) : (
              <>
                <Power className="h-4 w-4 mr-2" />
                Activate
              </>
            )}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(school)}
            className="text-[var(--primary-color)] border-[var(--primary-color)]/30 hover:bg-[var(--primary-color)]/10"
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
        </div>
      </div>
    </motion.div>
  )
}
