import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { DocumentService } from "@/lib/db/documents"
import { verifyToken } from "@/lib/auth-utils"
import { unlink } from "fs/promises"
import { join } from "path"

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

    return NextResponse.json(document)
  } catch (error) {
    console.error("Error fetching document:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Use the verifyToken function that works with cookies
    const authResult = await verifyToken(request)
    if (!authResult.success || !authResult.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { user } = authResult

    // Only super-admin and school-admin can update documents
    if (!["super-admin", "school"].includes(user.role)) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 })
    }

    const updates = await request.json()

    await connectToDatabase()
    const document = await DocumentService.updateDocument(params.id, updates, user.role, user.schoolId || "")

    if (!document) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 })
    }

    return NextResponse.json(document)
  } catch (error) {
    console.error("Error updating document:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Use the verifyToken function that works with cookies
    const authResult = await verifyToken(request)
    if (!authResult.success || !authResult.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { user } = authResult

    // Only super-admin and school-admin can delete documents
    if (!["super-admin", "school"].includes(user.role)) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 })
    }

    await connectToDatabase()
    const document = await DocumentService.getDocumentById(params.id, user.role, user.schoolId)

    if (!document) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 })
    }

    // Delete the physical file
    try {
      const filePath = join(process.cwd(), "public", document.filePath)
      await unlink(filePath)
    } catch (fileError) {
      console.warn("Could not delete physical file:", fileError)
      // Continue with database deletion even if file deletion fails
    }

    // Delete from database
    const deleted = await DocumentService.deleteDocument(params.id, user.role, user.schoolId || "")

    if (!deleted) {
      return NextResponse.json({ error: "Failed to delete document" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting document:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
