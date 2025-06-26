"use client"

import { useState, useEffect } from "react"
import { useGamification } from "./gamification-provider"

// Hook for tracking specific actions
export function useTaskCompletion() {
  const { completeTask } = useGamification()

  const trackAction = async (action: string, metadata?: any) => {
    const actionMap: Record<string, string> = {
      iso_submission: "iso_document_upload",
      student_registration: "student_add",
      training_completion: "training_complete",
      club_registration: "club_join",
      document_upload: "document_add",
      event_creation: "event_create",
      message_sent: "message_send",
      profile_update: "profile_edit",
    }

    const taskType = actionMap[action] || action
    await completeTask(taskType, metadata)
  }

  return { trackAction }
}

// Hook for achievement notifications
export function useAchievementNotifications() {
  const [notifications, setNotifications] = useState<any[]>([])
  const { stats } = useGamification()

  useEffect(() => {
    if (stats?.achievements) {
      const newAchievements = stats.achievements.filter((a) => a.completed && !a.claimed)

      if (newAchievements.length > 0) {
        setNotifications(newAchievements)

        // Auto-hide after 5 seconds
        setTimeout(() => {
          setNotifications([])
        }, 5000)
      }
    }
  }, [stats?.achievements])

  return { notifications, clearNotifications: () => setNotifications([]) }
}

// Hook for leaderboard data
export function useLeaderboard(type: "school" | "global" = "school") {
  const [leaderboard, setLeaderboard] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [userRank, setUserRank] = useState<number | null>(null)

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const response = await fetch(`/api/gamification/leaderboards/${type}`)
        if (response.ok) {
          const data = await response.json()
          setLeaderboard(data.entries)
          setUserRank(data.userRank)
        }
      } catch (error) {
        console.error("Failed to fetch leaderboard:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchLeaderboard()
  }, [type])

  return { leaderboard, userRank, loading }
}
