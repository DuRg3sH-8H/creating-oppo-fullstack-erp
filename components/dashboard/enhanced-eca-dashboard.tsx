"use client"
import { motion } from "framer-motion"
import { Award, Calendar, Trophy, Users, Target, Zap, Star, Download } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"

// Gamification imports
import { useGamification } from "@/components/gamification/gamification-provider"
import { useDashboardStats } from "@/lib/hooks/use-dashboard-stats"

interface EnhancedEcaDashboardProps {
  userName: string
}

export function EnhancedEcaDashboard({ userName }: EnhancedEcaDashboardProps) {
  const { stats: gamificationStats, loading: gamificationLoading, error: gamificationError } = useGamification()
  const { stats: dashboardStats, loading: statsLoading, error: statsError, refetch } = useDashboardStats()
  const { toast } = useToast()
  const router = useRouter()

  // ECA Actions - focused on participation and engagement


  if (gamificationLoading || statsLoading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3" />
          <div className="h-24 bg-gray-200 rounded" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-20 bg-gray-200 rounded" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (gamificationError) {
    console.error("Gamification error:", gamificationError)
  }

  const ecaStats = dashboardStats as any

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-6xl mx-auto p-6 space-y-6"
    >
      {/* Welcome Section */}
      <div className="mb-6">
        <motion.h1
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-2xl font-bold text-gray-900"
        >
          Welcome, {userName}! 🌟
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-gray-600 text-sm mt-1"
        >
          Engage with student activities and earn points for participation
        </motion.p>
      </div>

      {/* Compact Level Progress */}
      <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 border-0">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center text-white font-bold">
                {gamificationStats?.level || 1}
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Level {gamificationStats?.level || 1} ECA Coordinator</h3>
                <p className="text-sm text-gray-600">{gamificationStats?.totalPoints || 0} total points</p>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center space-x-2 mb-1">
                <Star className="w-4 h-4 text-yellow-500" />
                <span className="text-sm font-medium">{gamificationStats?.streak || 0} day streak</span>
              </div>
              <Progress value={gamificationStats?.levelProgress || 0} className="w-32 h-2" />
              <p className="text-xs text-gray-500 mt-1">{gamificationStats?.pointsToNextLevel || 0} to next level</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ECA Quick Actions
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Zap className="w-5 h-5" />
            ECA Actions
            <span className="text-sm font-normal text-gray-500 ml-2">Earn points by participating</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {ecaActions.map((action, index) => (
              <motion.div
                key={action.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Button
                  onClick={() => handleQuickAction(action.path)}
                  className={`w-full h-auto p-3 bg-gradient-to-r ${action.color} hover:opacity-90 text-white`}
                  variant="default"
                >
                  <div className="flex flex-col items-center gap-1">
                    <action.icon className="w-5 h-5" />
                    <div className="text-center">
                      <p className="font-medium text-sm">{action.title}</p>
                      <p className="text-xs opacity-90">{action.description}</p>
                      <p className="text-xs font-bold">+{action.points} pts</p>
                    </div>
                  </div>
                </Button>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card> */}

      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - ECA Overview */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Target className="w-5 h-5" />
                ECA Participation
              </CardTitle>
            </CardHeader>
            <CardContent>
              {statsError ? (
                <div className="text-center p-4 text-red-600">
                  <p className="text-sm">Error loading stats</p>
                  <Button onClick={refetch} variant="outline" size="sm" className="mt-2">
                    Retry
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
                  <div className="text-center">
                    <div className="relative w-16 h-16 mx-auto mb-2">
                      <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 36 36">
                        <path
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          fill="none"
                          stroke="#e5e7eb"
                          strokeWidth="2"
                        />
                        <path
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          fill="none"
                          stroke="#10b981"
                          strokeWidth="2"
                          strokeDasharray={`${ecaStats?.participationRate || 0}, 100`}
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-sm font-bold text-green-600">{ecaStats?.participationRate || 0}%</span>
                      </div>
                    </div>
                    <p className="text-sm font-medium">Participation Rate</p>
                  </div>

                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600 mb-2">{ecaStats?.joinedClubs || 0}</div>
                    <p className="text-sm font-medium">Joined Clubs</p>
                    <p className="text-xs text-gray-500">Active memberships</p>
                  </div>

                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600 mb-2">{ecaStats?.attendedEvents || 0}</div>
                    <p className="text-sm font-medium">Events Attended</p>
                    <p className="text-xs text-gray-500">This semester</p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <p className="text-lg font-bold text-green-600">{ecaStats?.resourcesDownloaded || 0}</p>
                  <p className="text-xs text-green-600">Resources Downloaded</p>
                </div>
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <p className="text-lg font-bold text-blue-600">{ecaStats?.recognitionsGiven || 0}</p>
                  <p className="text-xs text-blue-600">Recognitions Given</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Achievements & Activity */}
        <div className="space-y-6">
          {/* Recent Achievements - Auto-claimed */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between text-lg">
                <div className="flex items-center gap-2">
                  <Trophy className="w-5 h-5" />
                  Achievements
                </div>
                <span className="text-xs text-gray-500">
                  {gamificationStats?.achievements?.filter((a) => a.completed).length || 0}/
                  {gamificationStats?.achievements?.length || 0}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {gamificationStats?.achievements?.slice(0, 3).map((achievement) => (
                  <div
                    key={achievement.id}
                    className={`p-2 rounded-lg border ${
                      achievement.completed ? "bg-green-50 border-green-200" : "bg-gray-50 border-gray-200"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Award className={`w-4 h-4 ${achievement.completed ? "text-green-600" : "text-gray-400"}`} />
                        <div>
                          <p className="text-sm font-medium">{achievement.title}</p>
                          <p className="text-xs text-gray-600">{achievement.description}</p>
                        </div>
                      </div>
                      {achievement.completed && (
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                          ✓ +{achievement.points}
                        </span>
                      )}
                    </div>
                    {!achievement.completed && <Progress value={achievement.progress} className="h-1 mt-2" />}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Users className="w-5 h-5" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {!gamificationStats?.recentActivities?.length ? (
                  <p className="text-gray-500 text-sm text-center py-4">Join clubs and events to see activity here</p>
                ) : (
                  gamificationStats?.recentActivities?.slice(0, 5).map((activity, index) => (
                    <div
                      key={activity.id || index}
                      className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
                    >
                      <div>
                        <p className="text-sm font-medium">{activity.description}</p>
                        <p className="text-xs text-gray-500">{new Date(activity.timestamp).toLocaleDateString()}</p>
                      </div>
                      <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                        +{activity.points}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </motion.div>
  )
}
