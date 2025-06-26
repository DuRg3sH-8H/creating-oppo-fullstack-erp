"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { formatDistanceToNow } from "date-fns"
import type { Activity } from "@/lib/db/dashboard"

interface RecentActivitiesProps {
  userRole: string
  activities?: Activity[]
}

export function RecentActivities({ userRole, activities = [] }: RecentActivitiesProps) {
  const getActivityIcon = (type: string) => {
    const icons: { [key: string]: string } = {
      user: "👤",
      school: "🏫",
      training: "📚",
      document: "📄",
      club: "🏆",
    }
    return icons[type] || "📊"
  }

  const getActivityColor = (type: string) => {
    const colors: { [key: string]: string } = {
      user: "bg-blue-100 text-blue-800",
      school: "bg-green-100 text-green-800",
      training: "bg-purple-100 text-purple-800",
      document: "bg-orange-100 text-orange-800",
      club: "bg-yellow-100 text-yellow-800",
    }
    return colors[type] || "bg-gray-100 text-gray-800"
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
    >
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Recent Activities</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {activities.length === 0 ? (
              <p className="text-gray-500 text-sm">No recent activities</p>
            ) : (
              activities.map((activity, index) => (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className={getActivityColor(activity.type)}>
                      {getActivityIcon(activity.type)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                    <p className="text-sm text-gray-500 truncate">{activity.description}</p>
                    <div className="flex items-center mt-1 text-xs text-gray-400">
                      <span>{activity.user}</span>
                      <span className="mx-1">•</span>
                      <span>{formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}</span>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
