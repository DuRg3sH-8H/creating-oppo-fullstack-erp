import { type NextRequest, NextResponse } from "next/server"
import { getSchoolById } from "@/lib/db/schools"

export async function GET(request: NextRequest, { params }: { params: Promise<{ schoolId: string }> }) {
  try {
    const { schoolId } = await params
    const school = await getSchoolById(schoolId)

    if (!school) {
      return NextResponse.json({ error: "School not found" }, { status: 404 })
    }

    return NextResponse.json({
      theme: school.theme || {
        primary: "#3b82f6",
        secondary: "#64748b",
        accent: "#10b981",
        background: "#ffffff",
        foreground: "#0f172a",
      },
    })
  } catch (error) {
    console.error("Error fetching school theme:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
