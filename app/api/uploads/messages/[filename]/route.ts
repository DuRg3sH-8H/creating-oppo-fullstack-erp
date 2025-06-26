import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { verifyToken } from "@/lib/jwt"
import { readFile } from "fs/promises"
import { join } from "path"
import { existsSync } from "fs"

export async function GET(_request: NextRequest, { params }: { params: { filename: string } }) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("auth-token")

    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const decoded = verifyToken(token.value)
    if (!decoded || typeof decoded !== "object" || (!decoded.userId && !decoded.id)) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const filename = params.filename
    const filePath = join(process.cwd(), "public", "uploads", "messages", filename)

    if (!existsSync(filePath)) {
      return NextResponse.json({ error: "File not found" }, { status: 404 })
    }

    const fileBuffer = await readFile(filePath)
    const fileExtension = filename.split(".").pop()?.toLowerCase()

    // Determine content type
    let contentType = "application/octet-stream"
    switch (fileExtension) {
      case "jpg":
      case "jpeg":
        contentType = "image/jpeg"
        break
      case "png":
        contentType = "image/png"
        break
      case "gif":
        contentType = "image/gif"
        break
      case "webp":
        contentType = "image/webp"
        break
      case "pdf":
        contentType = "application/pdf"
        break
      case "doc":
        contentType = "application/msword"
        break
      case "docx":
        contentType = "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        break
      case "xls":
        contentType = "application/vnd.ms-excel"
        break
      case "xlsx":
        contentType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        break
      case "txt":
        contentType = "text/plain"
        break
      case "csv":
        contentType = "text/csv"
        break
    }

    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `inline; filename="${filename}"`,
        "Cache-Control": "public, max-age=31536000",
      },
    })
  } catch (error) {
    console.error("Error serving file:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
