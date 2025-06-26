import { type NextRequest, NextResponse } from "next/server"
import { updateRegistrationStatus } from "@/lib/db/events"
import { verifyToken } from "@/lib/jwt"
import { connectToDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function PATCH(request: NextRequest, { params }: { params: { id: string; registrationId: string } }) {
  try {
    const token = request.cookies.get("auth-token")?.value

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded || decoded.role !== "super-admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { status, notes } = await request.json()

    await updateRegistrationStatus(params.registrationId, status, notes)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating registration status:", error)
    return NextResponse.json({ error: "Failed to update registration status" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string; registrationId: string } }) {
  try {
    const token = request.cookies.get("auth-token")?.value

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Get the registration to find the schoolId
    const { db } = await connectToDatabase()
    const registration = await db.collection("event_registrations").findOne({
      _id: new ObjectId(params.registrationId),
    })

    if (!registration) {
      return NextResponse.json({ error: "Registration not found" }, { status: 404 })
    }

    // Delete the registration directly by ID
    await db.collection("event_registrations").deleteOne({
      _id: new ObjectId(params.registrationId),
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error unregistering from event:", error)
    return NextResponse.json({ error: "Failed to unregister from event" }, { status: 500 })
  }
}
