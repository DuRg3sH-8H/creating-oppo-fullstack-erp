import clientPromise from "../mongodb"
import { ObjectId } from "mongodb"

export interface SchoolTheme {
  primary: string
  secondary: string
  accent: string
  background: string
  foreground: string
}

export interface School {
  _id?: ObjectId
  id: string
  name: string
  address: string
  phone: string
  email: string
  website?: string
  logo?: string
  theme: SchoolTheme
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

async function getSchoolsCollection() {
  const client = await clientPromise
  const db = client.db(process.env.MONGODB_DB || "school_erp")
  return db.collection<School>("schools")
}

export async function getSchoolById(schoolId: string) {
  const collection = await getSchoolsCollection()
  const school = await collection.findOne({
    $or: [{ _id: new ObjectId(schoolId) }, { id: schoolId }],
  })
  return school
}

export async function getAllSchools(includeInactive = false) {
  const collection = await getSchoolsCollection()
  const filter = includeInactive ? {} : { isActive: true }
  const schools = await collection.find(filter).sort({ name: 1 }).toArray()
  return schools
}

export async function createSchool(schoolData: Omit<School, "_id" | "createdAt" | "updatedAt">) {
  const collection = await getSchoolsCollection()

  const now = new Date()
  const result = await collection.insertOne({
    ...schoolData,
    createdAt: now,
    updatedAt: now,
  })

  return result
}

export async function updateSchool(schoolId: string, updateData: Partial<School>) {
  const collection = await getSchoolsCollection()

  const result = await collection.updateOne(
    { $or: [{ _id: new ObjectId(schoolId) }, { id: schoolId }] },
    {
      $set: {
        ...updateData,
        updatedAt: new Date(),
      },
    },
  )

  return result
}

export async function deleteSchool(schoolId: string, hardDelete = false) {
  const collection = await getSchoolsCollection()

  if (hardDelete) {
    // Permanently delete from database
    const result = await collection.deleteOne({
      $or: [{ _id: new ObjectId(schoolId) }, { id: schoolId }],
    })
    return result
  } else {
    // Soft delete by setting isActive to false
    const result = await collection.updateOne(
      { $or: [{ _id: new ObjectId(schoolId) }, { id: schoolId }] },
      {
        $set: {
          isActive: false,
          updatedAt: new Date(),
        },
      },
    )
    return result
  }
}

export async function toggleSchoolStatus(schoolId: string) {
  const collection = await getSchoolsCollection()

  try {
    // First get the current status
    const school = await collection.findOne({
      $or: [{ _id: new ObjectId(schoolId) }, { id: schoolId }],
    })

    if (!school) {
      return { success: false, error: "School not found" }
    }

    const newStatus = !school.isActive

    // Update the status
    const result = await collection.updateOne(
      { $or: [{ _id: new ObjectId(schoolId) }, { id: schoolId }] },
      {
        $set: {
          isActive: newStatus,
          updatedAt: new Date(),
        },
      },
    )

    if (result.modifiedCount > 0) {
      return { success: true, isActive: newStatus }
    } else {
      return { success: false, error: "Failed to update school status" }
    }
  } catch (error) {
    console.error("Error toggling school status:", error)
    return { success: false, error: "Database error" }
  }
}

export async function getSchoolTheme(schoolId: string) {
  const school = await getSchoolById(schoolId)
  return school?.theme || null
}
