"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useRole } from "@/components/role-context"
import { Loader2 } from "lucide-react"
import { Unauthorized } from "./unauthorized"

type Props = {
  children: React.ReactNode
  allowedRoles: string[]
}

export function AuthGuard({ children, allowedRoles }: Props) {
  const { userRole, isAuthenticated } = useRole()
  const router = useRouter()
  const pathname = usePathname()
  const [authState, setAuthState] = useState<"loading" | "authenticated" | "unauthenticated" | "unauthorized">(
    "loading",
  )

  useEffect(() => {


    // If not logged in and trying to access a protected route
    if (!isAuthenticated && pathname.startsWith("/dashboard")) {
      router.push("/")
      return
    }

    // If logged in but not authorized for this specific page
    if (isAuthenticated && pathname.startsWith("/dashboard")) {
      if (!allowedRoles.includes(userRole)) {
        setAuthState("unauthorized")
        return
      }

      setAuthState("authenticated")
    } else if (!pathname.startsWith("/dashboard")) {
      // Public routes are always authenticated
      setAuthState("authenticated")
    } else {
      setAuthState("unauthenticated")
    }
  }, [userRole, router, pathname, allowedRoles, isAuthenticated])

  // Show loading while checking authorization
  if (authState === "loading") {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--primary-color)]" />
      </div>
    )
  }

  // Show unauthorized page
  if (authState === "unauthorized") {
    return <Unauthorized />
  }

  // If authenticated and authorized, render children
  return <>{children}</>
}
