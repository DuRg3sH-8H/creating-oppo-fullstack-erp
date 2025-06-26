"use client"

import { motion } from "framer-motion"
import { Calendar, Clock, Target, Zap, TrendingUp, AlertCircle } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface Challenge {
  id: string
  title: string
  description: string
  type: "daily" | "weekly" | "monthly"
  points: number
  progress: number
  deadline: string
  completed: boolean
  target: number
  category: string
}

interface EnhancedChallengeCardProps {
  challenge: Challenge
  onJoin?: (id: string) => void
}

export function EnhancedChallengeCard({ challenge, onJoin }: EnhancedChallengeCardProps) {
  const getTypeConfig = (type: string) => {
    switch (type) {
      case "daily":
        return {
          color: "from-green-400 to-emerald-500",
          bg: "bg-gradient-to-br from-green-50 to-emerald-50",
          border: "border-green-200",
          text: "text-green-700",
          icon: Zap,
        }
      case "weekly":
        return {
          color: "from-blue-400 to-cyan-500",
          bg: "bg-gradient-to-br from-blue-50 to-cyan-50",
          border: "border-blue-200",
          text: "text-blue-700",
          icon: Target,
        }
      case "monthly":
        return {
          color: "from-purple-400 to-pink-500",
          bg: "bg-gradient-to-br from-purple-50 to-pink-50",
          border: "border-purple-200",
          text: "text-purple-700",
          icon: Calendar,
        }
      default:
        return {
          color: "from-gray-400 to-gray-500",
          bg: "bg-gradient-to-br from-gray-50 to-gray-100",
          border: "border-gray-200",
          text: "text-gray-700",
          icon: Clock,
        }
    }
  }

  const config = getTypeConfig(challenge.type)
  const TypeIcon = config.icon

  const deadline = new Date(challenge.deadline)
  const now = new Date()
  const timeLeft = deadline.getTime() - now.getTime()
  const daysLeft = Math.ceil(timeLeft / (1000 * 60 * 60 * 24))
  const hoursLeft = Math.ceil(timeLeft / (1000 * 60 * 60))

  const isUrgent = daysLeft <= 1
  const isExpired = timeLeft <= 0

  const progressPercentage = (challenge.progress / challenge.target) * 100

  const getTimeLeftDisplay = () => {
    if (isExpired) return "Expired"
    if (daysLeft <= 1) return `${hoursLeft}h left`
    return `${daysLeft} days left`
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02, y: -2 }}
      transition={{ duration: 0.2 }}
    >
      <Card
        className={cn(
          "relative overflow-hidden transition-all duration-300",
          challenge.completed
            ? "border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 shadow-green-200/50 shadow-lg"
            : isExpired
              ? "border-red-200 bg-gradient-to-br from-red-50 to-red-100"
              : isUrgent
                ? "border-orange-200 bg-gradient-to-br from-orange-50 to-yellow-50 shadow-orange-200/50 shadow-md"
                : `${config.border} ${config.bg} hover:shadow-md`,
        )}
      >
        {challenge.completed && (
          <div className="absolute top-0 right-0 w-0 h-0 border-l-[40px] border-l-transparent border-t-[40px] border-t-green-500">
            <div className="absolute -top-8 -right-1 text-white text-xs font-bold transform rotate-45">✓</div>
          </div>
        )}

        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <motion.div
              whileHover={{ rotate: 5 }}
              className={cn(
                "p-3 rounded-xl shadow-lg",
                challenge.completed
                  ? "bg-gradient-to-r from-green-400 to-emerald-500"
                  : isExpired
                    ? "bg-gradient-to-r from-red-400 to-red-500"
                    : `bg-gradient-to-r ${config.color}`,
              )}
            >
              <TypeIcon className="w-6 h-6 text-white" />
            </motion.div>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className={cn("font-semibold text-lg", challenge.completed ? "text-green-700" : config.text)}>
                    {challenge.title}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">{challenge.description}</p>
                </div>
                <div className="text-right ml-4">
                  <span className={cn("text-lg font-bold", challenge.completed ? "text-green-700" : config.text)}>
                    {challenge.points}
                  </span>
                  <p className="text-xs text-gray-500">points</p>
                </div>
              </div>

              <div className="flex items-center gap-2 mb-3">
                <span
                  className={cn(
                    "px-3 py-1 rounded-full text-xs font-medium capitalize",
                    challenge.type === "daily"
                      ? "bg-green-100 text-green-800"
                      : challenge.type === "weekly"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-purple-100 text-purple-800",
                  )}
                >
                  {challenge.type}
                </span>

                <div
                  className={cn(
                    "flex items-center gap-1 text-xs font-medium",
                    isExpired ? "text-red-600" : isUrgent ? "text-orange-600" : "text-gray-500",
                  )}
                >
                  {isUrgent && !isExpired && <AlertCircle className="w-3 h-3" />}
                  <Clock className="w-3 h-3" />
                  <span>{getTimeLeftDisplay()}</span>
                </div>

                <span className="text-xs text-gray-500 px-2 py-1 bg-gray-100 rounded-full">{challenge.category}</span>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className={cn(challenge.completed ? "text-green-600" : "text-gray-600")}>
                    Progress: {challenge.progress}/{challenge.target}
                  </span>
                  <span className={cn("font-medium", challenge.completed ? "text-green-600" : config.text)}>
                    {Math.round(progressPercentage)}%
                  </span>
                </div>
                <Progress
                  value={progressPercentage}
                  className={cn("h-3", challenge.completed ? "bg-green-100" : "bg-gray-200")}
                />
              </div>

              {challenge.completed && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mt-4 text-center"
                >
                  <div className="flex items-center justify-center gap-2 text-green-600 font-medium">
                    <TrendingUp className="w-4 h-4" />
                    <span>Challenge Completed!</span>
                  </div>
                </motion.div>
              )}

              {!challenge.completed && !isExpired && onJoin && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="mt-4"
                >
                  <Button
                    onClick={() => onJoin(challenge.id)}
                    className={cn(
                      "w-full font-medium",
                      isUrgent
                        ? "bg-gradient-to-r from-orange-400 to-red-500 hover:from-orange-500 hover:to-red-600 text-white"
                        : `bg-gradient-to-r ${config.color} hover:opacity-90 text-white`,
                    )}
                    size="sm"
                  >
                    {isUrgent ? "Complete Now!" : "Join Challenge"}
                  </Button>
                </motion.div>
              )}

              {isExpired && !challenge.completed && (
                <div className="mt-4 text-center">
                  <span className="text-sm text-red-600 font-medium">⏰ Challenge Expired</span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
