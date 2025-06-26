import { type NextRequest, NextResponse } from "next/server"
import { getOverallStats, getAllSchoolsProgress, getSchoolProgress } from "@/lib/db/iso"
import { verifyToken } from "@/lib/auth-utils"

export async function GET(request: NextRequest) {
  try {

    const authResult = await verifyToken(request)
    if (!authResult.success || !authResult.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }


    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type")

    if (authResult.user.role === "super-admin") {
      if (type === "schools") {
        const schoolsProgress = await getAllSchoolsProgress()

        const response = {
          schools: schoolsProgress,
          totalSchools: schoolsProgress.length,
          certifiedSchools: schoolsProgress.filter((s) => s.isCertified).length,
          certificationRate:
            schoolsProgress.length > 0
              ? Math.round((schoolsProgress.filter((s) => s.isCertified).length / schoolsProgress.length) * 100)
              : 0,
          averageProgress:
            schoolsProgress.length > 0
              ? Math.round(schoolsProgress.reduce((acc, s) => acc + s.progress, 0) / schoolsProgress.length)
              : 0,
          totalClauses: schoolsProgress[0]?.totalClauses || 0,
          approvedClauses: schoolsProgress.reduce((acc, s) => acc + s.approvedClauses, 0),
          pendingClauses: schoolsProgress.reduce((acc, s) => acc + s.pendingClauses, 0),
          submittedClauses: schoolsProgress.reduce((acc, s) => acc + s.submittedClauses, 0),
        }

        return NextResponse.json(response)
      } else {
        const overallStats = await getOverallStats()
        return NextResponse.json(overallStats)
      }
    } else {
      // School admin can only see their own progress
      const progress = await getSchoolProgress(authResult.user.schoolId || "")
      return NextResponse.json(progress)
    }
  } catch (error) {
    console.error("Error fetching analytics:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch analytics",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
