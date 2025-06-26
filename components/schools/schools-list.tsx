"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import type { School } from "@/components/schools/types"
import { SchoolCard } from "@/components/schools/school-card"
import { SchoolTable } from "@/components/schools/school-table"
import { Button } from "@/components/ui/button"
import { LayoutGrid, List } from "lucide-react"

interface SchoolsListProps {
  schools: School[]
  onEdit: (school: School) => void
  onDelete: (id: string) => void
  onToggleStatus: (id: string) => void
  onPreviewTheme: (school: School) => void
}

export function SchoolsList({ schools, onEdit, onDelete, onToggleStatus, onPreviewTheme }: SchoolsListProps) {
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid")

  return (
    <div>
      <div className="flex justify-end mb-4">
        <div className="bg-white rounded-lg border border-gray-200 p-1 flex">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setViewMode("grid")}
            className={
              viewMode === "grid" ? "bg-[var(--primary-color)]/10 text-[var(--primary-color)]" : "text-gray-500"
            }
          >
            <LayoutGrid className="h-4 w-4 mr-1" />
            Grid
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setViewMode("table")}
            className={
              viewMode === "table" ? "bg-[var(--primary-color)]/10 text-[var(--primary-color)]" : "text-gray-500"
            }
          >
            <List className="h-4 w-4 mr-1" />
            Table
          </Button>
        </div>
      </div>

      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {schools.map((school, index) => (
            <motion.div
              key={school.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              <SchoolCard
                school={school}
                onEdit={onEdit}
                onDelete={onDelete}
                onToggleStatus={onToggleStatus}
               
              />
            </motion.div>
          ))}
        </div>
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
          <SchoolTable
            schools={schools}
            onEdit={onEdit}
            onDelete={onDelete}
            onToggleStatus={onToggleStatus}
            onPreviewTheme={onPreviewTheme}
          />
        </motion.div>
      )}
    </div>
  )
}
