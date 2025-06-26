import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { verifyToken } from "@/lib/jwt"
import { findUserById } from "@/lib/db/users"
import { completeTaskForUser as completeTask } from "@/lib/db/gamification"

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("auth-token")

    if (!token) {
      return NextResponse.json({ success: false, message: "Not authenticated" }, { status: 401 })
    }

    const decoded = verifyToken(token.value)
    if (!decoded || typeof decoded !== "object" || !decoded.id) {
      return NextResponse.json({ success: false, message: "Invalid token" }, { status: 401 })
    }

    const user = await findUserById(decoded.id)
    if (!user) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 })
    }

    const { taskType, metadata } = await request.json()

    if (!taskType) {
      return NextResponse.json({ success: false, message: "Task type is required" }, { status: 400 })
    }

    const result = await completeTask(user._id.toString(), taskType, metadata)

    return NextResponse.json({
      success: true,
      data: result,
    })
  } catch (error) {
    console.error("Complete task error:", error)
    return NextResponse.json({ success: false, message: "An error occurred" }, { status: 500 })
  }
}
