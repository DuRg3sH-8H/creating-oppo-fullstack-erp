const { MongoClient, ObjectId } = require("mongodb")
require("dotenv").config({ path: ".env.local" })


const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017"
const MONGODB_DB = process.env.MONGODB_DB || "school_erp"

async function seedConversations() {
  console.log("🚀 Starting conversation seeding...")

  const client = new MongoClient(MONGODB_URI)

  try {
    await client.connect()
    console.log("Connected to MongoDB")

    const db = client.db(MONGODB_DB)
    const conversationsCollection = db.collection("conversations")
    const messagesCollection = db.collection("messages")
    const usersCollection = db.collection("users")

    // Clear existing conversations and messages
    await conversationsCollection.deleteMany({})
    await messagesCollection.deleteMany({})
    console.log("Cleared existing conversations and messages")

    // Get users
    const superAdmin = await usersCollection.findOne({ role: "super-admin" })
    const schoolAdmin = await usersCollection.findOne({ role: "school" })
    const ecaCoordinator = await usersCollection.findOne({ role: "eca" })

    if (!superAdmin) {
      console.log("No super admin found. Please seed users first.")
      return
    }

    const now = new Date()

    // Create conversation between super admin and school admin
    if (schoolAdmin) {
      const schoolConversation = {
        participants: [
          {
            userId: superAdmin._id.toString(),
            userName: superAdmin.name,
            userRole: superAdmin.role,
            schoolId: superAdmin.schoolId,
            schoolName: superAdmin.schoolName,
            joinedAt: now,
            isActive: true,
          },
          {
            userId: schoolAdmin._id.toString(),
            userName: schoolAdmin.name,
            userRole: schoolAdmin.role,
            schoolId: schoolAdmin.schoolId,
            schoolName: schoolAdmin.schoolName,
            joinedAt: now,
            isActive: true,
          },
        ],
        title: `Conversation with ${schoolAdmin.name}`,
        lastMessage: "Hello! How can I help you today?",
        lastMessageTime: now,
        unreadCount: {
          [superAdmin._id.toString()]: 0,
          [schoolAdmin._id.toString()]: 1,
        },
        createdBy: superAdmin._id.toString(),
        createdAt: now,
        updatedAt: now,
      }

      const schoolConvResult = await conversationsCollection.insertOne(schoolConversation)

      // Add initial message
      const schoolMessage = {
        conversationId: schoolConvResult.insertedId.toString(),
        senderId: superAdmin._id.toString(),
        senderName: superAdmin.name,
        senderRole: superAdmin.role,
        content: "Hello! How can I help you today?",
        attachments: [],
        timestamp: now,
        status: "sent",
        readBy: [{ userId: superAdmin._id.toString(), readAt: now }],
        createdAt: now,
        updatedAt: now,
      }

      await messagesCollection.insertOne(schoolMessage)
      console.log("Created conversation between super admin and school admin")
    }

    // Create conversation between super admin and ECA coordinator
    if (ecaCoordinator) {
      const ecaConversation = {
        participants: [
          {
            userId: superAdmin._id.toString(),
            userName: superAdmin.name,
            userRole: superAdmin.role,
            schoolId: superAdmin.schoolId,
            schoolName: superAdmin.schoolName,
            joinedAt: now,
            isActive: true,
          },
          {
            userId: ecaCoordinator._id.toString(),
            userName: ecaCoordinator.name,
            userRole: ecaCoordinator.role,
            schoolId: ecaCoordinator.schoolId,
            schoolName: ecaCoordinator.schoolName,
            joinedAt: now,
            isActive: true,
          },
        ],
        title: `Conversation with ${ecaCoordinator.name}`,
        lastMessage: "Welcome to the ECA coordination system!",
        lastMessageTime: now,
        unreadCount: {
          [superAdmin._id.toString()]: 0,
          [ecaCoordinator._id.toString()]: 1,
        },
        createdBy: superAdmin._id.toString(),
        createdAt: now,
        updatedAt: now,
      }

      const ecaConvResult = await conversationsCollection.insertOne(ecaConversation)

      // Add initial message
      const ecaMessage = {
        conversationId: ecaConvResult.insertedId.toString(),
        senderId: superAdmin._id.toString(),
        senderName: superAdmin.name,
        senderRole: superAdmin.role,
        content: "Welcome to the ECA coordination system!",
        attachments: [],
        timestamp: now,
        status: "sent",
        readBy: [{ userId: superAdmin._id.toString(), readAt: now }],
        createdAt: now,
        updatedAt: now,
      }

      await messagesCollection.insertOne(ecaMessage)
      console.log("Created conversation between super admin and ECA coordinator")
    }

    console.log("✅ Conversation seeding completed successfully!")
  } catch (error) {
    console.error("❌ Error seeding conversations:", error)
  } finally {
    await client.close()
    console.log("Disconnected from MongoDB")
  }
}

seedConversations()
