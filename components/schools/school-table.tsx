"use client"

import { Award, Edit, Eye, MoreHorizontal, Trash, Power, PowerOff } from "lucide-react"
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import Image from "next/image"

interface SchoolTableProps {
  schools: School[]
  onEdit: (school: School) => void
  onDelete: (id: string) => void
  onToggleStatus: (id: string) => void
  onPreviewTheme: (school: School) => void
}

export function SchoolTable({ schools, onEdit, onDelete, onToggleStatus, onPreviewTheme }: SchoolTableProps) {
  // Check if school is ISO certified (for demo purposes)
  const isISOCertified = (schoolId: string) => schoolId === "1" // Only Greenfield is certified in our demo

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[250px]">School</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Theme Colors</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {schools.map((school) => (
            <TableRow key={school.id} className={!school.isActive ? "bg-red-50/30" : ""}>
              <TableCell>
                <div className="flex items-center">
                  <div className="relative h-10 w-10 rounded-md overflow-hidden border border-gray-200 bg-gray-50 mr-3">
                    <Image
                      src={school.logo || "/placeholder.svg"}
                      alt={`${school.name} logo`}
                      fill
                      className="object-contain p-1"
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <div className="font-medium text-[var(--accent-color)]">{school.name}</div>
                      {isISOCertified(school.id) && (
                        <div className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-xs font-medium flex items-center">
                          <Award className="h-3 w-3 mr-1" />
                          ISO 21001
                        </div>
                      )}
                    </div>
                    {school.established && <div className="text-xs text-gray-500">Est. {school.established}</div>}
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant={school.isActive ? "default" : "destructive"}>
                  {school.isActive ? "Active" : "Inactive"}
                </Badge>
              </TableCell>
              <TableCell>
                <ThemePreview
                  primaryColor={school.primaryColor}
                  secondaryColor={school.secondaryColor}
                  accentColor={school.accentColor}
                  darkColor={school.darkColor}
                  compact
                />
              </TableCell>
              <TableCell>
                <div className="text-sm">
                  {school.email && <div className="text-gray-600">{school.email}</div>}
                  {school.phone && <div className="text-gray-600">{school.phone}</div>}
                </div>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onPreviewTheme(school)}
                    className="h-8 w-8 text-[var(--primary-color)]"
                    title="Preview Theme"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onToggleStatus(school.id)}
                    className={`h-8 w-8 ${
                      school.isActive ? "text-red-600 hover:bg-red-50" : "text-green-600 hover:bg-green-50"
                    }`}
                    title={school.isActive ? "Deactivate School" : "Activate School"}
                  >
                    {school.isActive ? <PowerOff className="h-4 w-4" /> : <Power className="h-4 w-4" />}
                  </Button>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onEdit(school)}>
                        <Edit className="mr-2 h-4 w-4" />
                        <span>Edit</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onPreviewTheme(school)}>
                        <Eye className="mr-2 h-4 w-4" />
                        <span>Preview Theme</span>
                      </DropdownMenuItem>
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
                            confirm(
                              "Are you sure you want to permanently delete this school? This action cannot be undone.",
                            )
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
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
