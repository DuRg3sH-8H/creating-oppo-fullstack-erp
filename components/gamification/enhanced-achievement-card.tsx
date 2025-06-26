"use client"

import { motion } from "framer-motion"
import { CheckCircle, Star, Trophy, Award, Medal, Clock, Gift } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
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
  completedAt?: Date
  claimed?: boolean
}

interface EnhancedAchievementCardProps {
  achievement: Achievement
  onClaim?: (id: string) => void
}

export function EnhancedAchievementCard({ achievement, onClaim }: EnhancedAchievementCardProps) {
  const getRarityConfig = (rarity: string) => {
    switch (rarity) {
      case "legendary":
        return {
          gradient: "from-yellow-400 via-yellow-500 to-orange-500",
          bg: "bg-gradient-to-br from-yellow-50 to-orange-50",
          border: "border-yellow-200",
          text: "text-yellow-800",
          icon: Trophy,
          glow: "shadow-yellow-200/50",
        }
      case "epic":
        return {
          gradient: "from-purple-400 via-purple-500 to-pink-500",
          bg: "bg-gradient-to-br from-purple-50 to-pink-50",
          border: "border-purple-200",
          text: "text-purple-800",
          icon: Award,
          glow: "shadow-purple-200/50",
        }
      case "rare":
        return {
          gradient: "from-blue-400 via-blue-500 to-cyan-500",
          bg: "bg-gradient-to-br from-blue-50 to-cyan-50",
          border: "border-blue-200",
          text: "text-blue-800",
          icon: Medal,
          glow: "shadow-blue-200/50",
        }
      default:
        return {
          gradient: "from-gray-400 via-gray-500 to-gray-600",
          bg: "bg-gradient-to-br from-gray-50 to-gray-100",
          border: "border-gray-200",
          text: "text-gray-800",
          icon: Star,
          glow: "shadow-gray-200/50",
        }
    }
  }

  const config = getRarityConfig(achievement.rarity)
  const RarityIcon = config.icon

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02, y: -2 }}
      transition={{ duration: 0.2 }}
    >
      <Card
        className={cn(
          "relative overflow-hidden transition-all duration-300",
          config.border,
          config.bg,
          achievement.completed ? `${config.glow} shadow-lg` : "hover:shadow-md",
        )}
      >
        {achievement.completed && !achievement.claimed && (
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute -top-2 -right-2 z-10">
            <div className={`bg-gradient-to-r ${config.gradient} text-white rounded-full p-2 shadow-lg`}>
              <Gift className="w-4 h-4" />
            </div>
          </motion.div>
        )}

        {achievement.completed && achievement.claimed && (
          <div className="absolute -top-2 -right-2 z-10">
            <div className="bg-green-500 text-white rounded-full p-1.5 shadow-lg">
              <CheckCircle className="w-4 h-4" />
            </div>
          </div>
        )}

        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <motion.div
              whileHover={{ rotate: 5 }}
              className={`p-3 rounded-xl bg-gradient-to-r ${config.gradient} shadow-lg`}
            >
              <RarityIcon className="w-6 h-6 text-white" />
            </motion.div>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className={cn("font-semibold text-lg", config.text)}>{achievement.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">{achievement.description}</p>
                </div>
                <div className="text-right ml-4">
                  <span className={cn("text-lg font-bold", config.text)}>{achievement.points}</span>
                  <p className="text-xs text-gray-500">points</p>
                </div>
              </div>

              <div className="flex items-center gap-2 mb-3">
                <span
                  className={cn(
                    "px-3 py-1 rounded-full text-xs font-medium capitalize",
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
                {achievement.completedAt && (
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Clock className="w-3 h-3" />
                    <span>{new Date(achievement.completedAt).toLocaleDateString()}</span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className={cn(achievement.completed ? config.text : "text-gray-600")}>
                    Progress: {achievement.progress}%
                  </span>
                  {achievement.completed && (
                    <span className="flex items-center text-green-600 font-medium">
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Completed!
                    </span>
                  )}
                </div>
                <Progress
                  value={achievement.progress}
                  className={cn("h-2", achievement.completed ? "bg-green-100" : "bg-gray-200")}
                />
              </div>

              {achievement.completed && !achievement.claimed && onClaim && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="mt-4"
                >
                  <Button
                    onClick={() => onClaim(achievement.id)}
                    className={`w-full bg-gradient-to-r ${config.gradient} hover:opacity-90 text-white font-medium`}
                    size="sm"
                  >
                    <Gift className="w-4 h-4 mr-2" />
                    Claim Reward
                  </Button>
                </motion.div>
              )}

              {achievement.completed && achievement.claimed && (
                <div className="mt-4 text-center">
                  <span className="text-sm text-green-600 font-medium">✨ Reward Claimed!</span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
