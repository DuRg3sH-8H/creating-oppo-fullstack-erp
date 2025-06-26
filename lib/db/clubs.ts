import { MongoClient, type Db, type Collection } from "mongodb"
import type { ClubModel, ClubActivity, SchoolRegistration } from "@/models/club"

let client: MongoClient
let db: Db
let clubs: Collection<ClubModel>

async function connectToDatabase() {
  if (!client) {
    client = new MongoClient(process.env.MONGODB_URI!)
    await client.connect()
  }

  if (!db) {
    db = client.db(process.env.MONGODB_DB)
    clubs = db.collection<ClubModel>("clubs")

    // Create indexes
    await clubs.createIndex({ name: 1 })
    await clubs.createIndex({ category: 1 })
    await clubs.createIndex({ status: 1 })
    await clubs.createIndex({ leadTeacher: 1 })
    await clubs.createIndex({ createdAt: -1 })
  }

  return { db, clubs }
}

export async function getAllClubs(filters?: {
  category?: string
  status?: string
  search?: string
}) {
  const { clubs } = await connectToDatabase()

  const query: any = {}

  if (filters?.category && filters.category !== "all") {
    query.category = filters.category
  }

  if (filters?.status && filters.status !== "all") {
    query.status = filters.status
  }

  if (filters?.search) {
    query.$or = [
      { name: { $regex: filters.search, $options: "i" } },
      { description: { $regex: filters.search, $options: "i" } },
      { leadTeacher: { $regex: filters.search, $options: "i" } },
      { category: { $regex: filters.search, $options: "i" } },
    ]
  }

  const clubsList = await clubs.find(query).sort({ createdAt: -1 }).toArray()

  return clubsList.map((club) => ({
    ...club,
    _id: club._id?.toString(),
  }))
}

export async function getClubById(id: string) {
  const { clubs } = await connectToDatabase()

  const club = await clubs.findOne({ id })

  if (!club) {
    return null
  }

  return {
    ...club,
    _id: club._id?.toString(),
  }
}

export async function createClub(clubData: Omit<ClubModel, "_id" | "createdAt" | "updatedAt">) {
  const { clubs } = await connectToDatabase()

  const newClub: ClubModel = {
    ...clubData,
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  const result = await clubs.insertOne(newClub)

  return {
    ...newClub,
    _id: result.insertedId.toString(),
  }
}

export async function updateClub(id: string, updates: Partial<ClubModel>) {
  const { clubs } = await connectToDatabase()

  const updateData = {
    ...updates,
    updatedAt: new Date(),
  }

  const result = await clubs.updateOne({ id }, { $set: updateData })

  if (result.matchedCount === 0) {
    return null
  }

  return await getClubById(id)
}

export async function deleteClub(id: string) {
  const { clubs } = await connectToDatabase()

  const result = await clubs.deleteOne({ id })

  return result.deletedCount > 0
}

export async function addClubActivity(clubId: string, activity: Omit<ClubActivity, "createdAt" | "updatedAt">) {
  const { clubs } = await connectToDatabase()

  const newActivity: ClubActivity = {
    ...activity,
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  const result = await clubs.updateOne(
    { id: clubId },
    {
      $push: { activities: newActivity },
      $inc: { totalActivities: 1 },
      $set: { updatedAt: new Date() },
    },
  )

  return result.matchedCount > 0
}

export async function updateClubActivity(clubId: string, activityId: string, updates: Partial<ClubActivity>) {
  const { clubs } = await connectToDatabase()

  const updateData = {
    ...updates,
    updatedAt: new Date(),
  }

  const result = await clubs.updateOne(
    { id: clubId, "activities.id": activityId },
    {
      $set: {
        "activities.$": { ...updateData },
        updatedAt: new Date(),
      },
    },
  )

  return result.matchedCount > 0
}

export async function deleteClubActivity(clubId: string, activityId: string) {
  const { clubs } = await connectToDatabase()

  const result = await clubs.updateOne(
    { id: clubId },
    {
      $pull: { activities: { id: activityId } },
      $inc: { totalActivities: -1 },
      $set: { updatedAt: new Date() },
    },
  )

  return result.matchedCount > 0
}

export async function registerSchoolForClub(
  clubId: string,
  registration: Omit<SchoolRegistration, "createdAt" | "updatedAt">,
) {
  const { clubs } = await connectToDatabase()

  const newRegistration: SchoolRegistration = {
    ...registration,
    status: "pending",
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  const result = await clubs.updateOne(
    { id: clubId },
    {
      $push: { registrations: newRegistration },
      $set: { updatedAt: new Date() },
    },
  )

  return result.matchedCount > 0
}

export async function updateSchoolRegistration(
  clubId: string,
  registrationId: string,
  updates: Partial<SchoolRegistration>,
) {
  const { clubs } = await connectToDatabase()

  const updateData = {
    ...updates,
    updatedAt: new Date(),
  }

  const result = await clubs.updateOne(
    { id: clubId, "registrations.id": registrationId },
    {
      $set: {
        "registrations.$": { ...updateData },
        updatedAt: new Date(),
      },
    },
  )

  return result.matchedCount > 0
}

export async function removeSchoolRegistration(clubId: string, registrationId: string) {
  const { clubs } = await connectToDatabase()

  const result = await clubs.updateOne(
    { id: clubId },
    {
      $pull: { registrations: { id: registrationId } },
      $set: { updatedAt: new Date() },
    },
  )

  return result.matchedCount > 0
}

export async function getClubsBySchool(schoolId: string) {
  const { clubs } = await connectToDatabase()

  const clubsList = await clubs
    .find({
      "registrations.schoolId": schoolId,
    })
    .toArray()

  return clubsList.map((club) => ({
    ...club,
    _id: club._id?.toString(),
    isRegistered: true,
  }))
}

export async function getClubStats() {
  const { clubs } = await connectToDatabase()

  const stats = await clubs
    .aggregate([
      {
        $group: {
          _id: null,
          totalClubs: { $sum: 1 },
          openClubs: { $sum: { $cond: [{ $eq: ["$status", "Open"] }, 1, 0] } },
          closedClubs: { $sum: { $cond: [{ $eq: ["$status", "Closed"] }, 1, 0] } },
          comingSoonClubs: { $sum: { $cond: [{ $eq: ["$status", "Coming Soon"] }, 1, 0] } },
          totalActivities: { $sum: "$totalActivities" },
          totalRegistrations: { $sum: { $size: "$registrations" } },
        },
      },
    ])
    .toArray()

  const categoryStats = await clubs
    .aggregate([
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 },
        },
      },
    ])
    .toArray()

  return {
    overview: stats[0] || {
      totalClubs: 0,
      openClubs: 0,
      closedClubs: 0,
      comingSoonClubs: 0,
      totalActivities: 0,
      totalRegistrations: 0,
    },
    byCategory: categoryStats,
  }
}
