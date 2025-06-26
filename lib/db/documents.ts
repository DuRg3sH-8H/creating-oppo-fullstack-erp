import { connectToDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"
import type { IDocument } from "@/models/document"

export interface DocumentFilters {
  page?: number
  limit?: number
  category?: string
  search?: string
  schoolId?: string
  userRole?: string
  tags?: string[]
  dateFrom?: Date
  dateTo?: Date
}

export interface CreateDocumentData {
  name: string
  description: string
  originalName: string
  fileName: string
  filePath: string
  fileSize: number
  fileType: string
  mimeType: string
  version?: string
  category: "template" | "policy" | "report" | "form" | "guide" | "other"
  tags: string[]
  isPublic: boolean
  schoolId?: string
  uploadedBy: {
    id: string
    name: string
    role: string
  }
}

export class DocumentService {
  static async getDocuments(filters: DocumentFilters = {}) {
    const { db } = await connectToDatabase()
    const { page = 1, limit = 10, category, search, schoolId, userRole, tags, dateFrom, dateTo } = filters

    // Build query based on user role and permissions
    const query: any = {}

    // Category filter
    if (category && category !== "all") {
      query.category = category
    }

    // Build permission-based query
    if (userRole === "super-admin") {
      // Super admin can see all documents
      if (schoolId) {
        query.schoolId = schoolId
      }
    } else if (userRole === "school" || userRole === "teacher" || userRole === "eca-admin") {
      // School-based roles can see public documents + their school's documents
      if (schoolId) {
        query.$or = [{ isPublic: true }, { schoolId: schoolId }]
      } else {
        query.isPublic = true
      }
    } else {
      // Students and other roles can only see public documents + their school's documents
      if (schoolId) {
        query.$or = [{ isPublic: true }, { schoolId: schoolId }]
      } else {
        query.isPublic = true
      }
    }

    // Search filter
    if (search) {
      const searchConditions = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { tags: { $in: [new RegExp(search, "i")] } },
      ]

      if (query.$or) {
        // Combine search with existing $or conditions
        query.$and = [{ $or: query.$or }, { $or: searchConditions }]
        delete query.$or
      } else {
        query.$or = searchConditions
      }
    }

    // Tags filter
    if (tags && tags.length > 0) {
      query.tags = { $in: tags }
    }

    // Date range filter
    if (dateFrom || dateTo) {
      query.createdAt = {}
      if (dateFrom) query.createdAt.$gte = dateFrom
      if (dateTo) query.createdAt.$lte = dateTo
    }

    // Get total count
    const total = await db.collection("documents").countDocuments(query)

    // Get documents with pagination
    const documents = await db
      .collection("documents")
      .find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .toArray()

    return {
      documents: documents.map((doc) => ({
        ...doc,
        _id: doc._id.toString(),
      })),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    }
  }

  static async getDocumentById(id: string, role: string, schoolId: string | undefined): Promise<IDocument | null> {
    const { db } = await connectToDatabase()
    const document = await db.collection("documents").findOne({ _id: new ObjectId(id) })

    if (!document) return null

    return {
      ...document,
      _id: document._id.toString(),
    } as IDocument
  }

  static async createDocument(data: CreateDocumentData): Promise<IDocument> {
    const { db } = await connectToDatabase()

    const document = {
      ...data,
      version: "1.0",
      downloadCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await db.collection("documents").insertOne(document)

    return {
      ...document,
      _id: result.insertedId.toString(),
    } as unknown as IDocument
  }

  static async updateDocument(
    id: string,
    updates: Partial<IDocument>,
    userId: string,
    userRole: string,
  ): Promise<IDocument | null> {
    const { db } = await connectToDatabase()

    // Get existing document
    const existingDoc = await this.getDocumentById(id, userRole, userRole === "school" ? userId : undefined)
    if (!existingDoc) return null

    // Check permissions
    if (userRole !== "super-admin") {
      if (userRole === "school" && existingDoc.schoolId !== userId) {
        return null // Access denied
      }
    }

    const updateData = {
      ...updates,
      updatedAt: new Date(),
    }

    const result = await db
      .collection("documents")
      .findOneAndUpdate({ _id: new ObjectId(id) }, { $set: updateData }, { returnDocument: "after" })

    if (!result || !result.value) return null

    return {
      ...result.value,
      _id: result.value._id.toString(),
    } as IDocument
  }

  static async deleteDocument(id: string, userId: string, userRole: string): Promise<boolean> {
    const { db } = await connectToDatabase()

    // Get existing document
    const existingDoc = await this.getDocumentById(id, userRole, userRole === "school" ? userId : undefined)
    if (!existingDoc) return false

    // Check permissions
    if (userRole !== "super-admin") {
      if (userRole === "school" && existingDoc.uploadedBy.id !== userId) {
        return false // Access denied
      }
    }

    const result = await db.collection("documents").deleteOne({ _id: new ObjectId(id) })
    return result.deletedCount > 0
  }

  static async incrementDownloadCount(id: string): Promise<void> {
    const { db } = await connectToDatabase()
    await db.collection("documents").updateOne({ _id: new ObjectId(id) }, { $inc: { downloadCount: 1 } })
  }

  static async getDocumentStats(schoolId?: string, role?: string) {
    const { db } = await connectToDatabase()

    const matchStage: any = {}
    if (schoolId) {
      matchStage.schoolId = schoolId
    }

    const stats = await db
      .collection("documents")
      .aggregate([
        { $match: matchStage },
        {
          $group: {
            _id: null,
            totalDocuments: { $sum: 1 },
            totalDownloads: { $sum: "$downloadCount" },
            totalSize: { $sum: "$fileSize" },
            categories: {
              $push: "$category",
            },
          },
        },
      ])
      .toArray()

    const categoryStats = await db
      .collection("documents")
      .aggregate([
        { $match: matchStage },
        {
          $group: {
            _id: "$category",
            count: { $sum: 1 },
            totalSize: { $sum: "$fileSize" },
          },
        },
      ])
      .toArray()

    const recentDocuments = await db.collection("documents").find(matchStage).sort({ createdAt: -1 }).limit(5).toArray()

    return {
      total: stats[0]?.totalDocuments || 0,
      totalDownloads: stats[0]?.totalDownloads || 0,
      totalSize: stats[0]?.totalSize || 0,
      categories: categoryStats.map((cat) => ({
        category: cat._id,
        count: cat.count,
        totalSize: cat.totalSize,
      })),
      recent: recentDocuments.map((doc) => ({
        ...doc,
        _id: doc._id.toString(),
      })),
    }
  }

  static async searchDocuments(query: string, schoolId?: string) {
    const { db } = await connectToDatabase()

    const searchQuery: any = {
      $or: [
        { name: { $regex: query, $options: "i" } },
        { description: { $regex: query, $options: "i" } },
        { tags: { $in: [new RegExp(query, "i")] } },
      ],
    }

    if (schoolId) {
      searchQuery.schoolId = schoolId
    }

    const documents = await db.collection("documents").find(searchQuery).sort({ createdAt: -1 }).limit(20).toArray()

    return documents.map((doc) => ({
      ...doc,
      _id: doc._id.toString(),
    }))
  }
}
