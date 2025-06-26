"use client"

import type React from "react"

import { motion } from "framer-motion"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import type { KPIData } from "@/lib/db/dashboard"

interface KpiCardsProps {
  userRole: string
  kpiData?: KPIData[]
}

export function KpiCards({ userRole, kpiData = [] }: KpiCardsProps) {
  const getIcon = (iconName: string) => {
    // You can expand this to include more icons
    const icons: { [key: string]: React.ReactNode } = {
      school: "🏫",
      users: "👥",
      "graduation-cap": "🎓",
      "book-open": "📚",
      award: "🏆",
      "file-text": "📄",
      calendar: "📅",
      trophy: "🏆",
    }
    return icons[iconName] || "📊"
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up":
        return <TrendingUp className="h-4 w-4 text-green-500" />
      case "down":
        return <TrendingDown className="h-4 w-4 text-red-500" />
      default:
        return <Minus className="h-4 w-4 text-gray-500" />
    }
  }

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case "up":
        return "text-green-600"
      case "down":
        return "text-red-600"
      default:
        return "text-gray-600"
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {kpiData.map((kpi, index) => (
        <motion.div
          key={kpi.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
        >
          <Card className="hover:shadow-lg transition-shadow duration-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{kpi.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{kpi.value.toLocaleString()}</p>
                </div>
                <div className="text-2xl">{getIcon(kpi.icon)}</div>
              </div>
              <div className="flex items-center mt-4">
                {getTrendIcon(kpi.trend)}
                <span className={`text-sm font-medium ml-1 ${getTrendColor(kpi.trend)}`}>
                  {kpi.change !== undefined && kpi.change !== null ?
                    `${kpi.change > 0 ? "+" : ""}${kpi.change.toFixed(1)}%` :
                    "0%"}
                </span>
                <span className="text-sm text-gray-500 ml-2">from last month</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  )
}
