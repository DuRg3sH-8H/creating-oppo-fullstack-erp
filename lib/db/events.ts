import { connectToDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function getEvents(schoolId: any) {
  try {
    const { db } = await connectToDatabase()
    const events = await db.collection("events").find({}).sort({ date: 1 }).toArray()

    return events.map((event) => ({
      ...event,
      id: event._id.toString(),
      _id: undefined,
    }))
  } catch (error) {
    console.error("Error fetching events:", error)
    throw error
  }
}

export async function createEvent(eventData: any) {
  try {
    const { db } = await connectToDatabase()

    const event = {
      ...eventData,
      date: new Date(eventData.date),
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await db.collection("events").insertOne(event)

    return {
      ...event,
      id: result.insertedId.toString(),
      _id: undefined,
    }
  } catch (error) {
    console.error("Error creating event:", error)
    throw error
  }
}

export async function updateEvent(id: string, eventData: any) {
  try {
    const { db } = await connectToDatabase()

    const updateData = {
      ...eventData,
      date: new Date(eventData.date),
      updatedAt: new Date(),
    }

    await db.collection("events").updateOne({ _id: new ObjectId(id) }, { $set: updateData })

    return { success: true }
  } catch (error) {
    console.error("Error updating event:", error)
    throw error
  }
}

export async function deleteEvent(id: string) {
  try {
    const { db } = await connectToDatabase()

    // Delete event and its registrations
    await db.collection("events").deleteOne({ _id: new ObjectId(id) })
    await db.collection("event_registrations").deleteMany({ eventId: id })

    return { success: true }
  } catch (error) {
    console.error("Error deleting event:", error)
    throw error
  }
}

export async function getEventRegistrations(eventId: string) {
  try {
    const { db } = await connectToDatabase()

    const registrations = await db
      .collection("event_registrations")
      .find({ eventId })
      .sort({ registeredAt: -1 })
      .toArray()

    return registrations.map((reg) => ({
      ...reg,
      id: reg._id.toString(),
      _id: undefined,
    }))
  } catch (error) {
    console.error("Error fetching event registrations:", error)
    throw error
  }
}

export async function registerForEvent(eventId: string, schoolId: string, schoolName: string, registeredBy: string) {
  try {
    const { db } = await connectToDatabase()

    // Check if already registered
    const existing = await db.collection("event_registrations").findOne({
      eventId,
      schoolId,
    })

    if (existing) {
      throw new Error("School already registered for this event")
    }

    const registration = {
      eventId,
      schoolId,
      schoolName,
      registeredBy,
      registeredAt: new Date(),
      status: "pending",
    }

    const result = await db.collection("event_registrations").insertOne(registration)

    return {
      ...registration,
      id: result.insertedId.toString(),
      _id: undefined,
    }
  } catch (error) {
    console.error("Error registering for event:", error)
    throw error
  }
}

export async function unregisterFromEvent(eventId: string, schoolId: string) {
  try {
    const { db } = await connectToDatabase()

    await db.collection("event_registrations").deleteOne({
      eventId,
      schoolId,
    })

    return { success: true }
  } catch (error) {
    console.error("Error unregistering from event:", error)
    throw error
  }
}

export async function updateRegistrationStatus(registrationId: string, status: string, notes?: string) {
  try {
    const { db } = await connectToDatabase()

    await db.collection("event_registrations").updateOne(
      { _id: new ObjectId(registrationId) },
      {
        $set: {
          status,
          notes: notes || "",
          updatedAt: new Date(),
        },
      },
    )

    return { success: true }
  } catch (error) {
    console.error("Error updating registration status:", error)
    throw error
  }
}

export async function registerForClub(clubId: string, schoolId: string, schoolName: string, registeredBy: string) {
  try {
    const { db } = await connectToDatabase()

    // Check if already registered
    const existing = await db.collection("club_registrations").findOne({
      clubId,
      schoolId,
    })

    if (existing) {
      throw new Error("School already registered for this club")
    }

    const registration = {
      id: new ObjectId().toString(),
      schoolId,
      schoolName,
      schoolLogo: "/placeholder.svg?height=40&width=40",
      participantCount: 1,
      notes: "",
      status: "pending",
      registrationDate: new Date().toISOString(),
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    // Insert into separate collection instead of pushing to club document
    const result = await db.collection("club_registrations").insertOne({
      ...registration,
      clubId,
      registeredBy,
    })

    return {
      ...registration,
      id: result.insertedId.toString(),
    }
  } catch (error) {
    console.error("Error registering for club:", error)
    throw error
  }
}

export async function getClubRegistrations(clubId: string) {
  try {
    const { db } = await connectToDatabase()

    const registrations = await db.collection("club_registrations").find({ clubId }).sort({ createdAt: -1 }).toArray()

    return registrations.map((reg) => ({
      ...reg,
      id: reg._id.toString(),
      _id: undefined,
    }))
  } catch (error) {
    console.error("Error fetching club registrations:", error)
    throw error
  }
}

export async function unregisterFromClub(clubId: string, schoolId: string) {
  try {
    const { db } = await connectToDatabase()

    await db.collection("club_registrations").deleteOne({
      clubId,
      schoolId,
    })

    return { success: true }
  } catch (error) {
    console.error("Error unregistering from club:", error)
    throw error
  }
}
