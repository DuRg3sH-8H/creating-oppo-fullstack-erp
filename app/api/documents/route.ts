import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { DocumentService } from "@/lib/db/documents"
import { verifyToken } from "@/lib/auth-utils"

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const authResult = await verifyToken(request)
    if (!authResult.success || !authResult.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { user } = authResult
    const { searchParams } = new URL(request.url)

    // Extract query parameters
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const category = searchParams.get("category") || "all"
    const search = searchParams.get("search") || ""
    const fileType = searchParams.get("fileType") || ""
    const dateFrom = searchParams.get("dateFrom")
    const dateTo = searchParams.get("dateTo")

    await connectToDatabase()

    // Get documents with proper permissions
    const result = await DocumentService.getDocuments({
      page,
      limit,
      category: category !== "all" ? category : undefined,
      search: search || undefined,
      schoolId: user.schoolId,
      userRole: user.role,
      dateFrom: dateFrom ? new Date(dateFrom) : undefined,
      dateTo: dateTo ? new Date(dateTo) : undefined,
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error fetching documents:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
