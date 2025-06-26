"use client"

import { motion } from "framer-motion"
import { Award, CheckCircle, Clock, FileCheck, XCircle } from "lucide-react"
import { Progress } from "@/components/ui/progress"

interface SchoolISOProgressProps {
  progress: number
  totalClauses: number
  pendingClauses: number
  submittedClauses: number
  approvedClauses: number
  rejectedClauses: number
  isCertified: boolean
}

export function SchoolISOProgress({
  progress,
  totalClauses,
  pendingClauses,
  submittedClauses,
  approvedClauses,
  rejectedClauses,
  isCertified,
}: SchoolISOProgressProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-[var(--accent-color)]">ISO 21001 Certification Progress</h2>
          <p className="text-gray-500 mt-1">Track your school's compliance journey</p>
        </div>
        {isCertified && (
          <div className="flex items-center bg-green-100 text-green-700 px-4 py-2 rounded-full">
            <Award className="h-5 w-5 mr-2" />
            <span className="font-medium">Certified</span>
          </div>
        )}
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-[var(--accent-color)]">Overall Progress</span>
          <span className="text-sm font-medium text-[var(--accent-color)]">{progress}%</span>
        </div>
        <Progress value={progress} className="h-3" />
      </div>

      {/* Status Breakdown */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="text-center p-4 bg-gray-50 rounded-lg"
        >
          <div className="flex items-center justify-center mb-2">
            <Clock className="h-6 w-6 text-gray-500" />
          </div>
          <p className="text-2xl font-bold text-gray-700">{pendingClauses}</p>
          <p className="text-sm text-gray-500">Pending</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="text-center p-4 bg-blue-50 rounded-lg"
        >
          <div className="flex items-center justify-center mb-2">
            <FileCheck className="h-6 w-6 text-blue-500" />
          </div>
          <p className="text-2xl font-bold text-blue-700">{submittedClauses}</p>
          <p className="text-sm text-blue-500">Under Review</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="text-center p-4 bg-green-50 rounded-lg"
        >
          <div className="flex items-center justify-center mb-2">
            <CheckCircle className="h-6 w-6 text-green-500" />
          </div>
          <p className="text-2xl font-bold text-green-700">{approvedClauses}</p>
          <p className="text-sm text-green-500">Approved</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.3 }}
          className="text-center p-4 bg-red-50 rounded-lg"
        >
          <div className="flex items-center justify-center mb-2">
            <XCircle className="h-6 w-6 text-red-500" />
          </div>
          <p className="text-2xl font-bold text-red-700">{rejectedClauses}</p>
          <p className="text-sm text-red-500">Needs Revision</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.4 }}
          className="text-center p-4 bg-purple-50 rounded-lg"
        >
          <div className="flex items-center justify-center mb-2">
            <Award className="h-6 w-6 text-purple-500" />
          </div>
          <p className="text-2xl font-bold text-purple-700">{totalClauses}</p>
          <p className="text-sm text-purple-500">Total Clauses</p>
        </motion.div>
      </div>
    </div>
  )
}
