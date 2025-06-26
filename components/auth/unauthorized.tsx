"use client"

import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { AlertTriangle } from "lucide-react"

export function Unauthorized() {
  const router = useRouter()

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-4">
      <div className="bg-red-50 p-4 rounded-full mb-4">
        <AlertTriangle className="h-12 w-12 text-red-500" />
      </div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
      <p className="text-gray-600 text-center max-w-md mb-6">
        You don't have permission to access this page. Please contact your administrator if you believe this is an
        error.
      </p>
      <div className="flex gap-4">
        <Button onClick={() => router.push("/dashboard")} variant="outline">
          Go to Dashboard
        </Button>
        <Button onClick={() => router.push("/")} className="bg-[var(--primary-color)]">
          Go to Home
        </Button>
      </div>
    </div>
  )
}
