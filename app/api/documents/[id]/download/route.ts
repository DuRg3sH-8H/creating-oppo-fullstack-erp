import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { DocumentService } from "@/lib/db/documents"
import { verifyToken } from "@/lib/auth-utils"
import { readFile } from "fs/promises"
import { join } from "path"
import { existsSync } from "fs"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Use the verifyToken function that works with cookies
    const authResult = await verifyToken(request)
    if (!authResult.success || !authResult.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { user } = authResult
    await connectToDatabase()
    const document = await DocumentService.getDocumentById(params.id, user.role, user.schoolId)

    if (!document) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 })
    }

    // Check download permissions based on user role and document visibility
    const canDownload = checkDownloadPermission(user, document)

    if (!canDownload) {
      return NextResponse.json(
        { error: "Access denied - insufficient permissions to download this document" },
        { status: 403 },
      )
    }

    // Construct file path
    const filePath = join(process.cwd(), "public", document.filePath)

    // Check if file exists
    if (!existsSync(filePath)) {
      console.error("File not found at path:", filePath)
      return NextResponse.json({ error: "File not found on server" }, { status: 404 })
    }

    try {
      // Read the file
      const fileBuffer = await readFile(filePath)

      // Update download count
      await DocumentService.incrementDownloadCount(params.id)

      // Return the file with appropriate headers
      return new NextResponse(fileBuffer, {
        headers: {
          "Content-Type": document.mimeType || "application/octet-stream",
          "Content-Disposition": `attachment; filename="${encodeURIComponent(document.originalName)}"`,
          "Content-Length": fileBuffer.length.toString(),
          "Cache-Control": "no-cache",
        },
      })
    } catch (fileError) {
      console.error("Error reading file:", fileError)
      return NextResponse.json({ error: "Error reading file" }, { status: 500 })
    }
  } catch (error) {
    console.error("Error downloading document:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// Helper function to check download permissions
function checkDownloadPermission(user: any, document: any): boolean {
  // Super admin can download everything
  if (user.role === "super-admin") {
    return true
  }

  // If document is public, anyone can download
  if (document.isPublic) {
    return true
  }

  // School admin can download documents from their school
  if (user.role === "school" && user.schoolId && document.schoolId === user.schoolId) {
    return true
  }

 

  // ECA admin can download documents from their school
  if (user.role === "eca" && user.schoolId && document.schoolId === user.schoolId) {
    return true
  }

  // Default: deny access
  return false
}
