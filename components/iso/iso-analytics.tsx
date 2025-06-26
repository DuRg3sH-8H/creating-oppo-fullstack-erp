"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Award, TrendingUp, Users, FileCheck, BarChart3, Loader2 } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/hooks/use-toast"
import { fetchAnalytics } from "@/lib/api/iso"

interface SchoolProgress {
  id: string
  name: string
  progress: number
  totalClauses: number
  approvedClauses: number
  pendingClauses: number
  submittedClauses: number
  isCertified: boolean
}

interface AnalyticsData {
  totalSchools: number
  certifiedSchools: number
  certificationRate: number
  averageProgress: number
  totalClauses: number
  approvedClauses: number
  pendingClauses: number
  submittedClauses: number
  schools: SchoolProgress[]
}

export function ISOAnalytics() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    loadAnalytics()
  }, [])

  const loadAnalytics = async () => {
    try {
      setLoading(true)
      const data = await fetchAnalytics("schools")
      setAnalytics(data)
    } catch (error) {
      console.error("Error loading analytics:", error)
      toast({
        title: "Error",
        description: "Failed to load analytics. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--primary-color)]" />
        <span className="ml-2 text-gray-600">Loading analytics...</span>
      </div>
    )
  }

  if (!analytics) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No analytics data available.</p>
      </div>
    )
  }

  // Sort schools by progress for ranking
  const rankedSchools = [...analytics.schools].sort((a, b) => b.progress - a.progress)

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg text-[var(--accent-color)] flex items-center">
                <Award className="h-5 w-5 mr-2 text-green-600" />
                Certification Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{analytics.certificationRate}%</div>
              <p className="text-sm text-gray-500 mt-1">
                {analytics.certifiedSchools} of {analytics.totalSchools} schools certified
              </p>
              <Progress value={analytics.certificationRate} className="mt-3" />
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg text-[var(--accent-color)] flex items-center">
                <TrendingUp className="h-5 w-5 mr-2 text-blue-600" />
                Average Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">{analytics.averageProgress}%</div>
              <p className="text-sm text-gray-500 mt-1">Across all schools</p>
              <Progress value={analytics.averageProgress} className="mt-3" />
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg text-[var(--accent-color)] flex items-center">
                <FileCheck className="h-5 w-5 mr-2 text-orange-600" />
                Pending Reviews
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-600">{analytics.submittedClauses}</div>
              <p className="text-sm text-gray-500 mt-1">Submissions awaiting review</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg text-[var(--accent-color)] flex items-center">
                <BarChart3 className="h-5 w-5 mr-2 text-purple-600" />
                Total Clauses
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-600">{analytics.approvedClauses}</div>
              <p className="text-sm text-gray-500 mt-1">Approved out of {analytics.totalClauses} total</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* School Rankings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg text-[var(--accent-color)]">School Progress Rankings</CardTitle>
            <CardDescription>Schools ranked by ISO 21001 completion percentage</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {rankedSchools.map((school, index) => (
                <motion.div
                  key={school.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="flex items-center space-x-4"
                >
                  <div className="flex-shrink-0 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-sm font-medium">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-medium text-gray-900 truncate">{school.name}</p>
                      <div className="flex items-center">
                        {school.isCertified && <Award className="h-4 w-4 text-green-500 mr-1" />}
                        <span className="text-sm font-medium">{school.progress}%</span>
                      </div>
                    </div>
                    <Progress value={school.progress} className="h-2" />
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg text-[var(--accent-color)]">Certification Status Distribution</CardTitle>
            <CardDescription>Overview of school certification statuses</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                <div className="flex items-center">
                  <Award className="h-8 w-8 text-green-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-green-800">Fully Certified</p>
                    <p className="text-xs text-green-600">100% completion</p>
                  </div>
                </div>
                <div className="text-2xl font-bold text-green-700">{analytics.certifiedSchools}</div>
              </div>

              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center">
                  <TrendingUp className="h-8 w-8 text-blue-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-blue-800">In Progress</p>
                    <p className="text-xs text-blue-600">50-99% completion</p>
                  </div>
                </div>
                <div className="text-2xl font-bold text-blue-700">
                  {analytics.schools.filter((s) => s.progress >= 50 && s.progress < 100).length}
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg">
                <div className="flex items-center">
                  <Users className="h-8 w-8 text-orange-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-orange-800">Getting Started</p>
                    <p className="text-xs text-orange-600">0-49% completion</p>
                  </div>
                </div>
                <div className="text-2xl font-bold text-orange-700">
                  {analytics.schools.filter((s) => s.progress < 50).length}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Progress Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg text-[var(--accent-color)]">Detailed School Progress</CardTitle>
          <CardDescription>Complete overview of each school's ISO 21001 status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    School
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Progress
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Approved
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Pending
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {rankedSchools.map((school, index) => (
                  <motion.tr
                    key={school.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="hover:bg-gray-50"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{school.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-16 mr-3">
                          <Progress value={school.progress} className="h-2" />
                        </div>
                        <span className="text-sm font-medium">{school.progress}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {school.approvedClauses}/{school.totalClauses}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{school.pendingClauses + school.submittedClauses}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {school.isCertified ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <Award className="h-3 w-3 mr-1" />
                          Certified
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          In Progress
                        </span>
                      )}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
