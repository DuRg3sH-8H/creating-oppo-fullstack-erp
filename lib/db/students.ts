import { ObjectId } from "mongodb"
import { connectToDatabase } from "@/lib/mongodb"
import type { Student, ClassPromotion } from "@/models/student"

export async function getStudents(
  schoolId: string,
  filters?: {
    class?: string
    section?: string
    status?: string
    search?: string
  },
) {
  try {
    const { db } = await connectToDatabase()

    const query: any = { schoolId }

    if (filters?.class && filters.class !== "all") {
      query.class = filters.class
    }

    if (filters?.section && filters.section !== "all") {
      query.section = filters.section
    }

    if (filters?.status && filters.status !== "all") {
      query.status = filters.status
    }

    if (filters?.search) {
      query.$or = [
        { name: { $regex: filters.search, $options: "i" } },
        { rollNumber: { $regex: filters.search, $options: "i" } },
        { parentContact: { $regex: filters.search, $options: "i" } },
      ]
    }

    const students = await db.collection("students").find(query).sort({ class: 1, section: 1, rollNumber: 1 }).toArray()

    return students.map((student) => ({
      ...student,
      _id: student._id.toString(),
    }))
  } catch (error) {
    console.error("Error fetching students:", error)
    throw new Error("Failed to fetch students")
  }
}

export async function getStudentById(studentId: string) {
  try {
    const { db } = await connectToDatabase()

    const student = await db.collection("students").findOne({ _id: new ObjectId(studentId) })

    if (!student) {
      return null
    }

    return {
      ...student,
      _id: student._id.toString(),
    }
  } catch (error) {
    console.error("Error fetching student:", error)
    throw new Error("Failed to fetch student")
  }
}

export async function createStudent(studentData: Omit<Student, "_id" | "id" | "createdAt" | "updatedAt">) {
  try {
    const { db } = await connectToDatabase()

    // Check if roll number already exists in the same school, class, and section
    const existingStudent = await db.collection("students").findOne({
      schoolId: studentData.schoolId,
      rollNumber: studentData.rollNumber,
      class: studentData.class,
      section: studentData.section,
      status: { $ne: "graduated" },
    })

    if (existingStudent) {
      throw new Error("Roll number already exists in this class and section")
    }

    const student = {
      ...studentData,
      status: "active" as const,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await db.collection("students").insertOne(student)

    return {
      ...student,
      _id: result.insertedId.toString(),
    }
  } catch (error) {
    console.error("Error creating student:", error)
    throw error
  }
}

export async function updateStudent(studentId: string, updateData: Partial<Student>) {
  try {
    const { db } = await connectToDatabase()

    const result = await db.collection("students").updateOne(
      { _id: new ObjectId(studentId) },
      {
        $set: {
          ...updateData,
          updatedAt: new Date(),
        },
      },
    )

    if (result.matchedCount === 0) {
      throw new Error("Student not found")
    }

    return await getStudentById(studentId)
  } catch (error) {
    console.error("Error updating student:", error)
    throw error
  }
}

export async function deleteStudent(studentId: string) {
  try {
    const { db } = await connectToDatabase()

    

    if (!studentId || studentId === "undefined" || studentId === "null") {
      throw new Error("Invalid student ID provided")
    }

    const result = await db.collection("students").deleteOne({ _id: new ObjectId(studentId) })


    if (result.deletedCount === 0) {
      throw new Error("Student not found")
    }

    return { success: true }
  } catch (error) {
    console.error("Error deleting student:", error)
    throw error
  }
}

export async function getClassStructure(schoolId: string) {
  try {
    const { db } = await connectToDatabase()

    const classes = await db.collection("classStructure").find({ schoolId }).sort({ order: 1 }).toArray()

    return classes.map((cls) => ({
      ...cls,
      _id: cls._id.toString(),
    }))
  } catch (error) {
    console.error("Error fetching class structure:", error)
    throw new Error("Failed to fetch class structure")
  }
}

export async function promoteStudents(
  studentIds: string[],
  toClass: string,
  toSection: string,
  academicYear: string,
  promotedBy: string,
  notes?: string,
) {
  try {
    const { client, db } = await connectToDatabase()


    // Validate student IDs
    const validStudentIds = studentIds.filter((id) => id && id !== "null" && id !== "undefined")
    if (validStudentIds.length === 0) {
      throw new Error("No valid student IDs provided")
    }

    // Start a transaction
    const session = client.startSession()

    try {
      await session.withTransaction(async () => {
        const promotions: ClassPromotion[] = []

        for (const studentId of validStudentIds) {
          // Get current student data
          const student = await db.collection("students").findOne({ _id: new ObjectId(studentId) }, { session })

          if (!student) {
            console.error(`Student with ID ${studentId} not found`)
            throw new Error(`Student with ID ${studentId} not found`)
          }

          // Check if this is a graduation (moving to graduation class or beyond)
          const classStructure = await db.collection("classStructure").findOne(
            {
              schoolId: student.schoolId,
              className: student.class,
            },
            { session },
          )

          const isGraduation = classStructure?.isGraduationClass || false

          // Create promotion record
          const promotion: ClassPromotion = {
            studentId: studentId,
            fromClass: student.class,
            fromSection: student.section,
            toClass,
            toSection,
            academicYear,
            promotedBy,
            promotionDate: new Date(),
            isGraduation,
            notes,
          }

          promotions.push(promotion)

          // Update student record
          const updateData: any = {
            $set: {
              class: toClass,
              section: toSection,
              academicYear,
              updatedAt: new Date(),
            },
            $push: {
              previousClasses: {
                class: student.class,
                section: student.section,
                academicYear: student.academicYear,
                promotedDate: new Date().toISOString(),
              },
            },
          }

          // If it's graduation, mark as graduated
          if (isGraduation) {
            updateData.$set.status = "graduated"
            updateData.$set.graduationDate = new Date().toISOString()
          }

          await db.collection("students").updateOne({ _id: new ObjectId(studentId) }, updateData, { session })
        }

        // Insert promotion records
        if (promotions.length > 0) {
          await db.collection("promotions").insertMany(promotions, { session })
        }
      })

      return { success: true, promotedCount: validStudentIds.length }
    } finally {
      await session.endSession()
    }
  } catch (error) {
    console.error("Error promoting students:", error)
    throw error
  }
}

export async function getPromotionHistory(schoolId: string, academicYear?: string) {
  try {
    const { db } = await connectToDatabase()

    const pipeline = [
      {
        $lookup: {
          from: "students",
          localField: "studentId",
          foreignField: "_id",
          as: "student",
        },
      },
      {
        $unwind: "$student",
      },
      {
        $match: {
          "student.schoolId": schoolId,
          ...(academicYear && { academicYear }),
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "promotedBy",
          foreignField: "_id",
          as: "promotedByUser",
        },
      },
      {
        $unwind: "$promotedByUser",
      },
      {
        $sort: { promotionDate: -1 },
      },
    ]

    const promotions = await db.collection("promotions").aggregate(pipeline).toArray()

    return promotions.map((promotion) => ({
      ...promotion,
      _id: promotion._id.toString(),
      studentName: promotion.student.name,
      promotedByName: promotion.promotedByUser.name,
    }))
  } catch (error) {
    console.error("Error fetching promotion history:", error)
    throw new Error("Failed to fetch promotion history")
  }
}

export async function getStudentsByClass(schoolId: string, className: string, section?: string) {
  try {
    const { db } = await connectToDatabase()

    const query: any = {
      schoolId,
      class: className,
      status: "active",
    }

    if (section) {
      query.section = section
    }

    const students = await db.collection("students").find(query).sort({ section: 1, rollNumber: 1 }).toArray()

    return students.map((student) => ({
      ...student,
      _id: student._id.toString(),
    }))
  } catch (error) {
    console.error("Error fetching students by class:", error)
    throw new Error("Failed to fetch students by class")
  }
}

export async function getGraduatedStudents(schoolId: string, academicYear?: string) {
  try {
    const { db } = await connectToDatabase()

    const query: any = {
      schoolId,
      status: "graduated",
    }

    if (academicYear) {
      query.academicYear = academicYear
    }

    const students = await db.collection("students").find(query).sort({ graduationDate: -1 }).toArray()

    return students.map((student) => ({
      ...student,
      _id: student._id.toString(),
    }))
  } catch (error) {
    console.error("Error fetching graduated students:", error)
    throw new Error("Failed to fetch graduated students")
  }
}

export async function getStudentStats(schoolId: string) {
  try {
    const { db } = await connectToDatabase()

    const pipeline = [
      { $match: { schoolId } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          active: { $sum: { $cond: [{ $eq: ["$status", "active"] }, 1, 0] } },
          graduated: { $sum: { $cond: [{ $eq: ["$status", "graduated"] }, 1, 0] } },
          inactive: { $sum: { $cond: [{ $eq: ["$status", "inactive"] }, 1, 0] } },
          transferred: { $sum: { $cond: [{ $eq: ["$status", "transferred"] }, 1, 0] } },
        },
      },
    ]

    const [stats] = await db.collection("students").aggregate(pipeline).toArray()

    const classPipeline = [
      { $match: { schoolId, status: "active" } },
      { $group: { _id: "$class", count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]

    const classStats = await db.collection("students").aggregate(classPipeline).toArray()
    const byClass = classStats.reduce((acc, item) => {
      acc[item._id] = item.count
      return acc
    }, {})

    const sectionPipeline = [
      { $match: { schoolId, status: "active" } },
      { $group: { _id: "$section", count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]

    const sectionStats = await db.collection("students").aggregate(sectionPipeline).toArray()
    const bySection = sectionStats.reduce((acc, item) => {
      acc[item._id] = item.count
      return acc
    }, {})

    return {
      total: stats?.total || 0,
      active: stats?.active || 0,
      graduated: stats?.graduated || 0,
      inactive: stats?.inactive || 0,
      transferred: stats?.transferred || 0,
      byClass,
      bySection,
    }
  } catch (error) {
    console.error("Error fetching student stats:", error)
    throw new Error("Failed to fetch student stats")
  }
}
