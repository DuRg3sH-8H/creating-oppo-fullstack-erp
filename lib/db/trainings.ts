import { connectToDatabase } from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import type { Training, TrainingFeedback } from "@/components/trainings/types";

export interface TrainingFilters {
  category?: string;
  trainer?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
  schoolId?: string;
  userRole?: string;
}

export interface PaginatedTrainingsResult {
  trainings: Training[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export async function getAllTrainings(
  page = 1,
  limit = 10,
  filters: TrainingFilters = {}
): Promise<PaginatedTrainingsResult> {
  try {
    // Ensure page and limit are integers
    const pageNum = Number.isInteger(page) ? page : 1;
    const limitNum = Number.isInteger(limit) ? limit : 10;

    const { db } = await connectToDatabase();
    const collection = db.collection("trainings");

    // Build query based on user role
    const query: any = {};

    // Apply role-based filtering
    if (filters.userRole === "super-admin") {
      // Super-admin sees all trainings - no additional filters
    } else if (filters.userRole === "school" && filters.schoolId) {
      // School users see:
      // 1. Trainings for their specific school
      // 2. Global trainings (schoolId is null or doesn't exist)
      query.$or = [
        { schoolId: filters.schoolId },
        { schoolId: { $exists: false } },
        { schoolId: null },
      ];
    } else {
      // ECA and other users see only global trainings
      query.$or = [{ schoolId: { $exists: false } }, { schoolId: null }];
    }

    // Apply other filters
    if (filters.category) {
      query.category = filters.category;
    }

    if (filters.trainer) {
      query.trainer = { $regex: filters.trainer, $options: "i" };
    }

    if (filters.search) {
      const searchQuery = {
        $or: [
          { title: { $regex: filters.search, $options: "i" } },
          { description: { $regex: filters.search, $options: "i" } },
          { trainer: { $regex: filters.search, $options: "i" } },
        ],
      };

      // Combine with existing $or query if it exists
      if (query.$or) {
        query.$and = [{ $or: query.$or }, searchQuery];
        delete query.$or;
      } else {
        Object.assign(query, searchQuery);
      }
    }

    if (filters.dateFrom || filters.dateTo) {
      query.date = {};
      if (filters.dateFrom) {
        query.date.$gte = filters.dateFrom;
      }
      if (filters.dateTo) {
        query.date.$lte = filters.dateTo;
      }
    }

    // Get total count
    const total = await collection.countDocuments(query);

    // Get paginated results
    const skip = (pageNum - 1) * limitNum;
    const trainings = await collection
      .find(query)
      .sort({ date: 1, time: 1 }) // Sort by date and time
      .skip(skip)
      .limit(limitNum)
      .toArray();

    // Convert MongoDB documents to Training objects
    const formattedTrainings: Training[] = trainings.map((doc) => ({
      id: doc._id.toString(),
      title: doc.title,
      description: doc.description,
      date: doc.date,
      time: doc.time,
      duration: doc.duration,
      trainer: doc.trainer,
      category: doc.category,
      maxParticipants: doc.maxParticipants,
      materials: doc.materials || [],
      registeredUsers: doc.registeredUsers || [],
      schoolId: doc.schoolId,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    }));

    const totalPages = Math.ceil(total / limitNum);

    return {
      trainings: formattedTrainings,
      total,
      page: pageNum,
      limit: limitNum,
      totalPages,
    };
  } catch (error) {
    console.error("❌ Error getting trainings:", error);
    return {
      trainings: [],
      total: 0,
      page: 1,
      limit: 10,
      totalPages: 0,
    };
  }
}

export async function getTrainingById(id: string): Promise<Training | null> {
  try {
    const { db } = await connectToDatabase();
    const collection = db.collection("trainings");

    const training = await collection.findOne({ _id: new ObjectId(id) });

    if (!training) {
      return null;
    }

    const formattedTraining: Training = {
      id: training._id.toString(),
      title: training.title,
      description: training.description,
      date: training.date,
      time: training.time,
      trainer: training.trainer,
      category: training.category,
      maxParticipants: training.maxParticipants,
      materials: training.materials || [],
      registeredUsers: training.registeredUsers || [],
      schoolId: training.schoolId,
      createdAt: training.createdAt,
      updatedAt: training.updatedAt,
      duration: "",
    };

    return formattedTraining;
  } catch (error) {
    console.error("❌ Error getting training by ID:", error);
    return null;
  }
}

export async function createTraining(
  trainingData: Omit<Training, "id">
): Promise<Training | null> {
  try {
    const { db } = await connectToDatabase();
    const collection = db.collection("trainings");

    const now = new Date();
    const trainingDoc = {
      ...trainingData,
      registeredUsers: [],
      createdAt: now,
      updatedAt: now,
    };

    const result = await collection.insertOne(trainingDoc);

    if (!result.insertedId) {
      return null;
    }

    const createdTraining: Training = {
      id: result.insertedId.toString(),
      title: trainingData.title,
      description: trainingData.description,
      date: trainingData.date,
      time: trainingData.time,
      duration: trainingData.duration,
      trainer: trainingData.trainer,
      category: trainingData.category,
      maxParticipants: trainingData.maxParticipants,
      materials: trainingData.materials || [],
      registeredUsers: [],
      schoolId: trainingData.schoolId,
      createdAt: now,
      updatedAt: now,
    };

    return createdTraining;
  } catch (error) {
    console.error("❌ Error creating training:", error);
    return null;
  }
}

export async function updateTraining(
  id: string,
  updates: Partial<Training>
): Promise<Training | null> {
  try {
    const { db } = await connectToDatabase();
    const collection = db.collection("trainings");

    const updateDoc = {
      ...updates,
      updatedAt: new Date(),
    };

    // Remove id from updates if present
    delete updateDoc.id;

    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: updateDoc },
      { returnDocument: "after" }
    );

    if (!result) {
      return null;
    }

    const updatedTraining: Training = {
      id: result._id.toString(),
      title: result.title,
      description: result.description,
      date: result.date,
      time: result.time,
      duration: result.duration,
      trainer: result.trainer,
      category: result.category,
      maxParticipants: result.maxParticipants,
      materials: result.materials || [],
      registeredUsers: result.registeredUsers || [],
      schoolId: result.schoolId,
      createdAt: result.createdAt,
      updatedAt: result.updatedAt,
    };

    return updatedTraining;
  } catch (error) {
    console.error("❌ Error updating training:", error);
    return null;
  }
}

export async function deleteTraining(id: string): Promise<boolean> {
  try {
    const { db } = await connectToDatabase();
    const collection = db.collection("trainings");

    const result = await collection.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return false;
    }

    return true;
  } catch (error) {
    console.error("❌ Error deleting training:", error);
    return false;
  }
}

export async function registerUserForTraining(
  trainingId: string,
  userId: string
): Promise<boolean> {
  try {
    const { db } = await connectToDatabase();
    const collection = db.collection("trainings");

    // Check if user is already registered
    const training = await collection.findOne({
      _id: new ObjectId(trainingId),
    });
    if (!training) {
      return false;
    }

    const registeredUsers = training.registeredUsers || [];
    if (registeredUsers.includes(userId)) {
      return false;
    }

    // Check if training is full
    if (
      training.maxParticipants &&
      registeredUsers.length >= training.maxParticipants
    ) {
      return false;
    }

    // Add user to registered users
    const result = await collection.updateOne(
      { _id: new ObjectId(trainingId) },
      {
        $addToSet: { registeredUsers: userId },
        $set: { updatedAt: new Date() },
      }
    );

    if (result.modifiedCount === 0) {
      return false;
    }

    return true;
  } catch (error) {
    console.error("❌ Error registering user:", error);
    return false;
  }
}

export async function unregisterUserFromTraining(
  trainingId: string,
  userId: string
): Promise<boolean> {
  try {
    const { db } = await connectToDatabase();
    const collection = db.collection("trainings");

    const result = await collection.updateOne(
      { _id: new ObjectId(trainingId) },
      {
        $pull: { registeredUsers: userId } as any,
        $set: { updatedAt: new Date() },
      }
    );

    if (result.modifiedCount === 0) {
      return false;
    }

    return true;
  } catch (error) {
    console.error("❌ Error unregistering user:", error);
    return false;
  }
}

export async function addTrainingFeedback(
  trainingId: string,
  userId: string,
  feedback: string,
  rating: number
): Promise<boolean> {
  try {
    const { db } = await connectToDatabase();
    const collection = db.collection("training_feedback");

    const feedbackDoc = {
      trainingId,
      userId,
      feedback,
      rating,
      createdAt: new Date(),
    };

    const result = await collection.insertOne(feedbackDoc);

    if (!result.insertedId) {
      return false;
    }

    return true;
  } catch (error) {
    console.error("❌ Error adding feedback:", error);
    return false;
  }
}

export async function getTrainingFeedback(
  trainingId: string
): Promise<TrainingFeedback[]> {
  try {
    const { db } = await connectToDatabase();
    const collection = db.collection("training_feedback");

    const feedback = await collection
      .find({ trainingId })
      .sort({ createdAt: -1 })
      .toArray();

    const formattedFeedback: TrainingFeedback[] = feedback.map((doc) => ({
      id: doc._id.toString(),
      trainingId: doc.trainingId,
      userId: doc.userId,
      feedback: doc.feedback,
      rating: doc.rating,
      createdAt: doc.createdAt,
    }));

    return formattedFeedback;
  } catch (error) {
    console.error("❌ Error getting feedback:", error);
    return [];
  }
}

// Export functions for API routes
export { registerUserForTraining as registerForTraining };
export { unregisterUserFromTraining as unregisterFromTraining };
export { addTrainingFeedback as submitTrainingFeedback };
