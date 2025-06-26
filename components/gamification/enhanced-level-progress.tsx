"use client"

import { motion } from "framer-motion"
import { Star, Crown, Award, Zap, TrendingUp } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { Card, CardContent } from "@/components/ui/card"

interface EnhancedLevelProgressProps {
  level: number
  totalPoints: number
  levelProgress: number
  pointsToNextLevel: number
  title?: string
  streak?: number
  weeklyProgress?: number
  monthlyGoal?: number
}

export function EnhancedLevelProgress({
  level,
  totalPoints,
  levelProgress,
  pointsToNextLevel,
  title = "Administrator",
  streak = 0,
  weeklyProgress = 0,
  monthlyGoal = 5000,
}: EnhancedLevelProgressProps) {
  const getLevelIcon = (level: number) => {
    if (level >= 20) return Crown
    if (level >= 10) return Award
    if (level >= 5) return Star
    return Zap
  }

  const getLevelColor = (level: number) => {
    if (level >= 20) return "from-yellow-400 via-yellow-500 to-orange-500"
    if (level >= 10) return "from-purple-400 via-purple-500 to-pink-500"
    if (level >= 5) return "from-blue-400 via-blue-500 to-cyan-500"
    return "from-green-400 via-green-500 to-emerald-500"
  }

  const monthlyProgress = ((weeklyProgress * 4) / monthlyGoal) * 100

  const LevelIcon = getLevelIcon(level)

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <div className={`bg-gradient-to-r ${getLevelColor(level)} p-6 text-white`}>
          <div className="flex items-center gap-4">
            <div className="relative">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
                className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white font-bold text-2xl border-4 border-white/30"
              >
                {level}
              </motion.div>
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.4, type: "spring" }}
                className="absolute -top-2 -right-2 bg-white text-gray-800 text-xs font-bold rounded-full w-8 h-8 flex items-center justify-center shadow-lg"
              >
                <LevelIcon className="w-4 h-4" />
              </motion.div>
            </div>

            <div className="flex-1">
              <motion.h2
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="text-2xl font-bold"
              >
                {title}
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="text-white/80"
              >
                Level {level} • {totalPoints.toLocaleString()} points
              </motion.p>

              <div className="mt-3 space-y-2">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{ delay: 0.5, duration: 0.8 }}
                  className="w-full max-w-md"
                >
                  <div className="flex justify-between text-sm mb-1">
                    <span>Level Progress</span>
                    <span>{Math.round(levelProgress)}%</span>
                  </div>
                  <Progress value={levelProgress} className="h-3 bg-white/20" />
                  <p className="text-xs text-white/70 mt-1">
                    {pointsToNextLevel.toLocaleString()} points to Level {level + 1}
                  </p>
                </motion.div>
              </div>
            </div>

            <div className="text-right space-y-3">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="bg-white/20 backdrop-blur-sm rounded-lg p-3 min-w-[120px]"
              >
                <div className="flex items-center gap-2 mb-1">
                  <Zap className="w-4 h-4" />
                  <span className="text-sm font-medium">Streak</span>
                </div>
                <p className="text-2xl font-bold">{streak}</p>
                <p className="text-xs text-white/70">days</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="bg-white/20 backdrop-blur-sm rounded-lg p-3"
              >
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="w-4 h-4" />
                  <span className="text-sm font-medium">Weekly</span>
                </div>
                <p className="text-lg font-bold">{weeklyProgress}</p>
                <p className="text-xs text-white/70">points</p>
              </motion.div>
            </div>
          </div>
        </div>

        <div className="p-6 bg-gradient-to-r from-gray-50 to-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="text-center"
            >
              <p className="text-sm text-gray-600 mb-1">Monthly Goal</p>
              <div className="relative">
                <Progress value={monthlyProgress} className="h-2 mb-1" />
                <p className="text-xs text-gray-500">
                  {Math.round(monthlyProgress)}% of {monthlyGoal.toLocaleString()}
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
              className="text-center"
            >
              <p className="text-sm text-gray-600 mb-1">Next Milestone</p>
              <p className="text-lg font-bold text-gray-800">{(Math.floor(level / 5) + 1) * 5}</p>
              <p className="text-xs text-gray-500">Special Reward</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.0 }}
              className="text-center"
            >
              <p className="text-sm text-gray-600 mb-1">Rank</p>
              <p className="text-lg font-bold text-gray-800">#1</p>
              <p className="text-xs text-gray-500">in school</p>
            </motion.div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
