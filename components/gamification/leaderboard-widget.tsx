"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Trophy, Medal, Award, Crown, TrendingUp, Users } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { useLeaderboard } from "@/components/gamification/gamification-hooks"

interface LeaderboardWidgetProps {
  type?: "school" | "global"
  showUserRank?: boolean
}

export function LeaderboardWidget({ type = "school", showUserRank = true }: LeaderboardWidgetProps) {
  const { leaderboard, userRank, loading } = useLeaderboard(type)
  const [viewType, setViewType] = useState<"school" | "global">(type)

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-5 h-5 text-yellow-500" />
      case 2:
        return <Trophy className="w-5 h-5 text-gray-400" />
      case 3:
        return <Medal className="w-5 h-5 text-amber-600" />
      default:
        return <Award className="w-4 h-4 text-gray-400" />
    }
  }

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return "bg-gradient-to-r from-yellow-400 to-orange-500 text-white"
      case 2:
        return "bg-gradient-to-r from-gray-300 to-gray-400 text-white"
      case 3:
        return "bg-gradient-to-r from-amber-400 to-amber-600 text-white"
      default:
        return "bg-gray-100 text-gray-700"
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5" />
            Leaderboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-gray-100 animate-pulse">
                <div className="w-8 h-8 bg-gray-200 rounded-full" />
                <div className="flex-1">
                  <div className="w-24 h-4 bg-gray-200 rounded mb-1" />
                  <div className="w-16 h-3 bg-gray-200 rounded" />
                </div>
                <div className="w-12 h-4 bg-gray-200 rounded" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5" />
            Leaderboard
          </CardTitle>
          <div className="flex gap-1">
            <Button
              variant={viewType === "school" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewType("school")}
            >
              <Users className="w-4 h-4 mr-1" />
              School
            </Button>
            <Button
              variant={viewType === "global" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewType("global")}
            >
              <TrendingUp className="w-4 h-4 mr-1" />
              Global
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {leaderboard.slice(0, 10).map((entry, index) => (
            <motion.div
              key={entry.userId}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`flex items-center gap-3 p-3 rounded-lg transition-all hover:shadow-md ${
                entry.rank <= 3 ? "bg-gradient-to-r from-gray-50 to-gray-100" : "bg-gray-50"
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${getRankColor(entry.rank)}`}
              >
                {entry.rank <= 3 ? getRankIcon(entry.rank) : entry.rank}
              </div>

              <Avatar className="w-10 h-10">
                <AvatarImage src={entry.avatar || "/placeholder.svg"} alt={entry.name} />
                <AvatarFallback>{entry.name.charAt(0)}</AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 truncate">{entry.name}</p>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500 capitalize">{entry.role}</span>
                  <span className="text-xs text-gray-400">•</span>
                  <span className="text-xs text-gray-500">Level {entry.level}</span>
                </div>
              </div>

              <div className="text-right">
                <p className="font-bold text-gray-900">{entry.totalPoints.toLocaleString()}</p>
                <p className="text-xs text-gray-500">points</p>
              </div>
            </motion.div>
          ))}
        </div>

        {showUserRank && userRank && userRank > 10 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm text-blue-700">Your Rank</span>
              <span className="font-bold text-blue-800">#{userRank}</span>
            </div>
          </motion.div>
        )}
      </CardContent>
    </Card>
  )
}
