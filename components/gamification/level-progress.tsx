"use client"

import { motion } from "framer-motion"
import { Star, Crown, Award } from "lucide-react"
import { Progress } from "@/components/ui/progress"

interface LevelProgressProps {
  level: number
  totalPoints: number
  levelProgress: number
  pointsToNextLevel: number
  title?: string
}

export function LevelProgress({
  level,
  totalPoints,
  levelProgress,
  pointsToNextLevel,
  title = "Administrator",
}: LevelProgressProps) {
  const getLevelIcon = (level: number) => {
    if (level >= 10) return Crown
    if (level >= 5) return Award
    return Star
  }

  const LevelIcon = getLevelIcon(level)

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white rounded-xl shadow-sm border border-gray-100 p-5"
    >
      <div className="flex items-center gap-4">
        <div className="relative">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl"
          >
            {level}
          </motion.div>
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.4, type: "spring" }}
            className="absolute -top-1 -right-1 bg-yellow-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center"
          >
            <LevelIcon className="w-4 h-4" />
          </motion.div>
        </div>

        <div className="flex-1">
          <motion.h2
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="text-lg font-semibold text-gray-900"
          >
            {title}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="text-sm text-gray-500"
          >
            Level {level} • {totalPoints.toLocaleString()} points
          </motion.p>

          <div className="mt-2 w-full max-w-xs">
            <motion.div initial={{ width: 0 }} animate={{ width: "100%" }} transition={{ delay: 0.5, duration: 0.8 }}>
              <Progress value={levelProgress} className="h-2" />
            </motion.div>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="text-xs text-gray-500 mt-1"
            >
              {pointsToNextLevel.toLocaleString()} points to Level {level + 1}
            </motion.p>
          </div>
        </div>

        <div className="text-right">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-blue-50 rounded-lg p-3"
          >
            <p className="text-sm font-medium text-blue-600">Next Reward</p>
            <p className="text-xs text-blue-500">Special Badge</p>
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
}
