import clientPromise from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export interface DashboardStats {
  totalUsers?: number
  totalSchools?: number
  totalStudents?: number
  totalClubs?: number
  totalTrainings?: number
  totalDocuments?: number
  recentActivities?: Activity[]
  kpiData?: KPIData[]
}

export interface Activity {
  id: string
  title: string
  description: string
  timestamp: Date
  type: "user" | "school" | "training" | "document" | "club" | "login" | "iso"
  user?: string
  userId?: string
  schoolId?: string
}

export interface KPIData {
  title: string
  value: number
  change: number
  trend: "up" | "down" | "stable"
  icon: string
}

export async function getDashboardStats(userRole: string, schoolId?: string): Promise<DashboardStats> {
  try {
    const client = await clientPromise
    const db = client.db(process.env.MONGODB_DB)

    const stats: DashboardStats = {}

    switch (userRole) {
      case "super-admin":
        // Super admin sees system-wide statistics
        const [
          totalUsers,
          totalSchools,
          totalStudents,
          totalClubs,
          totalTrainings,
          totalDocuments,
          lastMonthUsers,
          lastMonthSchools,
          lastMonthStudents,
          lastMonthTrainings,
        ] = await Promise.all([
          db.collection("users").countDocuments(),
          db.collection("schools").countDocuments(),
          db.collection("students").countDocuments(),
          db.collection("clubs").countDocuments(),
          db.collection("trainings").countDocuments(),
          db.collection("documents").countDocuments(),
          // Get counts from last month for comparison
          db
            .collection("users")
            .countDocuments({
              createdAt: { $lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
            }),
          db.collection("schools").countDocuments({
            createdAt: { $lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
          }),
          db.collection("students").countDocuments({
            createdAt: { $lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
          }),
          db.collection("trainings").countDocuments({
            createdAt: { $lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
          }),
        ])

        stats.totalUsers = totalUsers
        stats.totalSchools = totalSchools
        stats.totalStudents = totalStudents
        stats.totalClubs = totalClubs
        stats.totalTrainings = totalTrainings
        stats.totalDocuments = totalDocuments

        // Calculate percentage changes
        const userChange = lastMonthUsers > 0 ? Math.round(((totalUsers - lastMonthUsers) / lastMonthUsers) * 100) : 0
        const schoolChange =
          lastMonthSchools > 0 ? Math.round(((totalSchools - lastMonthSchools) / lastMonthSchools) * 100) : 0
        const studentChange =
          lastMonthStudents > 0 ? Math.round(((totalStudents - lastMonthStudents) / lastMonthStudents) * 100) : 0
        const trainingChange =
          lastMonthTrainings > 0 ? Math.round(((totalTrainings - lastMonthTrainings) / lastMonthTrainings) * 100) : 0

        stats.kpiData = [
          {
            title: "Total Schools",
            value: totalSchools,
            change: schoolChange,
            trend: schoolChange > 0 ? "up" : schoolChange < 0 ? "down" : "stable",
            icon: "school",
          },
          {
            title: "Total Users",
            value: totalUsers,
            change: userChange,
            trend: userChange > 0 ? "up" : userChange < 0 ? "down" : "stable",
            icon: "users",
          },
          {
            title: "Active Students",
            value: totalStudents,
            change: studentChange,
            trend: studentChange > 0 ? "up" : studentChange < 0 ? "down" : "stable",
            icon: "graduation-cap",
          },
          {
            title: "Total Trainings",
            value: totalTrainings,
            change: trainingChange,
            trend: trainingChange > 0 ? "up" : trainingChange < 0 ? "down" : "stable",
            icon: "book-open",
          },
        ]
        break

      case "school":
        // School admin sees school-specific statistics
        if (!schoolId) {
          stats.kpiData = []
          stats.recentActivities = []
          break
        }

        const schoolFilter = { schoolId: new ObjectId(schoolId) }
        const [
          schoolStudents,
          schoolClubs,
          schoolTrainings,
          schoolDocuments,
          lastMonthSchoolStudents,
          lastMonthSchoolClubs,
          lastMonthSchoolTrainings,
          lastMonthSchoolDocuments,
        ] = await Promise.all([
          db.collection("students").countDocuments(schoolFilter),
          db.collection("clubs").countDocuments(schoolFilter),
          db.collection("trainings").countDocuments(schoolFilter),
          db.collection("documents").countDocuments(schoolFilter),
          // Last month comparisons
          db
            .collection("students")
            .countDocuments({
              ...schoolFilter,
              createdAt: { $lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
            }),
          db.collection("clubs").countDocuments({
            ...schoolFilter,
            createdAt: { $lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
          }),
          db.collection("trainings").countDocuments({
            ...schoolFilter,
            createdAt: { $lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
          }),
          db.collection("documents").countDocuments({
            ...schoolFilter,
            createdAt: { $lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
          }),
        ])

        stats.totalStudents = schoolStudents
        stats.totalClubs = schoolClubs
        stats.totalTrainings = schoolTrainings
        stats.totalDocuments = schoolDocuments

        const studentsChange =
          lastMonthSchoolStudents > 0
            ? Math.round(((schoolStudents - lastMonthSchoolStudents) / lastMonthSchoolStudents) * 100)
            : 0
        const clubsChange =
          lastMonthSchoolClubs > 0 ? Math.round(((schoolClubs - lastMonthSchoolClubs) / lastMonthSchoolClubs) * 100) : 0
        const trainingsChange =
          lastMonthSchoolTrainings > 0
            ? Math.round(((schoolTrainings - lastMonthSchoolTrainings) / lastMonthSchoolTrainings) * 100)
            : 0
        const documentsChange =
          lastMonthSchoolDocuments > 0
            ? Math.round(((schoolDocuments - lastMonthSchoolDocuments) / lastMonthSchoolDocuments) * 100)
            : 0

        stats.kpiData = [
          {
            title: "Total Students",
            value: schoolStudents,
            change: studentsChange,
            trend: studentsChange > 0 ? "up" : studentsChange < 0 ? "down" : "stable",
            icon: "users",
          },
          {
            title: "Active Clubs",
            value: schoolClubs,
            change: clubsChange,
            trend: clubsChange > 0 ? "up" : clubsChange < 0 ? "down" : "stable",
            icon: "award",
          },
          {
            title: "Trainings",
            value: schoolTrainings,
            change: trainingsChange,
            trend: trainingsChange > 0 ? "up" : trainingsChange < 0 ? "down" : "stable",
            icon: "book-open",
          },
          {
            title: "Documents",
            value: schoolDocuments,
            change: documentsChange,
            trend: documentsChange > 0 ? "up" : documentsChange < 0 ? "down" : "stable",
            icon: "file-text",
          },
        ]
        break

      case "eca":
        // ECA coordinator sees club-specific statistics
        if (!schoolId) {
          stats.kpiData = []
          stats.recentActivities = []
          break
        }

        const ecaFilter = { schoolId: new ObjectId(schoolId) }
        const [ecaClubs, clubMembers, ecaEvents, ecaAchievements] = await Promise.all([
          db.collection("clubs").countDocuments(ecaFilter),
          db.collection("club_members").countDocuments(ecaFilter),
          db.collection("events").countDocuments({
            ...ecaFilter,
            date: { $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) },
          }),
          db.collection("achievements").countDocuments(ecaFilter),
        ])

        stats.kpiData = [
          {
            title: "Managed Clubs",
            value: ecaClubs,
            change: 0,
            trend: "stable",
            icon: "award",
          },
          {
            title: "Club Members",
            value: clubMembers,
            change: 0,
            trend: "stable",
            icon: "users",
          },
          {
            title: "Events This Month",
            value: ecaEvents,
            change: 0,
            trend: "stable",
            icon: "calendar",
          },
          {
            title: "Achievements",
            value: ecaAchievements,
            change: 0,
            trend: "stable",
            icon: "trophy",
          },
        ]
        break

      default:
        stats.kpiData = []
        stats.recentActivities = []
    }

    // Get real recent activities
    stats.recentActivities = await getRecentActivities(userRole, schoolId)

    return stats
  } catch (error) {
    console.error("Error fetching dashboard stats:", error)
    return {
      kpiData: [],
      recentActivities: [],
    }
  }
}

async function getRecentActivities(userRole: string, schoolId?: string): Promise<Activity[]> {
  try {
    const client = await clientPromise
    const db = client.db(process.env.MONGODB_DB)

    // Build filter based on user role
    const filter: any = {}
    if (userRole === "school" && schoolId) {
      filter.schoolId = new ObjectId(schoolId)
    } else if (userRole === "eca" && schoolId) {
      filter.schoolId = new ObjectId(schoolId)
    }

    // Get real activities from the activities collection only
    const activities = await db.collection("activities").find(filter).sort({ timestamp: -1 }).limit(10).toArray()

    return activities.map((activity) => ({
      id: activity._id.toString(),
      title: activity.title,
      description: activity.description,
      timestamp: activity.timestamp,
      type: activity.type,
      user: activity.user,
      userId: activity.userId?.toString(),
      schoolId: activity.schoolId?.toString(),
    }))
  } catch (error) {
    console.error("Error fetching recent activities:", error)
    return []
  }
}

// Function to log activities (to be called when actions are performed)
export async function logActivity(activity: Omit<Activity, "id">): Promise<void> {
  try {
    const client = await clientPromise
    const db = client.db(process.env.MONGODB_DB)

    await db.collection("activities").insertOne({
      ...activity,
      timestamp: new Date(),
      createdAt: new Date(),
    })
  } catch (error) {
    console.error("Error logging activity:", error)
  }
}
