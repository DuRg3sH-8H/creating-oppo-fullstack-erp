import { type NextRequest, NextResponse } from "next/server"
import { updateUserAvatar } from "@/lib/db/users"
import { verifyToken } from "@/lib/jwt"
import { writeFile, mkdir } from "fs/promises"
import path from "path"

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get("auth-token")?.value

    if (!token) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get("avatar") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "File must be an image" }, { status: 400 })
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "File size must be less than 5MB" }, { status: 400 })
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(process.cwd(), "public", "uploads", "avatars")
    await mkdir(uploadsDir, { recursive: true })

    // Generate unique filename
    const fileExtension = path.extname(file.name)
    const fileName = `${decoded.userId}-${Date.now()}${fileExtension}`
    const filePath = path.join(uploadsDir, fileName)

    // Save file
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filePath, buffer)

    // Update user avatar URL
    const avatarUrl = `/uploads/avatars/${fileName}`
    await updateUserAvatar(decoded.userId, avatarUrl)

    return NextResponse.json({
      message: "Avatar uploaded successfully",
      avatarUrl,
    })
  } catch (error) {
    console.error("Error in POST /api/profile/avatar:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to upload avatar" },
      { status: 500 },
    )
  }
}
