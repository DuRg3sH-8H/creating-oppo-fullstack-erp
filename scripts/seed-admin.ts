const { MongoClient, ServerApiVersion } = require("mongodb")
const bcrypt = require("bcryptjs")
require("dotenv").config({ path: ".env.local" })

async function seedSuperAdmin() {
  if (!process.env.MONGODB_URI) {
    console.error("Please add your MongoDB URI to .env.local")
    return
  }

  const uri = process.env.MONGODB_URI
  const dbName = process.env.MONGODB_DB || "school_erp"

  const client = new MongoClient(uri, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    },
  })

  try {
    await client.connect()
    console.log("Connected to MongoDB")

    const db = client.db(dbName)
    const usersCollection = db.collection("users")

    // Check if super admin already exists
    const existingSuperAdmin = await usersCollection.findOne({ role: "super-admin" })

    if (existingSuperAdmin) {
      console.log("Super admin already exists")
      return
    }

    // Create super admin user
    const hashedPassword = await bcrypt.hash("admin123", 10)
    const now = new Date()

    const superAdmin = {
      name: "Super Admin",
      email: "admin@schoolerp.com",
      password: hashedPassword,
      role: "super-admin",
      avatar: "/placeholder.svg?height=40&width=40",
      isActive: true,
      createdAt: now,
      updatedAt: now,
    }

    const result = await usersCollection.insertOne(superAdmin)
    console.log(`Super admin created with ID: ${result.insertedId}`)

    // Seed sample schools
    const schoolsCollection = db.collection("schools")
    const schoolCount = await schoolsCollection.countDocuments()

    if (schoolCount === 0) {
      const sampleSchools = [
        {
          name: "Greenfield International School",
          logo: "/placeholder.svg?height=80&width=80",
          primaryColor: "#2563eb",
          secondaryColor: "#1d4ed8",
          accentColor: "#3b82f6",
          darkColor: "#1e40af",
          createdAt: now,
          updatedAt: now,
        },
        {
          name: "Riverside Academy",
          logo: "/placeholder.svg?height=80&width=80",
          primaryColor: "#059669",
          secondaryColor: "#047857",
          accentColor: "#10b981",
          darkColor: "#065f46",
          createdAt: now,
          updatedAt: now,
        },
        {
          name: "Sunnydale High School",
          logo: "/placeholder.svg?height=80&width=80",
          primaryColor: "#d97706",
          secondaryColor: "#b45309",
          accentColor: "#f59e0b",
          darkColor: "#92400e",
          createdAt: now,
          updatedAt: now,
        },
      ]

      const schoolResult = await schoolsCollection.insertMany(sampleSchools)
      console.log(`${schoolResult.insertedCount} sample schools created`)
    }
  } catch (error) {
    console.error("Error seeding database:", error)
  } finally {
    await client.close()
    console.log("MongoDB connection closed")
  }
}

seedSuperAdmin()
