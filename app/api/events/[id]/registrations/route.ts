import { type NextRequest, NextResponse } from "next/server"
import { getEventRegistrations, registerForEvent, unregisterFromEvent } from "@/lib/db/events"
import { verifyToken } from "@/lib/jwt"
import { connectToDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = request.cookies.get("auth-token")?.value

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const registrations = await getEventRegistrations(params.id)
    return NextResponse.json(registrations)
  } catch (error) {
    console.error("Error fetching event registrations:", error)
    return NextResponse.json({ error: "Failed to fetch registrations" }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = request.cookies.get("auth-token")?.value

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded || decoded.role !== "school") {
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

    const registration = await registerForEvent(params.id, schoolId, schoolName, decoded.userId)

    return NextResponse.json(registration, { status: 201 })
  } catch (error) {
    console.error("Error registering for event:", error)
    if (error instanceof Error && error.message === "School already registered for this event") {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    return NextResponse.json({ error: "Failed to register for event" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = request.cookies.get("auth-token")?.value

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded || decoded.role !== "school") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Get the user's school information
    const { db } = await connectToDatabase()
    const user = await db.collection("users").findOne({ _id: new ObjectId(decoded.userId) })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const schoolId = user.schoolId || decoded.userId

    await unregisterFromEvent(params.id, schoolId)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error unregistering from event:", error)
    return NextResponse.json({ error: "Failed to unregister from event" }, { status: 500 })
  }
}
