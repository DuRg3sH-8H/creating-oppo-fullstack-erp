import { type NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/jwt"
import { connectToDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"
import { registerForClub } from "@/lib/db/events"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = request.cookies.get("auth-token")?.value

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Get the user's school information from the database
    const { db } = await connectToDatabase()
    const user = await db.collection("users").findOne({ _id: new ObjectId(decoded.userId) })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Get school information
    let schoolName = "Unknown School"
    let schoolId = user.schoolId || decoded.userId

    if (user.schoolId) {
      const school = await db.collection("schools").findOne({ _id: new ObjectId(user.schoolId) })
      if (school) {
        schoolName = school.name
        schoolId = school._id.toString()
      }
    }

    const registration = await registerForClub(params.id, schoolId, schoolName, decoded.userId)

    return NextResponse.json(registration, { status: 201 })
  } catch (error) {
    console.error("Error registering for club:", error)
    if (error instanceof Error && error.message === "School already registered for this club") {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    return NextResponse.json({ error: "Failed to register for club" }, { status: 500 })
  }
}
