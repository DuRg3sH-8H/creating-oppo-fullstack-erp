import { type NextRequest, NextResponse } from "next/server"
import { getAllSchools, createSchool } from "@/lib/db/schools"
import { verifyToken } from "@/lib/jwt"

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const token = request.cookies.get("auth-token")?.value
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded || decoded.role !== "super-admin") {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 })
    }

    // Check if we should include inactive schools
    const { searchParams } = new URL(request.url)
    const includeInactive = searchParams.get("includeInactive") === "true"

    const schools = await getAllSchools(includeInactive)

    // Transform schools to match frontend interface
    const transformedSchools = schools.map((school) => ({
      id: school._id?.toString() || school.id,
      name: school.name,
      logo: school.logo || "/placeholder.svg?height=80&width=80",
      primaryColor: school.theme.primary,
      secondaryColor: school.theme.secondary,
      accentColor: school.theme.accent,
      darkColor: school.theme.foreground,
      address: school.address,
      email: school.email,
      phone: school.phone,
      website: school.website,
      established: school.createdAt ? new Date(school.createdAt).getFullYear().toString() : "",
      isActive: school.isActive,
    }))

    return NextResponse.json({ schools: transformedSchools })
  } catch (error) {
    console.error("Error fetching schools:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const token = request.cookies.get("auth-token")?.value
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded || decoded.role !== "super-admin") {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 })
    }

    const body = await request.json()

    // Validate required fields
    if (!body.name || !body.primaryColor || !body.secondaryColor || !body.accentColor || !body.darkColor) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const schoolData = {
      id: `school_${Date.now()}`,
      name: body.name,
      address: body.address || "",
      phone: body.phone || "",
      email: body.email || "",
      website: body.website || "",
      logo: body.logo || "/placeholder.svg?height=80&width=80", // Now saves the actual uploaded URL
      theme: {
        primary: body.primaryColor,
        secondary: body.secondaryColor,
        accent: body.accentColor,
        background: body.backgroundColor || "#ffffff",
        foreground: body.darkColor,
      },
      isActive: true,
    }

    const result = await createSchool(schoolData)

    if (!result.insertedId) {
      return NextResponse.json({ error: "Failed to create school" }, { status: 500 })
    }

    // Return the created school in the expected format
    const createdSchool = {
      id: result.insertedId.toString(),
      name: schoolData.name,
      logo: schoolData.logo, // Returns the actual server URL
      primaryColor: schoolData.theme.primary,
      secondaryColor: schoolData.theme.secondary,
      accentColor: schoolData.theme.accent,
      darkColor: schoolData.theme.foreground,
      address: schoolData.address,
      email: schoolData.email,
      phone: schoolData.phone,
      website: schoolData.website,
      established: new Date().getFullYear().toString(),
      isActive: true,
    }

    return NextResponse.json(
      {
        message: "School created successfully",
        school: createdSchool,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Error creating school:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
