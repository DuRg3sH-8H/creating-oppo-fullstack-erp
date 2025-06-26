import { type NextRequest, NextResponse } from "next/server"
import { validateUserCredentials, updateUserLastLogin, getSchoolById } from "@/lib/db/users"
import { generateToken } from "@/lib/jwt"
import { cookies } from "next/headers"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body


    // Basic validation
    if (!email || !password) {
      return NextResponse.json({ success: false, message: "Email and password are required" }, { status: 400 })
    }

    // Validate credentials
    const user = await validateUserCredentials({ email, password })

    if (!user) {
      return NextResponse.json({ success: false, message: "Invalid email or password" }, { status: 401 })
    }

    // Update last login time
    await updateUserLastLogin(user._id.toString())

    // Generate JWT token
    const token = generateToken(user)

    // Get school theme if applicable
    let schoolTheme = null
    if (user.schoolId) {
      schoolTheme = await getSchoolById(user.schoolId)
    }

    // Set HTTP-only cookie
    const cookieStore = await cookies()

    cookieStore.set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    })

    // Also set a simple authentication flag for client-side checks
    cookieStore.set("isAuthenticated", "true", {
      httpOnly: false, // This one can be read by client
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    })

    const response = NextResponse.json({
      success: true,
      message: "Login successful",
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        schoolId: user.schoolId,
        schoolName: user.schoolName,
      },
      schoolTheme,
    })

    return response
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ success: false, message: "An error occurred during login" }, { status: 500 })
  }
}
