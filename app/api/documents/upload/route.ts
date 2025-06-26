import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { DocumentService } from "@/lib/db/documents"
import { verifyToken } from "@/lib/auth-utils"
import { writeFile, mkdir } from "fs/promises"
import { join } from "path"
import { v4 as uuidv4 } from "uuid"

export async function POST(request: NextRequest) {
  try {
    // Verify authentication using cookies
    const authResult = await verifyToken(request)
    if (!authResult.success || !authResult.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { user } = authResult

    // Only super-admin can upload documents
    if (!["super-admin"].includes(user.role)) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 })
    }

    // Parse form data
    let formData: FormData
    try {
      formData = await request.formData()
    } catch (error) {
      console.error("Error parsing form data:", error)
      return NextResponse.json({ error: "Invalid form data" }, { status: 400 })
    }

    const file = formData.get("file") as File
    const name = formData.get("name") as string
    const description = formData.get("description") as string
    const category = formData.get("category") as string
    const version = formData.get("version") as string
    const tags = formData.get("tags") as string
    const isPublic = formData.get("isPublic") === "true"
    const schoolId = user.role === "school" ? user.schoolId : (formData.get("schoolId") as string)

    // Validate required fields
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    if (!name || !description) {
      return NextResponse.json({ error: "Name and description are required" }, { status: 400 })
    }

    // Validate file size (50MB limit)
    const maxSize = 50 * 1024 * 1024 // 50MB
    if (file.size > maxSize) {
      return NextResponse.json({ error: "File size exceeds 50MB limit" }, { status: 400 })
    }

    // Validate file type
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      "image/jpeg",
      "image/png",
      "image/gif",
      "text/plain",
    ]

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        {
          error: "File type not supported. Please upload PDF, Word, Excel, PowerPoint, image, or text files.",
        },
        { status: 400 },
      )
    }

    // Create upload directory
    const uploadDir = join(process.cwd(), "public", "uploads", "documents")
    try {
      await mkdir(uploadDir, { recursive: true })
    } catch (error) {
      console.error("Error creating upload directory:", error)
      return NextResponse.json({ error: "Failed to create upload directory" }, { status: 500 })
    }

    // Generate unique filename
    const fileExtension = file.name.split(".").pop() || ""
    const uniqueFilename = `${uuidv4()}.${fileExtension}`
    const filePath = join(uploadDir, uniqueFilename)

    // Save file to disk
    try {
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)
      await writeFile(filePath, buffer)
    } catch (error) {
      console.error("Error saving file:", error)
      return NextResponse.json({ error: "Failed to save file" }, { status: 500 })
    }

    // Save document metadata to database
    try {
      await connectToDatabase()
      const document = await DocumentService.createDocument({
        name: name.trim(),
        description: description.trim(),
        originalName: file.name,
        fileName: uniqueFilename,
        filePath: `/uploads/documents/${uniqueFilename}`,
        fileSize: file.size,
        fileType: fileExtension,
        mimeType: file.type,
        category: category as any,
        version: version || "1.0",
        tags: tags
          ? tags
              .split(",")
              .map((tag) => tag.trim())
              .filter(Boolean)
          : [],
        isPublic: isPublic,
        
        uploadedBy: {
          id: user.id,
          name: user.name,
          role: user.role,
        },
      })

      return NextResponse.json(
        {
          success: true,
          message: "Document uploaded successfully",
          document,
        },
        { status: 201 },
      )
    } catch (error) {
      console.error("Error saving document to database:", error)

      // Try to clean up the uploaded file if database save fails
      try {
        const fs = require("fs").promises
        await fs.unlink(filePath)
      } catch (cleanupError) {
        console.error("Error cleaning up file:", cleanupError)
      }

      return NextResponse.json({ error: "Failed to save document metadata" }, { status: 500 })
    }
  } catch (error) {
    console.error("Error in document upload:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
