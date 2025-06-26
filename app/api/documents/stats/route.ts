import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { DocumentService } from "@/lib/db/documents"
import { verifyToken } from "@/lib/auth-utils"

export async function GET(request: NextRequest) {
  try {
    // Use the verifyToken function that works with cookies
    const authResult = await verifyToken(request)
    if (!authResult.success || !authResult.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { user } = authResult
    const { searchParams } = new URL(request.url)
    const schoolId = user.role === "school" ? user.schoolId : searchParams.get("schoolId") || undefined

    await connectToDatabase()
    const stats = await DocumentService.getDocumentStats(schoolId, user.role)

    return NextResponse.json(stats)
  } catch (error) {
    console.error("Error fetching document stats:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
