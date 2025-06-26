"use client"

import { motion } from "framer-motion"
import { Award, BookOpen, Calendar, FileText, GraduationCap, Settings, Shield, Users } from "lucide-react"

type UserRole = "super-admin" | "school" | "eca"

interface ShortcutSectionProps {
  userRole: UserRole
}

export function ShortcutSection({ userRole }: ShortcutSectionProps) {
  // Define shortcuts based on user role
  const shortcuts = {
    "super-admin": [
      { name: "Manage Schools", icon: GraduationCap, href: "/dashboard/schools" },
      { name: "ISO Management", icon: Shield, href: "/dashboard/iso" },
      { name: "Trainings", icon: BookOpen, href: "/dashboard/trainings" },
      { name: "Clubs & Activities", icon: Award, href: "/dashboard/clubs" },
      { name: "Documents", icon: FileText, href: "/dashboard/documents" },
      { name: "User Management", icon: Users, href: "/dashboard/users" },
      { name: "Calendar", icon: Calendar, href: "/dashboard/calendar" },
      { name: "Settings", icon: Settings, href: "/dashboard/settings" },
    ],
    school: [
      { name: "ISO Management", icon: Shield, href: "/dashboard/iso" },
      { name: "Trainings", icon: BookOpen, href: "/dashboard/trainings" },
      { name: "Clubs & Activities", icon: Award, href: "/dashboard/clubs" },
      { name: "Documents", icon: FileText, href: "/dashboard/documents" },
      { name: "Calendar", icon: Calendar, href: "/dashboard/calendar" },
      { name: "Settings", icon: Settings, href: "/dashboard/settings" },
    ],
    eca: [
      { name: "Trainings", icon: BookOpen, href: "/dashboard/trainings" },
      { name: "Clubs & Activities", icon: Award, href: "/dashboard/clubs" },
      { name: "Calendar", icon: Calendar, href: "/dashboard/calendar" },
      { name: "Settings", icon: Settings, href: "/dashboard/settings" },
    ],
  }

  const items = shortcuts[userRole]

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
      <h2 className="text-lg font-semibold text-[var(--accent-color)] mb-4">Quick Access</h2>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {items.map((item, index) => (
          <motion.a
            key={item.name}
            href={item.href}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            whileHover={{
              scale: 1.05,
              boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
            }}
            className="flex flex-col items-center justify-center p-4 rounded-lg border border-gray-100 bg-white hover:border-[var(--primary-color)]/30 transition-all duration-200"
          >
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center mb-2"
              style={{ backgroundColor: `var(--primary-color)10` }}
            >
              <item.icon className="h-5 w-5 text-[var(--primary-color)]" />
            </div>
            <span className="text-sm text-[var(--accent-color)] text-center font-medium">{item.name}</span>
          </motion.a>
        ))}
      </div>
    </div>
  )
}
