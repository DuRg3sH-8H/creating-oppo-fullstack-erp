import { connectToDatabase } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

// Helper function to validate ObjectId
function isValidObjectId(id: string): boolean {
  return ObjectId.isValid(id) && String(new ObjectId(id)) === id;
}

// Clause Management
export async function getClauses() {
  try {
    const { db } = await connectToDatabase();
    const clauses = await db
      .collection("iso_clauses")
      .find({})
      .sort({ number: 1 })
      .toArray();

    return {
      clauses: clauses.map((clause) => ({
        ...clause,
        id: clause._id.toString(),
        _id: clause._id.toString(), // Keep _id for compatibility
      })),
    };
  } catch (error) {
    console.error("Error fetching clauses:", error);
    throw error;
  }
}

export async function createClause(
  clauseData: {
    number: string;
    title: string;
    description: string;
    requirements: string[];
  },
  createdBy: string
) {
  try {
    const { db } = await connectToDatabase();

    const clause = {
      ...clauseData,
      guidelines: [],
      createdBy,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection("iso_clauses").insertOne(clause);

    return {
      ...clause,
      id: result.insertedId.toString(),
      _id: result.insertedId.toString(),
    };
  } catch (error) {
    console.error("Error creating clause:", error);
    throw error;
  }
}

export async function updateClause(
  clauseId: string,
  updates: {
    number?: string;
    title?: string;
    description?: string;
    requirements?: string[];
  }
) {
  try {
    if (!isValidObjectId(clauseId)) {
      throw new Error("Invalid clause ID format");
    }

    const { db } = await connectToDatabase();

    const result = await db.collection("iso_clauses").findOneAndUpdate(
      { _id: new ObjectId(clauseId) },
      {
        $set: {
          ...updates,
          updatedAt: new Date(),
        },
      },
      { returnDocument: "after" }
    );

    if (!result) {
      throw new Error("Clause not found");
    }

    return {
      ...result,
      id: result._id.toString(),
      _id: result._id.toString(),
    };
  } catch (error) {
    console.error("Error updating clause:", error);
    throw error;
  }
}

export async function deleteClause(clauseId: string) {
  try {
    if (!isValidObjectId(clauseId)) {
      throw new Error("Invalid clause ID format");
    }

    const { db } = await connectToDatabase();

    // First delete all submissions for this clause
    await db.collection("iso_submissions").deleteMany({ clauseId });

    const result = await db.collection("iso_clauses").deleteOne({
      _id: new ObjectId(clauseId),
    });

    if (result.deletedCount === 0) {
      throw new Error("Clause not found");
    }

    return { success: true };
  } catch (error) {
    console.error("Error deleting clause:", error);
    throw error;
  }
}

export async function addGuidelinesToClause(
  clauseId: string,
  guidelines: any[]
) {
  try {
    if (!isValidObjectId(clauseId)) {
      throw new Error("Invalid clause ID format");
    }

    const { db } = await connectToDatabase();

    // First check if clause exists
    const existingClause = await db
      .collection("iso_clauses")
      .findOne({ _id: new ObjectId(clauseId) });
    if (!existingClause) {
      throw new Error("Clause not found");
    }

    const result = await db.collection("iso_clauses").findOneAndUpdate(
      { _id: new ObjectId(clauseId) },
      {
        $push: { guidelines: { $each: guidelines } },
        $set: { updatedAt: new Date() },
      } as any,
      { returnDocument: "after" }
    );

    if (!result) {
      throw new Error("Failed to update clause with guidelines");
    }

    return {
      ...result,
      id: result._id.toString(),
      _id: result._id.toString(),
    };
  } catch (error) {
    console.error("Error adding guidelines:", error);
    throw error;
  }
}

// Submission Management
export async function getSubmissions(filters?: {
  status?: string;
  schoolId?: string;
  clauseId?: string;
}) {
  try {
    const { db } = await connectToDatabase();

    const query: any = {};
    if (filters?.status) query.status = filters.status;
    if (filters?.schoolId) query.schoolId = filters.schoolId;
    if (filters?.clauseId) query.clauseId = filters.clauseId;

    // Use aggregation to join with schools and clauses collections
    const pipeline = [
      { $match: query },
      {
        $lookup: {
          from: "schools",
          let: { schoolId: { $toObjectId: "$schoolId" } },
          pipeline: [{ $match: { $expr: { $eq: ["$_id", "$$schoolId"] } } }],
          as: "school",
        },
      },
      {
        $lookup: {
          from: "iso_clauses",
          let: { clauseId: { $toObjectId: "$clauseId" } },
          pipeline: [{ $match: { $expr: { $eq: ["$_id", "$$clauseId"] } } }],
          as: "clause",
        },
      },
      {
        $addFields: {
          schoolName: {
            $ifNull: [{ $arrayElemAt: ["$school.name", 0] }, "Unknown School"],
          },
          clauseNumber: {
            $ifNull: [{ $arrayElemAt: ["$clause.number", 0] }, "Unknown"],
          },
          clauseTitle: {
            $ifNull: [{ $arrayElemAt: ["$clause.title", 0] }, "Unknown Clause"],
          },
          documentCount: { $size: { $ifNull: ["$documents", []] } },
        },
      },
      { $sort: { createdAt: -1 } },
    ];

    const submissions = await db
      .collection("iso_submissions")
      .aggregate(pipeline)
      .toArray();

    return {
      submissions: submissions.map((submission) => ({
        ...submission,
        id: submission._id.toString(),
        _id: submission._id.toString(),
        submittedAt:
          submission.createdAt || submission.submittedAt || new Date(),
        submittedBy: submission.submittedBy || "Unknown User",
      })),
    };
  } catch (error) {
    console.error("Error fetching submissions:", error);
    throw error;
  }
}

export async function createSubmission(submissionData: {
  clauseId: string;
  schoolId: string;
  documents: any[];
  submittedBy: string;
}) {
  try {
    const { db } = await connectToDatabase();

    // Get clause and school information
    const clause = await db
      .collection("iso_clauses")
      .findOne({ _id: new ObjectId(submissionData.clauseId) });
    const school = await db
      .collection("schools")
      .findOne({ _id: new ObjectId(submissionData.schoolId) });

    const submission = {
      ...submissionData,
      clauseNumber: clause?.number || "Unknown",
      clauseTitle: clause?.title || "Unknown Clause",
      schoolName: school?.name || "Unknown School",
      status: "submitted",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection("iso_submissions").insertOne(submission);

    return {
      ...submission,
      id: result.insertedId.toString(),
      _id: result.insertedId.toString(),
    };
  } catch (error) {
    console.error("Error creating submission:", error);
    throw error;
  }
}

export async function reviewSubmission(
  submissionId: string,
  status: "approved" | "rejected",
  comments?: string,
  reviewedBy?: string
) {
  try {
    if (!isValidObjectId(submissionId)) {
      throw new Error("Invalid submission ID format");
    }

    const { db } = await connectToDatabase();

    // First check if submission exists
    const existingSubmission = await db
      .collection("iso_submissions")
      .findOne({ _id: new ObjectId(submissionId) });
    if (!existingSubmission) {
      throw new Error("Submission not found");
    }

    // Update the submission
    const updateResult = await db.collection("iso_submissions").updateOne(
      { _id: new ObjectId(submissionId) },
      {
        $set: {
          status,
          comments,
          reviewedBy,
          reviewedAt: new Date(),
          updatedAt: new Date(),
        },
      }
    );

    if (updateResult.matchedCount === 0) {
      throw new Error("Submission not found");
    }


    // Fetch the updated submission
    const updatedSubmission = await db
      .collection("iso_submissions")
      .findOne({ _id: new ObjectId(submissionId) });

    return {
      ...updatedSubmission,
      id: updatedSubmission!._id.toString(),
      _id: updatedSubmission!._id.toString(),
    };
  } catch (error) {
    console.error("Error reviewing submission:", error);
    throw error;
  }
}

// Analytics Functions
export async function getOverallStats() {
  try {
    const { db } = await connectToDatabase();

    // Get total clauses
    const totalClauses = await db.collection("iso_clauses").countDocuments();

    // Get schools data - make sure we're getting the right collection
    const schools = await db.collection("schools").find({}).toArray();

    // Filter active schools
    const activeSchools = schools.filter((s) => s.status === "active");

    // Get submissions data
    const submissions = await db
      .collection("iso_submissions")
      .find({})
      .toArray();

    const approvedSubmissions = submissions.filter(
      (s) => s.status === "approved"
    ).length;
    const pendingSubmissions = submissions.filter(
      (s) => s.status === "pending"
    ).length;
    const submittedSubmissions = submissions.filter(
      (s) => s.status === "submitted"
    ).length;

    // Calculate certification stats for each school (use all schools, not just active)
    const schoolProgress = schools.map((school) => {
      const schoolId = school._id.toString();
      const schoolSubmissions = submissions.filter(
        (s) => s.schoolId === schoolId
      );
      const approved = schoolSubmissions.filter(
        (s) => s.status === "approved"
      ).length;
      const pending = schoolSubmissions.filter(
        (s) => s.status === "pending"
      ).length;
      const submitted = schoolSubmissions.filter(
        (s) => s.status === "submitted"
      ).length;
      const progress =
        totalClauses > 0 ? Math.round((approved / totalClauses) * 100) : 0;

      return {
        id: schoolId,
        name: school.name,
        status: school.status,
        progress,
        totalClauses,
        approvedClauses: approved,
        pendingClauses: pending,
        submittedClauses: submitted,
        isCertified: progress === 100,
      };
    });

    const certifiedSchools = schoolProgress.filter((s) => s.isCertified).length;
    const averageProgress =
      schoolProgress.length > 0
        ? Math.round(
            schoolProgress.reduce((acc, s) => acc + s.progress, 0) /
              schoolProgress.length
          )
        : 0;

    const result = {
      totalSchools: schools.length,
      activeSchools: activeSchools.length,
      certifiedSchools,
      certificationRate:
        schools.length > 0
          ? Math.round((certifiedSchools / schools.length) * 100)
          : 0,
      averageProgress,
      totalClauses,
      approvedClauses: approvedSubmissions,
      pendingClauses: pendingSubmissions,
      submittedClauses: submittedSubmissions,
      schools: schoolProgress,
    };

    return result;
  } catch (error) {
    console.error("Error getting overall stats:", error);
    throw error;
  }
}

export async function getAllSchoolsProgress() {
  try {
    const stats = await getOverallStats();
    return stats.schools;
  } catch (error) {
    console.error("Error getting schools progress:", error);
    throw error;
  }
}

export async function getSchoolProgress(schoolId: string) {
  try {
    if (!isValidObjectId(schoolId)) {
      throw new Error("Invalid school ID format");
    }

    const { db } = await connectToDatabase();

    const school = await db
      .collection("schools")
      .findOne({ _id: new ObjectId(schoolId) });
    if (!school) {
      throw new Error("School not found");
    }

    const totalClauses = await db.collection("iso_clauses").countDocuments();
    const submissions = await db
      .collection("iso_submissions")
      .find({ schoolId })
      .toArray();

    const approved = submissions.filter((s) => s.status === "approved").length;
    const progress =
      totalClauses > 0 ? Math.round((approved / totalClauses) * 100) : 0;

    return {
      id: school._id.toString(),
      name: school.name,
      progress,
      totalClauses,
      approvedClauses: approved,
      pendingClauses: submissions.filter((s) => s.status === "pending").length,
      submittedClauses: submissions.filter((s) => s.status === "submitted")
        .length,
      isCertified: progress === 100,
    };
  } catch (error) {
    console.error("Error getting school progress:", error);
    throw error;
  }
}

export async function getSchoolClauseStatus(schoolId: string) {
  try {
    const { db } = await connectToDatabase();

    const clauses = await db
      .collection("iso_clauses")
      .find({})
      .sort({ number: 1 })
      .toArray();
    const submissions = await db
      .collection("iso_submissions")
      .find({ schoolId })
      .toArray();

    const clauseStatus = clauses.map((clause) => {
      const submission = submissions.find(
        (s) => s.clauseId === clause._id.toString()
      );

      return {
        ...clause,
        id: clause._id.toString(),
        _id: clause._id.toString(),
        status: submission?.status || "not_started",
        submission: submission
          ? {
              ...submission,
              id: submission._id.toString(),
              _id: submission._id.toString(),
            }
          : null,
      };
    });

    return { clauses: clauseStatus };
  } catch (error) {
    console.error("Error getting school clause status:", error);
    throw error;
  }
}
