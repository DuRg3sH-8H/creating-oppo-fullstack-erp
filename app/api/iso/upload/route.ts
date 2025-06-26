import { type NextRequest, NextResponse } from "next/server"
import { writeFile, mkdir } from "fs/promises"
import { join } from "path"
import { verifyToken } from "@/lib/auth-utils"

export async function POST(request: NextRequest) {
  try {
    const authResult = await verifyToken(request)
    if (!authResult.success || !authResult.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const formData = await request.formData()
    const files = formData.getAll("files") as File[]
    const type = formData.get("type") as string // 'submission' or 'guideline'

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "No files provided" }, { status: 400 })
    }

    const uploadedFiles = []
    const uploadDir = join(process.cwd(), "public", "uploads", "iso", type)

    // Ensure upload directory exists
    try {
      await mkdir(uploadDir, { recursive: true })
    } catch (error) {
      // Directory might already exist
    }

    for (const file of files) {
      if (file.size === 0) continue

      // Generate unique filename
      const timestamp = Date.now()
      const filename = `${timestamp}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`
      const filepath = join(uploadDir, filename)

      // Write file to disk
      const bytes = await file.arrayBuffer()
      await writeFile(filepath, new Uint8Array(bytes))

      // Create file info
      const fileInfo = {
        name: file.name,
        fileUrl: `/uploads/iso/${type}/${filename}`,
        fileType: file.type,
        size: formatFileSize(file.size),
        uploadedBy: authResult.user.id,
        uploadedAt: new Date().toISOString(),
      }

      uploadedFiles.push(fileInfo)
    }

    return NextResponse.json({ files: uploadedFiles })
  } catch (error) {
    console.error("Error uploading files:", error)
    return NextResponse.json({ error: "Failed to upload files" }, { status: 500 })
  }
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes"
  const k = 1024
  const sizes = ["Bytes", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
}
