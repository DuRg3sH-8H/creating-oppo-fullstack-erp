/**
 * Client-side authentication utilities
 */

/**
 * Check if user is authenticated by checking the isAuthenticated cookie
 */
export function isAuthenticated(): boolean {
  if (typeof window === "undefined") {
    return false
  }

  // Check for the isAuthenticated cookie
  const cookies = document.cookie.split(";")
  const authCookie = cookies.find((cookie) => cookie.trim().startsWith("isAuthenticated="))

  return authCookie ? authCookie.split("=")[1] === "true" : false
}

/**
 * Get a specific cookie value by name
 */
export function getCookie(name: string): string | null {
  if (typeof window === "undefined") {
    return null
  }

  const cookies = document.cookie.split(";")
  const cookie = cookies.find((cookie) => cookie.trim().startsWith(`${name}=`))

  return cookie ? decodeURIComponent(cookie.split("=")[1]) : null
}

/**
 * Clear a specific cookie
 */
export function clearCookie(name: string): void {
  if (typeof window === "undefined") {
    return
  }

  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`
}

/**
 * Clear all authentication-related cookies
 */
export function clearAuthCookies(): void {
  clearCookie("isAuthenticated")
  // Note: auth-token is HTTP-only and can't be cleared from client-side
}

/**
 * Server-side token verification utility
 * This function can only be used in API routes and server components
 */
export async function verifyToken(request: Request): Promise<{
  success: boolean
  user?: {
    id: string
    email: string
    name: string
    role: string
    schoolId?: string
  }
  error?: string
}> {
  try {
    // Import JWT utilities (only available in Node.js environment)
    const { verifyJWT } = await import("@/lib/jwt")

    // Get token from cookies
    const cookieHeader = request.headers.get("cookie")
    if (!cookieHeader) {
      return { success: false, error: "No cookies found" }
    }

    const cookies = cookieHeader.split(";").reduce(
      (acc, cookie) => {
        const [key, value] = cookie.trim().split("=")
        acc[key] = value
        return acc
      },
      {} as Record<string, string>,
    )

    const token = cookies["auth-token"]
    if (!token) {
      return { success: false, error: "No auth token found" }
    }

    // Verify the JWT token
    const decoded = await verifyJWT(token)
    if (!decoded) {
      return { success: false, error: "Invalid token" }
    }

    return {
      success: true,
      user: {
        id: decoded.id,
        email: decoded.email,
        name: decoded.name,
        role: decoded.role,
        schoolId: decoded.schoolId,
      },
    }
  } catch (error) {
    console.error("Token verification error:", error)
    return { success: false, error: "Token verification failed" }
  }
}
