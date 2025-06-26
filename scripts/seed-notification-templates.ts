const { MongoClient } = require("mongodb")
require("dotenv").config({ path: ".env.local" })

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017"
const MONGODB_DB = process.env.MONGODB_DB || "school_erp"

const templates = [
  {
    name: "student_promotion",
    subject: "Student Promotion Notification",
    htmlTemplate: `
      <h2>Student Promoted Successfully</h2>
      <p>Dear {{userName}},</p>
      <p>{{studentName}} has been successfully promoted from {{fromClass}} to {{toClass}}.</p>
      <p>Promotion Date: {{promotionDate}}</p>
      <p>Best regards,<br>School ERP System</p>
    `,
    textTemplate: `
      Student Promoted Successfully
      
      Dear {{userName}},
      
      {{studentName}} has been successfully promoted from {{fromClass}} to {{toClass}}.
      
      Promotion Date: {{promotionDate}}
      
      Best regards,
      School ERP System
    `,
    type: "success",
    category: "student",
    variables: ["userName", "studentName", "fromClass", "toClass", "promotionDate"],
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    name: "training_registration",
    subject: "Training Registration Confirmed",
    htmlTemplate: `
      <h2>Training Registration Confirmed</h2>
      <p>Dear {{userName}},</p>
      <p>Your registration for "{{trainingTitle}}" has been confirmed.</p>
      <p>Training Date: {{trainingDate}}</p>
      <p>Location: {{trainingLocation}}</p>
      <p>Best regards,<br>School ERP System</p>
    `,
    textTemplate: `
      Training Registration Confirmed
      
      Dear {{userName}},
      
      Your registration for "{{trainingTitle}}" has been confirmed.
      
      Training Date: {{trainingDate}}
      Location: {{trainingLocation}}
      
      Best regards,
      School ERP System
    `,
    type: "success",
    category: "training",
    variables: ["userName", "trainingTitle", "trainingDate", "trainingLocation"],
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
]

async function seedNotificationTemplates() {
  const client = new MongoClient(MONGODB_URI)

  try {
    console.log("Connecting to MongoDB...")
    await client.connect()
    console.log("Connected to MongoDB")

    const db = client.db(MONGODB_DB)
    console.log(`Using database: ${MONGODB_DB}`)

    const collection = db.collection("notification_templates")

    // Clear existing templates
    await collection.deleteMany({})
    console.log("Cleared existing notification templates")

    // Insert new templates
    const result = await collection.insertMany(templates)
    console.log(`✅ Inserted ${result.insertedCount} notification templates`)

    console.log("📧 Notification templates seeded successfully!")
  } catch (error) {
    console.error("❌ Error seeding notification templates:", error)
  } finally {
    await client.close()
    console.log("Disconnected from MongoDB")
  }
}

seedNotificationTemplates()
  .then(() => {
    console.log("🎯 Notification template seeding finished successfully")
    process.exit(0)
  })
  .catch((error) => {
    console.error("💥 Notification template seeding failed:", error)
    process.exit(1)
  })
