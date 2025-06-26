import clientPromise from "../mongodb";
import { ObjectId } from "mongodb";
import bcrypt from "bcryptjs";
import type { User, UserCredentials, School } from "@/models/user";

// Get MongoDB collections
async function getUsersCollection() {
  const client = await clientPromise;
  const db = client.db(process.env.MONGODB_DB || "school_erp");
  return db.collection<User>("users");
}

async function getSchoolsCollection() {
  const client = await clientPromise;
  const db = client.db(process.env.MONGODB_DB || "school_erp");
  return db.collection("schools");
}

// User functions
export async function findUserByEmail(email: string) {
  const collection = await getUsersCollection();
  const user = await collection.findOne({ email: email.toLowerCase() });
  return user;
}

export async function findUserById(id: string) {
  const collection = await getUsersCollection();
  const user = await collection.findOne({ _id: new ObjectId(id) });
  return user;
}

export async function validateUserCredentials(credentials: UserCredentials) {
  const { email, password } = credentials;
  const user = await findUserByEmail(email);

  if (!user) return null;

  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) return null;

  // Don't return the password
  const { password: _, ...userWithoutPassword } = user;
  return userWithoutPassword;
}

export async function updateUserLastLogin(userId: string) {
  const collection = await getUsersCollection();
  await collection.updateOne(
    { _id: new ObjectId(userId) },
    {
      $set: {
        lastLogin: new Date(),
        updatedAt: new Date(),
      },
    }
  );
}

export async function getSchoolById(schoolId: string) {
  const collection = await getSchoolsCollection();
  const school = await collection.findOne({
    $or: [{ _id: new ObjectId(schoolId) }, { id: schoolId }],
  });
  return school;
}

export async function createUser(
  userData: Omit<User, "_id" | "createdAt" | "updatedAt">
) {
  const collection = await getUsersCollection();

  // Check if user already exists
  const existingUser = await findUserByEmail(userData.email);
  if (existingUser) {
    throw new Error("User with this email already exists");
  }

  // Hash the password
  const hashedPassword = await bcrypt.hash(userData.password, 10);

  // Create the user
  const now = new Date();
  const result = await collection.insertOne({
    ...userData,
    email: userData.email.toLowerCase(),
    password: hashedPassword,
    createdAt: now,
    updatedAt: now,
  } as User);

  return result;
}

export async function getAllUsers(filters?: {
  role?: string;
  schoolId?: string;
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
}) {
  const collection = await getUsersCollection();

  // Build query based on filters
  const query: any = {};

  if (filters?.role && filters.role !== "all") {
    query.role = filters.role;
  }

  if (filters?.schoolId && filters.schoolId !== "all") {
    query.schoolId = filters.schoolId;
  }

  if (filters?.status && filters.status !== "all") {
    query.isActive = filters.status === "active";
  }

  if (filters?.search) {
    query.$or = [
      { name: { $regex: filters.search, $options: "i" } },
      { email: { $regex: filters.search, $options: "i" } },
    ];
  }

  // Pagination
  const page = filters?.page || 1;
  const limit = filters?.limit || 10;
  const skip = (page - 1) * limit;

  // Get total count for pagination
  const totalCount = await collection.countDocuments(query);

  // Get paginated results
  const users = await collection
    .find(query, { projection: { password: 0 } }) // Exclude password
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .toArray();

  return {
    users,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(totalCount / limit),
      totalCount,
      hasNextPage: page < Math.ceil(totalCount / limit),
      hasPrevPage: page > 1,
    },
  };
}

export async function updateUser(userId: string, updateData: Partial<User>) {
  const collection = await getUsersCollection();

  const updateFields: any = {
    ...updateData,
    updatedAt: new Date(),
  };

  // If password is being updated, hash it
  if (updateData.password) {
    updateFields.password = await bcrypt.hash(updateData.password, 10);
  }

  const result = await collection.updateOne(
    { _id: new ObjectId(userId) },
    { $set: updateFields }
  );

  return result;
}

export async function deleteUser(userId: string) {
  const collection = await getUsersCollection();
  const result = await collection.deleteOne({ _id: new ObjectId(userId) });
  return result;
}

export async function toggleUserStatus(userId: string) {
  const collection = await getUsersCollection();
  const user = await findUserById(userId);

  if (!user) {
    throw new Error("User not found");
  }

  const result = await collection.updateOne(
    { _id: new ObjectId(userId) },
    {
      $set: {
        isActive: !user.isActive,
        updatedAt: new Date(),
      },
    }
  );

  return result;
}

export async function resetUserPassword(userId: string, newPassword: string) {
  const collection = await getUsersCollection();
  const hashedPassword = await bcrypt.hash(newPassword, 10);

  const result = await collection.updateOne(
    { _id: new ObjectId(userId) },
    {
      $set: {
        password: hashedPassword,
        updatedAt: new Date(),
      },
    }
  );

  return result;
}

export async function createSchool(
  schoolData: Omit<School, "_id" | "createdAt" | "updatedAt">
) {
  const collection = await getSchoolsCollection();

  const now = new Date();
  const result = await collection.insertOne({
    ...schoolData,
    createdAt: now,
    updatedAt: now,
  });

  return result;
}

export async function getUserById(userId: string): Promise<User | null> {
  try {
    if (!userId) {
      return null;
    }

    // Validate ObjectId format
    if (!ObjectId.isValid(userId)) {
      return null;
    }

    const collection = await getUsersCollection();

    const user = await collection.findOne({ _id: new ObjectId(userId) });

    if (user) {
      // Convert ObjectId to string for frontend
      return {
        ...user,
        _id: user._id.toString(),
      };
    }

    return null;
  } catch (error) {
    console.error("Error in getUserById:", error);
    throw error;
  }
}

export async function updateUserProfile(
  userId: string,
  updates: Partial<User>
): Promise<User | null> {
  try {
    const collection = await getUsersCollection();

    // Remove fields that shouldn't be updated via profile
    const { _id, password, createdAt, ...allowedUpdates } = updates;

    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(userId) },
      {
        $set: {
          ...allowedUpdates,
          updatedAt: new Date(),
        },
      },
      { returnDocument: "after" }
    );

    if (result) {
      return {
        ...result,
        _id: result._id.toString(),
      };
    }

    return null;
  } catch (error) {
    console.error("Error updating user profile:", error);
    throw error;
  }
}

export async function changeUserPassword(
  userId: string,
  currentPassword: string,
  newPassword: string
): Promise<boolean> {
  try {
    const collection = await getUsersCollection();
    const user = await collection.findOne({ _id: new ObjectId(userId) });

    if (!user) {
      throw new Error("User not found");
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password
    );
    if (!isCurrentPasswordValid) {
      throw new Error("Current password is incorrect");
    }

    // Validate new password
    if (newPassword.length < 8) {
      throw new Error("New password must be at least 8 characters long");
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await collection.updateOne(
      { _id: new ObjectId(userId) },
      {
        $set: {
          password: hashedNewPassword,
          updatedAt: new Date(),
        },
      }
    );

    return true;
  } catch (error) {
    console.error("Error changing password:", error);
    throw error;
  }
}

export async function updateUserAvatar(
  userId: string,
  avatarUrl: string
): Promise<boolean> {
  try {
    const collection = await getUsersCollection();

    await collection.updateOne(
      { _id: new ObjectId(userId) },
      {
        $set: {
          avatar: avatarUrl,
          updatedAt: new Date(),
        },
      }
    );

    return true;
  } catch (error) {
    console.error("Error updating avatar:", error);
    throw error;
  }
}

export async function updateLastLogin(userId: string): Promise<void> {
  try {
    const collection = await getUsersCollection();

    await collection.updateOne(
      { _id: new ObjectId(userId) },
      {
        $set: {
          lastLogin: new Date(),
          updatedAt: new Date(),
        },
      }
    );
  } catch (error) {
    console.error("Error updating last login:", error);
    throw error;
  }
}
