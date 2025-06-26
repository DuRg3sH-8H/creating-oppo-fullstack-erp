"use client"
import { motion } from "framer-motion"
import { Download, Calendar, Users, CheckCircle, TrendingUp, Target, Zap, Star, Award, Trophy } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"

// Gamification imports
import { useGamification } from "@/components/gamification/gamification-provider"
import { useDashboardStats } from "@/lib/hooks/use-dashboard-stats"

interface EnhancedSchoolAdminDashboardProps {
  userName: string
}

export function EnhancedSchoolAdminDashboard({ userName }: EnhancedSchoolAdminDashboardProps) {
  const { stats: gamificationStats, loading: gamificationLoading, error: gamificationError } = useGamification()
  const { stats: dashboardStats, loading: statsLoading, error: statsError, refetch } = useDashboardStats()
  const { toast } = useToast()
  const router = useRouter()

  // School Admin Actions - focused on participation and management
  const quickActions = [
    {
      title: "Manage Students",
      description: "Add/edit students",
      icon: Users,
      color: "from-blue-500 to-cyan-500",
      points: 25,
      path: "/dashboard/students",
    },
    {
      title: "Download Documents",
      description: "Access resources",
      icon: Download,
      color: "from-purple-500 to-pink-500",
      points: 5,
      path: "/dashboard/documents",
    },
    {
      title: "Join Events",
      description: "Participate in events",
      icon: Calendar,
      color: "from-green-500 to-emerald-500",
      points: 20,
      path: "/dashboard/calendar",
    },
    {
      title: "ISO Submission",
      description: "Submit compliance",
      icon: CheckCircle,
      color: "from-orange-500 to-red-500",
      points: 40,
      path: "/dashboard/iso",
    },
  ]

  const handleQuickAction = (path: string) => {
    router.push(path)
  }

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

  const schoolStats = dashboardStats as any

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
          Welcome back, {userName}! 👋
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-gray-600 text-sm mt-1"
        >
          Manage your school efficiently and earn points for every action
        </motion.p>
      </div>

      {/* Compact Level Progress */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-0">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                {gamificationStats?.level || 1}
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Level {gamificationStats?.level || 1} Administrator</h3>
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

      {/* Quick Actions
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Zap className="w-5 h-5" />
            School Actions
            <span className="text-sm font-normal text-gray-500 ml-2">Earn points by managing your school</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {quickActions.map((action, index) => (
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
        {/* Left Column - School Overview */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <TrendingUp className="w-5 h-5" />
                School Overview
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
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <p className="text-xl font-bold text-blue-600">{schoolStats?.totalStudents || 0}</p>
                    <p className="text-xs text-blue-600">Students</p>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <p className="text-xl font-bold text-green-600">{schoolStats?.totalTeachers || 0}</p>
                    <p className="text-xs text-green-600">Teachers</p>
                  </div>
                  <div className="text-center p-3 bg-purple-50 rounded-lg">
                    <p className="text-xl font-bold text-purple-600">{schoolStats?.joinedClubs || 0}</p>
                    <p className="text-xs text-purple-600">Joined Clubs</p>
                  </div>
                  <div className="text-center p-3 bg-orange-50 rounded-lg">
                    <p className="text-xl font-bold text-orange-600">{schoolStats?.attendedEvents || 0}</p>
                    <p className="text-xs text-orange-600">Events Attended</p>
                  </div>
                </div>
              )}

              <div className="mt-4 space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>ISO Compliance</span>
                    <span className="font-medium">{schoolStats?.isoProgress || 0}%</span>
                  </div>
                  <Progress value={schoolStats?.isoProgress || 0} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Documents Downloaded</span>
                    <span className="font-medium">{schoolStats?.documentsDownloaded || 0}</span>
                  </div>
                  <Progress
                    value={Math.min(((schoolStats?.documentsDownloaded || 0) / 50) * 100, 100)}
                    className="h-2"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Achievements & Recent Activity */}
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
                <Target className="w-5 h-5" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {!gamificationStats?.recentActivities?.length ? (
                  <p className="text-gray-500 text-sm text-center py-4">Complete actions to see your activity here</p>
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
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">+{activity.points}</span>
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
