import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // If trying to access dashboard without being authenticated
  if (pathname.startsWith("/dashboard")) {
    const token = request.cookies.get("auth-token")?.value
    const isAuthenticated = request.cookies.get("isAuthenticated")?.value


    // Simple check: if both cookies exist, allow access
    // JWT verification will happen in API routes where Node.js runtime is available
    if (!token || isAuthenticated !== "true") {
      return NextResponse.redirect(new URL("/", request.url))
    }

    return NextResponse.next()
  }

  // If already authenticated and trying to access login page
  if (pathname === "/") {
    const token = request.cookies.get("auth-token")?.value
    const isAuthenticated = request.cookies.get("isAuthenticated")?.value

    if (token && isAuthenticated === "true") {
      return NextResponse.redirect(new URL("/dashboard", request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/", "/dashboard/:path*"],
}
