"use client"

import { motion } from "framer-motion"
import { Clock, Trophy, Star, Zap, Award, Users, FileText, Calendar } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatDistanceToNow } from "date-fns"
import { useState, useEffect } from "react"

interface GamificationActivity {
  id: string
  type: string
  description: string
  points: number
  timestamp: Date
}

interface ActivityFeedProps {
  userId?: string
}

export function ActivityFeed({ userId }: ActivityFeedProps) {
  const [activities, setActivities] = useState<GamificationActivity[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        setLoading(true)
        const response = await fetch("/api/dashboard/recent-activities")
        const data = await response.json()

        if (data.success) {
          setActivities(data.data)
          setError(null)
        } else {
          setError(data.message || "Failed to fetch activities")
        }
      } catch (err) {
        setError("Network error occurred")
        console.error("Error fetching activities:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchActivities()
  }, [userId])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-lg animate-pulse">
                <div className="w-8 h-8 bg-gray-200 rounded-full" />
                <div className="flex-1">
                  <div className="w-32 h-4 bg-gray-200 rounded mb-1" />
                  <div className="w-24 h-3 bg-gray-200 rounded" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center p-4 text-red-600">
            <p>Error loading activities: {error}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const getActivityIcon = (type: string) => {
    const icons: Record<string, any> = {
      daily_login: Zap,
      student_add: Users,
      document_upload: FileText,
      training_complete: Star,
      event_create: Calendar,
      iso_submission: Award,
      achievement_earned: Trophy,
    }
    return icons[type] || Star
  }

  const getActivityColor = (type: string) => {
    const colors: Record<string, string> = {
      daily_login: "text-green-600 bg-green-100",
      student_add: "text-blue-600 bg-blue-100",
      document_upload: "text-purple-600 bg-purple-100",
      training_complete: "text-orange-600 bg-orange-100",
      event_create: "text-pink-600 bg-pink-100",
      iso_submission: "text-indigo-600 bg-indigo-100",
      achievement_earned: "text-yellow-600 bg-yellow-100",
    }
    return colors[type] || "text-gray-600 bg-gray-100"
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {activities.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-4">No recent activities</p>
          ) : (
            activities.map((activity, index) => {
              const ActivityIcon = getActivityIcon(activity.type)
              const colorClass = getActivityColor(activity.type)

              return (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className={`p-2 rounded-full ${colorClass}`}>
                    <ActivityIcon className="w-4 h-4" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{activity.description}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-green-600 font-medium">+{activity.points} points</span>
                      <span className="text-xs text-gray-400">•</span>
                      <span className="text-xs text-gray-500">
                        {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                      </span>
                    </div>
                  </div>
                </motion.div>
              )
            })
          )}
        </div>
      </CardContent>
    </Card>
  )
}
