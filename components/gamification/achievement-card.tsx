"use client"

import { motion } from "framer-motion"
import { CheckCircle, Star, Trophy, Award, Medal } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"

interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  points: number
  completed: boolean
  progress: number
  rarity: "common" | "rare" | "epic" | "legendary"
}

interface AchievementCardProps {
  achievement: Achievement
  onClaim?: (id: string) => void
}

export function AchievementCard({ achievement, onClaim }: AchievementCardProps) {
  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case "legendary":
        return "from-yellow-400 to-orange-500"
      case "epic":
        return "from-purple-400 to-pink-500"
      case "rare":
        return "from-blue-400 to-cyan-500"
      default:
        return "from-gray-400 to-gray-500"
    }
  }

  const getRarityIcon = (rarity: string) => {
    switch (rarity) {
      case "legendary":
        return Trophy
      case "epic":
        return Award
      case "rare":
        return Medal
      default:
        return Star
    }
  }

  const RarityIcon = getRarityIcon(achievement.rarity)

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02 }}
      className={cn(
        "relative border rounded-lg p-4 transition-all",
        achievement.completed ? "border-green-200 bg-green-50 shadow-md" : "border-gray-200 bg-white hover:shadow-md",
      )}
    >
      {achievement.completed && (
        <div className="absolute -top-2 -right-2">
          <div className="bg-green-500 text-white rounded-full p-1">
            <CheckCircle className="w-4 h-4" />
          </div>
        </div>
      )}

      <div className="flex items-start gap-3">
        <div className={cn("p-2 rounded-full bg-gradient-to-r", getRarityColor(achievement.rarity))}>
          <RarityIcon className="w-5 h-5 text-white" />
        </div>

        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h3 className={cn("font-medium", achievement.completed ? "text-green-700" : "text-gray-900")}>
              {achievement.title}
            </h3>
            <span className="text-sm font-medium text-blue-600">{achievement.points} pts</span>
          </div>

          <p className={cn("text-sm mt-1", achievement.completed ? "text-green-600" : "text-gray-500")}>
            {achievement.description}
          </p>

          <div className="mt-3">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className={cn(achievement.completed ? "text-green-600" : "text-gray-500")}>
                {achievement.progress}% Complete
              </span>
              <span
                className={cn(
                  "px-2 py-0.5 rounded-full text-xs font-medium",
                  achievement.rarity === "legendary"
                    ? "bg-yellow-100 text-yellow-800"
                    : achievement.rarity === "epic"
                      ? "bg-purple-100 text-purple-800"
                      : achievement.rarity === "rare"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-gray-100 text-gray-800",
                )}
              >
                {achievement.rarity}
              </span>
            </div>
            <Progress value={achievement.progress} className="h-2" />
          </div>

          {achievement.completed && onClaim && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onClaim(achievement.id)}
              className="mt-3 w-full bg-green-500 text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-green-600 transition-colors"
            >
              Claim Reward
            </motion.button>
          )}
        </div>
      </div>
    </motion.div>
  )
}
