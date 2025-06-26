import { type NextRequest, NextResponse } from "next/server"
import { getSubmissions, createSubmission } from "@/lib/db/iso"
import { verifyToken } from "@/lib/auth-utils"
import { trackAction } from "@/lib/gamification-tracker"

export async function GET(request: NextRequest) {
  try {
    

    const authResult = await verifyToken(request)
   

    if (!authResult.success || !authResult.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const filters: any = {}

    if (searchParams.get("status")) filters.status = searchParams.get("status")
    if (searchParams.get("schoolId")) filters.schoolId = searchParams.get("schoolId")
    if (searchParams.get("clauseId")) filters.clauseId = searchParams.get("clauseId")

    // If school admin, only show their submissions
    if (authResult.user.role === "school-admin") {
      filters.schoolId = authResult.user.schoolId
    }

    const result = await getSubmissions(filters)

    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to fetch submissions",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {

    const authResult = await verifyToken(request)
    if (!authResult.success || !authResult.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const data = await request.json()
    const { clauseId, documents } = data

    if (!clauseId || !documents) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const submission = await createSubmission({
      clauseId,
      schoolId: authResult.user.schoolId || "",
      documents,
      submittedBy: authResult.user.id,
    })

    // Track gamification action
    await trackAction(authResult.user.id, "iso_submission", {
      submissionId: submission.id,
      clauseId,
      documentCount: documents.length,
    })

    return NextResponse.json(submission, { status: 201 })
  } catch (error) {
    console.error("Error creating submission:", error)
    return NextResponse.json(
      {
        error: "Failed to create submission",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
