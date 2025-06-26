const { MongoClient } = require("mongodb")
require("dotenv").config({ path: ".env.local" })

if (!process.env.MONGODB_URI) {
  throw new Error('Invalid/Missing environment variable: "MONGODB_URI"')
}

const PREDEFINED_CLASSES = [
  { className: "Nursery", displayName: "Nursery", order: 1, isGraduationClass: false },
  { className: "LKG", displayName: "LKG (Lower Kindergarten)", order: 2, isGraduationClass: false },
  { className: "UKG", displayName: "UKG (Upper Kindergarten)", order: 3, isGraduationClass: false },
  { className: "1", displayName: "Class 1", order: 4, isGraduationClass: false },
  { className: "2", displayName: "Class 2", order: 5, isGraduationClass: false },
  { className: "3", displayName: "Class 3", order: 6, isGraduationClass: false },
  { className: "4", displayName: "Class 4", order: 7, isGraduationClass: false },
  { className: "5", displayName: "Class 5", order: 8, isGraduationClass: false },
  { className: "6", displayName: "Class 6", order: 9, isGraduationClass: false },
  { className: "7", displayName: "Class 7", order: 10, isGraduationClass: false },
  { className: "8", displayName: "Class 8", order: 11, isGraduationClass: false },
  { className: "9", displayName: "Class 9", order: 12, isGraduationClass: false },
  { className: "10", displayName: "Class 10", order: 13, isGraduationClass: false },
  { className: "11", displayName: "Class 11", order: 14, isGraduationClass: false },
  { className: "12", displayName: "Class 12", order: 15, isGraduationClass: true },
]

const SECTIONS = ["A", "B", "C", "D", "E"]

async function seedClassStructure() {
  const client = new MongoClient(process.env.MONGODB_URI!)

  try {
    await client.connect()
    console.log("Connected to MongoDB")

    const db = client.db(process.env.MONGODB_DB || "school_erp")

    // Get all schools (both active and inactive)
    const schools = await db.collection("schools").find({}).toArray()
    console.log(`Found ${schools.length} total schools`)

    // Also check for active schools specifically
    const activeSchools = await db.collection("schools").find({ isActive: true }).toArray()
    console.log(`Found ${activeSchools.length} active schools`)

    if (schools.length === 0) {
      console.log("No schools found. Please seed schools first using: npm run seed:schools")
      return
    }

    // Use all schools (or just active ones if you prefer)
    const schoolsToProcess = activeSchools.length > 0 ? activeSchools : schools

    // Clear existing class structures
    await db.collection("classStructure").deleteMany({})
    console.log("Cleared existing class structures")

    let totalStructures = 0

    for (const school of schoolsToProcess) {
      console.log(`\nCreating class structure for school: ${school.name}`)

      // Create class structure for each class
      const classStructures = PREDEFINED_CLASSES.map((classInfo) => ({
        schoolId: school._id.toString(),
        className: classInfo.className,
        displayName: classInfo.displayName,
        sections: SECTIONS, // All sections available for all classes
        order: classInfo.order,
        isGraduationClass: classInfo.isGraduationClass,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      }))

      // Insert class structures
      const result = await db.collection("classStructure").insertMany(classStructures)
      totalStructures += result.insertedCount

      console.log(`✅ Created ${result.insertedCount} class structures for ${school.name}`)
    }

    console.log(`\n🎉 Class structure seeding completed successfully!`)
    console.log(`📊 Summary:`)
    console.log(`   - Schools processed: ${schoolsToProcess.length}`)
    console.log(`   - Total class structures created: ${totalStructures}`)
    console.log(`   - Classes per school: ${PREDEFINED_CLASSES.length}`)
    console.log(`   - Sections per class: ${SECTIONS.length}`)
    console.log(`   - Total class-section combinations per school: ${PREDEFINED_CLASSES.length * SECTIONS.length}`)
  } catch (error) {
    console.error("❌ Error seeding class structure:", error)
    throw error
  } finally {
    await client.close()
    console.log("Disconnected from MongoDB")
  }
}

// Run the seeding function
seedClassStructure()
  .then(() => {
    console.log("🎯 Class structure seeding finished successfully")
    process.exit(0)
  })
  .catch((error) => {
    console.error("💥 Class structure seeding failed:", error)
    process.exit(1)
  })
