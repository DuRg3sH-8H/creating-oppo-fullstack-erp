"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRole } from "@/components/role-context"
import { useRouter, usePathname } from "next/navigation"

export function AuthCheck({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useRole()
  const [isChecking, setIsChecking] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // Check if we're on a protected route
    const isProtectedRoute = pathname?.startsWith("/dashboard")

    // Check if we're authenticated
    const isAuth = isAuthenticated || localStorage.getItem("isAuthenticated") === "true"

    if (isProtectedRoute && !isAuth) {
      // Redirect to login page
      window.location.href = "/"
    } else {
      setIsChecking(false)
    }
  }, [isAuthenticated, pathname, router])

  if (isChecking) {
    return <div className="h-screen flex items-center justify-center">Checking authentication...</div>
  }

  return <>{children}</>
}
