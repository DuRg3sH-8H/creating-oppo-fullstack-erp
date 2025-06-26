import clientPromise from "../mongodb";
import { ObjectId } from "mongodb";
import type {
  Message,
  Conversation,
  ConversationFilters,
  Participant,
} from "@/models/message";

// Get MongoDB collections
async function getMessagesCollection() {
  const client = await clientPromise;
  const db = client.db(process.env.MONGODB_DB || "school_erp");
  return db.collection<Message>("messages");
}

async function getConversationsCollection() {
  const client = await clientPromise;
  const db = client.db(process.env.MONGODB_DB || "school_erp");
  return db.collection<Conversation>("conversations");
}

// Conversation functions
export async function createConversation(
  createdBy: string,
  participants: Participant[],
  title?: string
): Promise<string> {
  try {
    const collection = await getConversationsCollection();

    const now = new Date();
    const conversation: Conversation = {
      participants,
      title,
      lastMessageTime: now,
      unreadCount: {},
      createdBy,
      createdAt: now,
      updatedAt: now,
    };

    // Initialize unread count for all participants
    participants.forEach((participant) => {
      conversation.unreadCount[participant.userId] = 0;
    });

    const result = await collection.insertOne(conversation);
    return result.insertedId.toString();
  } catch (error) {
    console.error("Error creating conversation:", error);
    throw error;
  }
}

export async function getConversationsByUser(
  userId: string,
  userRole: string,
  schoolId?: string,
  filters?: ConversationFilters
): Promise<Conversation[]> {
  try {
    const collection = await getConversationsCollection();

    // Build query - user must be a participant
    const query: any = {
      "participants.userId": userId,
      "participants.isActive": true,
    };

    // Apply additional filters
    if (filters?.search) {
      query.$or = [
        { title: { $regex: filters.search, $options: "i" } },
        { lastMessage: { $regex: filters.search, $options: "i" } },
        { "participants.userName": { $regex: filters.search, $options: "i" } },
      ];
    }

    if (filters?.hasUnread) {
      query[`unreadCount.${userId}`] = { $gt: 0 };
    }

    const conversations = await collection
      .find(query)
      .sort({ lastMessageTime: -1 })
      .toArray();

    return conversations.map((conv) => ({
      ...conv,
      id: conv._id?.toString(),
    }));
  } catch (error) {
    console.error("Error getting conversations:", error);
    throw error;
  }
}

export async function getConversationById(
  conversationId: string,
  userId: string
): Promise<Conversation | null> {
  try {
    const collection = await getConversationsCollection();

    const conversation = await collection.findOne({
      _id: new ObjectId(conversationId),
      "participants.userId": userId,
      "participants.isActive": true,
    });

    if (!conversation) return null;

    return {
      ...conversation,
      id: conversation._id?.toString(),
    };
  } catch (error) {
    console.error("Error getting conversation:", error);
    throw error;
  }
}

// Message functions
export async function sendMessage(
  conversationId: string,
  senderId: string,
  senderName: string,
  senderRole: string,
  content: string,
  attachments?: any[]
): Promise<string> {
  try {
    const messagesCollection = await getMessagesCollection();
    const conversationsCollection = await getConversationsCollection();

    const now = new Date();
    const message: Message = {
      conversationId,
      senderId,
      senderName,
      senderRole,
      content,
      attachments: attachments || [],
      timestamp: now,
      status: "sent" as any,
      readBy: [{ userId: senderId, readAt: now }],
      createdAt: now,
      updatedAt: now,
    };

    // Insert message
    const messageResult = await messagesCollection.insertOne(message);

    // Update conversation
    const conversation = await conversationsCollection.findOne({
      _id: new ObjectId(conversationId),
    });
    if (conversation) {
      const updateData: any = {
        lastMessage: content,
        lastMessageTime: now,
        updatedAt: now,
      };

      // Increment unread count for all participants except sender
      conversation.participants.forEach((participant) => {
        if (participant.userId !== senderId) {
          updateData[`unreadCount.${participant.userId}`] =
            (conversation.unreadCount[participant.userId] || 0) + 1;
        }
      });

      await conversationsCollection.updateOne(
        { _id: new ObjectId(conversationId) },
        { $set: updateData }
      );
    }

    return messageResult.insertedId.toString();
  } catch (error) {
    console.error("Error sending message:", error);
    throw error;
  }
}

export async function getMessagesByConversation(
  conversationId: string,
  userId: string,
  page = 1,
  limit = 50
): Promise<{ messages: Message[]; totalCount: number }> {
  try {
    const collection = await getMessagesCollection();

    // Verify user has access to this conversation
    const conversationsCollection = await getConversationsCollection();
    const conversation = await conversationsCollection.findOne({
      _id: new ObjectId(conversationId),
      "participants.userId": userId,
      "participants.isActive": true,
    });

    if (!conversation) {
      throw new Error("Access denied to this conversation");
    }

    const skip = (page - 1) * limit;

    const totalCount = await collection.countDocuments({ conversationId });

    const messages = await collection
      .find({ conversationId })
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    return {
      messages: messages.reverse().map((msg) => ({
        ...msg,
        id: msg._id?.toString(),
      })),
      totalCount,
    };
  } catch (error) {
    console.error("Error getting messages:", error);
    throw error;
  }
}

export async function markConversationAsRead(
  conversationId: string,
  userId: string
): Promise<boolean> {
  try {
    const conversationsCollection = await getConversationsCollection();
    const messagesCollection = await getMessagesCollection();

    // Reset unread count for user
    await conversationsCollection.updateOne(
      { _id: new ObjectId(conversationId) },
      { $set: { [`unreadCount.${userId}`]: 0 } }
    );

    // Mark messages as read
    await messagesCollection.updateMany(
      {
        conversationId,
        senderId: { $ne: userId },
        "readBy.userId": { $ne: userId },
      },
      {
        $push: {
          readBy: {
            userId,
            readAt: new Date(),
          },
        },
      }
    );

    return true;
  } catch (error) {
    console.error("Error marking conversation as read:", error);
    throw error;
  }
}

export async function searchMessages(
  userId: string,
  userRole: string,
  searchQuery: string,
  schoolId?: string
): Promise<Message[]> {
  try {
    const messagesCollection = await getMessagesCollection();

    // Get user's accessible conversations
    const conversations = await getConversationsByUser(
      userId,
      userRole,
      schoolId
    );
    const conversationIds = conversations
      .map((conv) => conv.id || conv._id?.toString())
      .filter((id): id is string => typeof id === "string");

    if (conversationIds.length === 0) return [];

    const messages = await messagesCollection
      .find({
        conversationId: { $in: conversationIds },
        $or: [
          { content: { $regex: searchQuery, $options: "i" } },
          { senderName: { $regex: searchQuery, $options: "i" } },
        ],
      })
      .sort({ timestamp: -1 })
      .limit(50)
      .toArray();

    return messages.map((msg) => ({
      ...msg,
      id: msg._id?.toString(),
    }));
  } catch (error) {
    console.error("Error searching messages:", error);
    throw error;
  }
}

export async function getAvailableUsers(
  currentUserId: string,
  userRole: string,
  schoolId?: string
) {
  try {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB || "school_erp");
    const usersCollection = db.collection("users");

    const query: any = {
      _id: { $ne: new ObjectId(currentUserId) },
      isActive: true,
    };

    // Role-based user filtering - UPDATED LOGIC
    if (userRole === "super-admin") {
      // Super admin can message school admins and ECA coordinators
      query.role = { $in: ["school", "eca"] };
    } else if (userRole === "school") {
      // School admin can ALWAYS message super admin + assigned ECA coordinators
      query.$or = [
        { role: "super-admin" }, // Always include super admin
        { role: "eca", schoolId: schoolId }, // Include assigned ECA coordinators
      ];
    } else if (userRole === "eca") {
      // ECA coordinator can ALWAYS message super admin + assigned schools
      query.$or = [
        { role: "super-admin" }, // Always include super admin
        { role: "school", schoolId: schoolId }, // Include assigned schools
      ];
    }

    const users = await usersCollection
      .find(query, {
        projection: {
          name: 1,
          email: 1,
          role: 1,
          schoolId: 1,
          schoolName: 1,
        },
      })
      .toArray();

    return users.map((user) => ({
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      schoolId: user.schoolId,
      schoolName: user.schoolName,
    }));
  } catch (error) {
    console.error("Error getting available users:", error);
    throw error;
  }
}

// Helper function to find or create conversation between two users
export async function findOrCreateConversation(
  user1Id: string,
  user1Name: string,
  user1Role: string,
  user1SchoolId: string | undefined,
  user1SchoolName: string | undefined,
  user2Id: string,
  user2Name: string,
  user2Role: string,
  user2SchoolId: string | undefined,
  user2SchoolName: string | undefined
): Promise<string> {
  try {
    const collection = await getConversationsCollection();

    // Check if conversation already exists between these two users
    const existingConversation = await collection.findOne({
      $and: [
        { "participants.userId": user1Id },
        { "participants.userId": user2Id },
        { participants: { $size: 2 } }, // Ensure it's a 1-on-1 conversation
      ],
    });

    if (existingConversation) {
      return existingConversation._id.toString();
    }

    // Create new conversation
    const participants: Participant[] = [
      {
        userId: user1Id,
        userName: user1Name,
        userRole: user1Role,
        schoolId: user1SchoolId,
        schoolName: user1SchoolName,
        isActive: true,
        joinedAt: new Date(),
      },
      {
        userId: user2Id,
        userName: user2Name,
        userRole: user2Role,
        schoolId: user2SchoolId,
        schoolName: user2SchoolName,
        isActive: true,
        joinedAt: new Date(),
      },
    ];

    return await createConversation(user1Id, participants);
  } catch (error) {
    console.error("Error finding or creating conversation:", error);
    throw error;
  }
}
