"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Plus, Settings, BarChart3, FileText, Users, FileCheck, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { ClauseManagement } from "@/components/iso/clause-management"
import { SubmissionReview } from "@/components/iso/submission-review"
import { ISOAnalytics } from "@/components/iso/iso-analytics"
import { CreateClauseModal } from "@/components/iso/create-clause-modal"
import { fetchAnalytics } from "@/lib/api/iso"

interface DashboardStats {
  totalClauses: number
  certifiedSchools: number
  totalSchools: number
  pendingReviews: number
  averageProgress: number
}

export function SuperAdminISOView() {
  const [activeTab, setActiveTab] = useState("clauses")
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      setLoading(true)
      const data = await fetchAnalytics()
      setStats({
        totalClauses: data.totalClauses || 0,
        certifiedSchools: data.certifiedSchools || 0,
        totalSchools: data.totalSchools || 0,
        pendingReviews: data.submittedClauses || 0,
        averageProgress: data.averageProgress || 0,
      })
    } catch (error) {
      console.error("Error loading stats:", error)
      toast({
        title: "Error",
        description: "Failed to load dashboard stats.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCreateSuccess = () => {
    setIsCreateModalOpen(false)
    loadStats() // Refresh stats after creating a clause
    toast({
      title: "Success",
      description: "Clause created successfully.",
    })
  }

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
        >
          <div className="flex items-center">
            <div className="bg-blue-100 text-blue-600 p-3 rounded-lg">
              <FileText className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Clauses</p>
              {loading ? (
                <Loader2 className="h-6 w-6 animate-spin text-[var(--accent-color)]" />
              ) : (
                <p className="text-2xl font-bold text-[var(--accent-color)]">{stats?.totalClauses || 0}</p>
              )}
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
        >
          <div className="flex items-center">
            <div className="bg-green-100 text-green-600 p-3 rounded-lg">
              <Users className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Certified Schools</p>
              {loading ? (
                <Loader2 className="h-6 w-6 animate-spin text-[var(--accent-color)]" />
              ) : (
                <p className="text-2xl font-bold text-[var(--accent-color)]">
                  {stats?.certifiedSchools || 0}/{stats?.totalSchools || 0}
                </p>
              )}
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
        >
          <div className="flex items-center">
            <div className="bg-orange-100 text-orange-600 p-3 rounded-lg">
              <Settings className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Pending Reviews</p>
              {loading ? (
                <Loader2 className="h-6 w-6 animate-spin text-[var(--accent-color)]" />
              ) : (
                <p className="text-2xl font-bold text-[var(--accent-color)]">{stats?.pendingReviews || 0}</p>
              )}
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
        >
          <div className="flex items-center">
            <div className="bg-purple-100 text-purple-600 p-3 rounded-lg">
              <BarChart3 className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Avg. Progress</p>
              {loading ? (
                <Loader2 className="h-6 w-6 animate-spin text-[var(--accent-color)]" />
              ) : (
                <p className="text-2xl font-bold text-[var(--accent-color)]">{stats?.averageProgress || 0}%</p>
              )}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-[var(--accent-color)]">ISO 21001 Management</h2>
              <p className="text-gray-500 mt-1">Manage clauses, review submissions, and monitor progress</p>
            </div>
            <Button
              onClick={() => setIsCreateModalOpen(true)}
              className="bg-[var(--primary-color)] hover:bg-[var(--secondary-color)] text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add New Clause
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-gray-50 m-6 mb-0">
            <TabsTrigger value="clauses" className="flex items-center space-x-2">
              <Settings className="h-4 w-4" />
              <span>Clause Management</span>
            </TabsTrigger>
            <TabsTrigger value="submissions" className="flex items-center space-x-2">
              <FileCheck className="h-4 w-4" />
              <span>Review Submissions</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4" />
              <span>Analytics</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="clauses" className="p-6 pt-4">
            <ClauseManagement />
          </TabsContent>

          <TabsContent value="submissions" className="p-6 pt-4">
            <SubmissionReview />
          </TabsContent>

          <TabsContent value="analytics" className="p-6 pt-4">
            <ISOAnalytics />
          </TabsContent>
        </Tabs>
      </div>

      <CreateClauseModal
        isOpen={isCreateModalOpen}  
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleCreateSuccess}
      />
    </div>
  )
}
