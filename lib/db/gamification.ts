import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export interface GamificationStats {
  totalPoints: number;
  level: number;
  levelProgress: number;
  pointsToNextLevel: number;
  rank: number;
  achievements: Achievement[];
  activeChallenges: Challenge[];
  badges: Badge[];
  streak: number;
  weeklyProgress: number;
  monthlyGoal: number;
  recentActivities: GamificationActivity[];
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  points: number;
  completed: boolean;
  progress: number;
  rarity: "common" | "rare" | "epic" | "legendary";
  completedAt?: Date;
  claimed: boolean; // Always auto-claimed
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  type: "daily" | "weekly" | "monthly";
  points: number;
  progress: number;
  deadline: string;
  completed: boolean;
  target: number;
  category: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  rarity: "common" | "rare" | "epic" | "legendary";
  earnedAt?: string;
}

export interface GamificationActivity {
  id: string;
  type: string;
  description: string;
  points: number;
  timestamp: Date;
}

export async function getGamificationStats(
  userId: string,
  userRole: string,
  schoolId?: string
): Promise<GamificationStats> {
  try {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);

    // Get user's gamification data
    const userStats = await db
      .collection("user_gamification")
      .findOne({ userId: new ObjectId(userId) });

    if (!userStats) {
      // Initialize user gamification data
      await initializeUserGamification(userId, userRole, schoolId);
      return getGamificationStats(userId, userRole, schoolId);
    }

    // Calculate level and progress
    const totalPoints = userStats.totalPoints || 0;
    const level = Math.floor(totalPoints / 1000) + 1;
    const pointsInCurrentLevel = totalPoints % 1000;
    const pointsToNextLevel = 1000 - pointsInCurrentLevel;
    const levelProgress = (pointsInCurrentLevel / 1000) * 100;

    // Get user's rank
    const rank = await getUserRank(userId, schoolId);

    // Get achievements
    const achievements = await getUserAchievements(userId, userRole);

    // Get active challenges
    const activeChallenges = await getActiveChallenges(userId, userRole);

    // Get badges
    const badges = await getUserBadges(userId);

    // Get recent activities
    const recentActivities = await getRecentGamificationActivities(userId);

    // Calculate streak and weekly progress
    const streak = await calculateStreak(userId);
    const weeklyProgress = await getWeeklyProgress(userId);

    return {
      totalPoints,
      level,
      levelProgress,
      pointsToNextLevel,
      rank,
      achievements,
      activeChallenges,
      badges,
      streak,
      weeklyProgress,
      monthlyGoal: 5000, // Default monthly goal
      recentActivities,
    };
  } catch (error) {
    console.error("Error fetching gamification stats:", error);
    throw error;
  }
}

export async function initializeUserGamification(
  userId: string,
  userRole: string,
  schoolId?: string
) {
  const client = await clientPromise;
  const db = client.db(process.env.MONGODB_DB);

  await db.collection("user_gamification").insertOne({
    userId: new ObjectId(userId),
    totalPoints: 0,
    level: 1,
    badges: [],
    achievements: [],
    streak: 0,
    lastActivity: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  // Initialize role-specific achievements and challenges
  await initializeRoleSpecificData(userId, userRole, schoolId);
}

export async function initializeRoleSpecificData(
  userId: string,
  userRole: string,
  schoolId?: string
) {
  const client = await clientPromise;
  const db = client.db(process.env.MONGODB_DB);

  // Create role-specific achievements
  const achievements = getRoleAchievements(userRole);
  for (const achievement of achievements) {
    await db.collection("user_achievements").insertOne({
      userId: new ObjectId(userId),
      achievementId: achievement.id,
      progress: 0,
      completed: false,
      claimed: false,
      createdAt: new Date(),
    });
  }

  // Create role-specific challenges
  const challenges = getRoleChallenges(userRole);
  for (const challenge of challenges) {
    await db.collection("user_challenges").insertOne({
      userId: new ObjectId(userId),
      challengeId: challenge.id,
      progress: 0,
      completed: false,
      deadline: new Date(Date.now() + getChallengeDeadline(challenge.type)),
      createdAt: new Date(),
    });
  }
}

export function getRoleAchievements(userRole: string): Achievement[] {
  const commonAchievements = [
    {
      id: "first_login",
      title: "Welcome Aboard",
      description: "Complete your first login",
      icon: "user-check",
      points: 50,
      completed: false,
      progress: 0,
      rarity: "common" as const,
      claimed: false,
    },
    {
      id: "profile_complete",
      title: "Profile Master",
      description: "Complete your profile information",
      icon: "user",
      points: 100,
      completed: false,
      progress: 0,
      rarity: "common" as const,
      claimed: false,
    },
  ];

  const roleSpecific: Record<string, Achievement[]> = {
    school: [
      {
        id: "student_manager",
        title: "Student Manager",
        description: "Add or edit 10 students",
        icon: "users",
        points: 200,
        completed: false,
        progress: 0,
        rarity: "rare" as const,
        claimed: false,
      },
      {
        id: "iso_compliance",
        title: "ISO Champion",
        description: "Complete 10 ISO submissions",
        icon: "award",
        points: 500,
        completed: false,
        progress: 0,
        rarity: "epic" as const,
        claimed: false,
      },
      {
        id: "resource_downloader",
        title: "Resource Collector",
        description: "Download 20 documents",
        icon: "download",
        points: 150,
        completed: false,
        progress: 0,
        rarity: "common" as const,
        claimed: false,
      },
      {
        id: "event_participant",
        title: "Event Enthusiast",
        description: "Attend 5 school events",
        icon: "calendar",
        points: 250,
        completed: false,
        progress: 0,
        rarity: "rare" as const,
        claimed: false,
      },
    ],
    eca: [
      {
        id: "club_joiner",
        title: "Club Enthusiast",
        description: "Join 3 different clubs",
        icon: "trophy",
        points: 200,
        completed: false,
        progress: 0,
        rarity: "rare" as const,
        claimed: false,
      },
      {
        id: "event_attendee",
        title: "Event Regular",
        description: "Attend 10 events",
        icon: "calendar",
        points: 300,
        completed: false,
        progress: 0,
        rarity: "rare" as const,
        claimed: false,
      },
      {
        id: "recognition_giver",
        title: "Recognition Master",
        description: "Give recognition to 20 students",
        icon: "award",
        points: 400,
        completed: false,
        progress: 0,
        rarity: "epic" as const,
        claimed: false,
      },
      {
        id: "resource_user",
        title: "Resource Expert",
        description: "Download 15 resources",
        icon: "download",
        points: 100,
        completed: false,
        progress: 0,
        rarity: "common" as const,
        claimed: false,
      },
    ],
  };

  return [...commonAchievements, ...(roleSpecific[userRole] || [])];
}

export function getRoleChallenges(userRole: string): Challenge[] {
  const commonChallenges = [
    {
      id: "daily_login",
      title: "Daily Dedication",
      description: "Login every day this week",
      type: "weekly" as const,
      points: 100,
      progress: 0,
      deadline: "",
      completed: false,
      target: 7,
      category: "engagement",
    },
  ];

  const roleSpecific: Record<string, Challenge[]> = {
    school: [
      {
        id: "weekly_downloads",
        title: "Resource Seeker",
        description: "Download 5 documents this week",
        type: "weekly" as const,
        points: 75,
        progress: 0,
        deadline: "",
        completed: false,
        target: 5,
        category: "learning",
      },
      {
        id: "monthly_iso",
        title: "ISO Progress",
        description: "Complete 3 ISO submissions this month",
        type: "monthly" as const,
        points: 300,
        progress: 0,
        deadline: "",
        completed: false,
        target: 3,
        category: "compliance",
      },
    ],
    eca: [
      {
        id: "weekly_participation",
        title: "Active Participant",
        description: "Attend 2 events this week",
        type: "weekly" as const,
        points: 150,
        progress: 0,
        deadline: "",
        completed: false,
        target: 2,
        category: "participation",
      },
      {
        id: "monthly_recognition",
        title: "Recognition Champion",
        description: "Give recognition to 10 students this month",
        type: "monthly" as const,
        points: 200,
        progress: 0,
        deadline: "",
        completed: false,
        target: 10,
        category: "recognition",
      },
    ],
  };

  return [...commonChallenges, ...(roleSpecific[userRole] || [])];
}

export function getChallengeDeadline(type: string): number {
  switch (type) {
    case "daily":
      return 24 * 60 * 60 * 1000; // 1 day
    case "weekly":
      return 7 * 24 * 60 * 60 * 1000; // 7 days
    case "monthly":
      return 30 * 24 * 60 * 60 * 1000; // 30 days
    default:
      return 7 * 24 * 60 * 60 * 1000;
  }
}

export async function getUserRank(
  userId: string,
  schoolId?: string
): Promise<number> {
  const client = await clientPromise;
  const db = client.db(process.env.MONGODB_DB);

  const filter = schoolId ? { schoolId: new ObjectId(schoolId) } : {};

  const userStats = await db
    .collection("user_gamification")
    .findOne({ userId: new ObjectId(userId) });
  if (!userStats) return 1;

  const rank = await db.collection("user_gamification").countDocuments({
    ...filter,
    totalPoints: { $gt: userStats.totalPoints },
  });

  return rank + 1;
}

export async function getUserAchievements(
  userId: string,
  userRole: string
): Promise<Achievement[]> {
  const client = await clientPromise;
  const db = client.db(process.env.MONGODB_DB);

  const userAchievements = await db
    .collection("user_achievements")
    .find({ userId: new ObjectId(userId) })
    .toArray();
  const roleAchievements = getRoleAchievements(userRole);

  return roleAchievements.map((achievement) => {
    const userAchievement = userAchievements.find(
      (ua) => ua.achievementId === achievement.id
    );
    return {
      ...achievement,
      progress: userAchievement?.progress || 0,
      completed: userAchievement?.completed || false,
      completedAt: userAchievement?.completedAt,
      claimed: userAchievement?.claimed || false, // Always auto-claimed when completed
    };
  });
}

export async function getActiveChallenges(
  userId: string,
  userRole: string
): Promise<Challenge[]> {
  const client = await clientPromise;
  const db = client.db(process.env.MONGODB_DB);

  const userChallenges = await db
    .collection("user_challenges")
    .find({
      userId: new ObjectId(userId),
      deadline: { $gt: new Date() },
    })
    .toArray();

  const roleChallenges = getRoleChallenges(userRole);

  return roleChallenges.map((challenge) => {
    const userChallenge = userChallenges.find(
      (uc) => uc.challengeId === challenge.id
    );
    return {
      ...challenge,
      progress: userChallenge?.progress || 0,
      completed: userChallenge?.completed || false,
      deadline:
        userChallenge?.deadline?.toISOString() ||
        new Date(
          Date.now() + getChallengeDeadline(challenge.type)
        ).toISOString(),
    };
  });
}

export async function getUserBadges(userId: string): Promise<Badge[]> {
  const client = await clientPromise;
  const db = client.db(process.env.MONGODB_DB);

  const userBadges = await db
    .collection("user_badges")
    .find({ userId: new ObjectId(userId) })
    .toArray();

  return userBadges.map((badge) => ({
    id: badge._id.toString(),
    name: badge.name,
    description: badge.description,
    icon: badge.icon,
    color: badge.color,
    rarity: badge.rarity,
    earnedAt: badge.earnedAt?.toISOString(),
  }));
}

export async function calculateStreak(userId: string): Promise<number> {
  const client = await clientPromise;
  const db = client.db(process.env.MONGODB_DB);

  // Get user's login activities for the last 30 days
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const activities = await db
    .collection("gamification_activities")
    .find({
      userId: new ObjectId(userId),
      type: "daily_login",
      timestamp: { $gte: thirtyDaysAgo },
    })
    .sort({ timestamp: -1 })
    .toArray();

  let streak = 0;
  const currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);

  for (const activity of activities) {
    const activityDate = new Date(activity.timestamp);
    activityDate.setHours(0, 0, 0, 0);

    if (activityDate.getTime() === currentDate.getTime()) {
      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
}

export async function getWeeklyProgress(userId: string): Promise<number> {
  const client = await clientPromise;
  const db = client.db(process.env.MONGODB_DB);

  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());
  weekStart.setHours(0, 0, 0, 0);

  const weeklyPoints = await db
    .collection("gamification_activities")
    .aggregate([
      {
        $match: {
          userId: new ObjectId(userId),
          timestamp: { $gte: weekStart },
        },
      },
      {
        $group: {
          _id: null,
          totalPoints: { $sum: "$points" },
        },
      },
    ])
    .toArray();

  return weeklyPoints[0]?.totalPoints || 0;
}

export async function updateAchievements(
  userId: string,
  taskType: string,
  metadata?: any
) {
  const client = await clientPromise;
  const db = client.db(process.env.MONGODB_DB);

  // Update relevant achievements based on task type
  const achievementUpdates: Record<string, string[]> = {
    student_add: ["student_manager"],
    student_edit: ["student_manager"],
    document_download: ["resource_downloader", "resource_user"],
    event_attend: ["event_participant", "event_attendee"],
    iso_submission: ["iso_compliance"],
    club_join: ["club_joiner"],
    recognition_give: ["recognition_giver"],
  };

  const relevantAchievements = achievementUpdates[taskType] || [];

  for (const achievementId of relevantAchievements) {
    await db
      .collection("user_achievements")
      .updateOne(
        { userId: new ObjectId(userId), achievementId },
        { $inc: { progress: 1 } },
        { upsert: true }
      );

    // Check if achievement is completed
    const achievement = await db.collection("user_achievements").findOne({
      userId: new ObjectId(userId),
      achievementId,
    });

    if (achievement && !achievement.completed) {
      const target = getAchievementTarget(achievementId);
      if (achievement.progress >= target) {
        await db.collection("user_achievements").updateOne(
          { userId: new ObjectId(userId), achievementId },
          {
            $set: {
              completed: true,
              claimed: true, // Auto-claim when completed
              completedAt: new Date(),
              claimedAt: new Date(),
            },
          }
        );

        // Award achievement points automatically
        const achievementPoints = getAchievementPoints(achievementId);
        await db
          .collection("user_gamification")
          .updateOne(
            { userId: new ObjectId(userId) },
            { $inc: { totalPoints: achievementPoints } }
          );

        // Log achievement completion activity
        await db.collection("gamification_activities").insertOne({
          userId: new ObjectId(userId),
          type: "achievement_completed",
          description: `Completed achievement: ${getAchievementTitle(
            achievementId
          )}`,
          points: achievementPoints,
          metadata: { achievementId },
          timestamp: new Date(),
        });
      }
    }
  }
}

export async function updateChallenges(
  userId: string,
  taskType: string,
  metadata?: any
) {
  const client = await clientPromise;
  const db = client.db(process.env.MONGODB_DB);

  // Update relevant challenges based on task type
  const challengeUpdates: Record<string, string[]> = {
    daily_login: ["daily_login"],
    document_download: ["weekly_downloads"],
    event_attend: ["weekly_participation"],
    iso_submission: ["monthly_iso"],
    recognition_give: ["monthly_recognition"],
  };

  const relevantChallenges = challengeUpdates[taskType] || [];

  for (const challengeId of relevantChallenges) {
    await db.collection("user_challenges").updateOne(
      {
        userId: new ObjectId(userId),
        challengeId,
        deadline: { $gt: new Date() },
      },
      { $inc: { progress: 1 } },
      { upsert: true }
    );

    // Check if challenge is completed
    const challenge = await db.collection("user_challenges").findOne({
      userId: new ObjectId(userId),
      challengeId,
      deadline: { $gt: new Date() },
    });

    if (challenge && !challenge.completed) {
      const target = getChallengeTarget(challengeId);
      if (challenge.progress >= target) {
        await db.collection("user_challenges").updateOne(
          { userId: new ObjectId(userId), challengeId },
          {
            $set: {
              completed: true,
              completedAt: new Date(),
            },
          }
        );

        // Award challenge points automatically
        const challengePoints = getChallengePoints(challengeId);
        await db
          .collection("user_gamification")
          .updateOne(
            { userId: new ObjectId(userId) },
            { $inc: { totalPoints: challengePoints } }
          );

        // Log challenge completion activity
        await db.collection("gamification_activities").insertOne({
          userId: new ObjectId(userId),
          type: "challenge_completed",
          description: `Completed challenge: ${getChallengeTitle(challengeId)}`,
          points: challengePoints,
          metadata: { challengeId },
          timestamp: new Date(),
        });
      }
    }
  }
}

export function getAchievementTarget(achievementId: string): number {
  const targets: Record<string, number> = {
    student_manager: 10,
    resource_downloader: 20,
    resource_user: 15,
    event_participant: 5,
    event_attendee: 10,
    iso_compliance: 10,
    club_joiner: 3,
    recognition_giver: 20,
  };

  return targets[achievementId] || 1;
}

export function getAchievementPoints(achievementId: string): number {
  const points: Record<string, number> = {
    student_manager: 200,
    resource_downloader: 150,
    resource_user: 100,
    event_participant: 250,
    event_attendee: 300,
    iso_compliance: 500,
    club_joiner: 200,
    recognition_giver: 400,
  };

  return points[achievementId] || 100;
}

export function getAchievementTitle(achievementId: string): string {
  const titles: Record<string, string> = {
    student_manager: "Student Manager",
    resource_downloader: "Resource Collector",
    resource_user: "Resource Expert",
    event_participant: "Event Enthusiast",
    event_attendee: "Event Regular",
    iso_compliance: "ISO Champion",
    club_joiner: "Club Enthusiast",
    recognition_giver: "Recognition Master",
  };

  return titles[achievementId] || "Achievement";
}

export function getChallengeTarget(challengeId: string): number {
  const targets: Record<string, number> = {
    daily_login: 7,
    weekly_downloads: 5,
    weekly_participation: 2,
    monthly_iso: 3,
    monthly_recognition: 10,
  };

  return targets[challengeId] || 1;
}

export function getChallengePoints(challengeId: string): number {
  const points: Record<string, number> = {
    daily_login: 100,
    weekly_downloads: 75,
    weekly_participation: 150,
    monthly_iso: 300,
    monthly_recognition: 200,
  };

  return points[challengeId] || 50;
}

export function getChallengeTitle(challengeId: string): string {
  const titles: Record<string, string> = {
    daily_login: "Daily Dedication",
    weekly_downloads: "Resource Seeker",
    weekly_participation: "Active Participant",
    monthly_iso: "ISO Progress",
    monthly_recognition: "Recognition Champion",
  };

  return titles[challengeId] || "Challenge";
}

export async function getRecentGamificationActivities(
  userId: string
): Promise<GamificationActivity[]> {
  const client = await clientPromise;
  const db = client.db(process.env.MONGODB_DB);

  const activities = await db
    .collection("gamification_activities")
    .find({ userId: new ObjectId(userId) })
    .sort({ timestamp: -1 })
    .limit(10)
    .toArray();

  return activities.map((activity) => ({
    id: activity._id.toString(),
    type: activity.type,
    description: activity.description,
    points: activity.points,
    timestamp: activity.timestamp,
  }));
}

export async function completeTaskForUser(
  userId: string,
  taskType: string,
  metadata?: any
) {
  try {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);

    // Get user data to determine role and school
    const user = await db
      .collection("users")
      .findOne({ _id: new ObjectId(userId) });
    if (!user) {
      throw new Error("User not found");
    }

    // Points awarded for different task types
    const taskPoints: Record<string, number> = {
      login: 10,
      profile_update: 20,
      document_upload: 15,
      document_download: 5,
      event_participation: 25,
      iso_submission: 30,
      club_join: 20,
      training_completion: 50,
      message_sent: 5,
      recognition_given: 15,
    };

    const points = taskPoints[taskType] || 10;

    // Update user's total points
    await db.collection("users").updateOne(
      { _id: new ObjectId(userId) },
      {
        $inc: { "gamification.totalPoints": points },
        $set: { "gamification.lastActivity": new Date() },
      }
    );

    // Log the activity
    await db.collection("gamification_activities").insertOne({
      userId: new ObjectId(userId),
      type: taskType,
      description: getTaskDescription(taskType, metadata),
      points: points,
      timestamp: new Date(),
      metadata: metadata || {},
    });

    // Update achievements and challenges
    await updateAchievements(userId, taskType, metadata);
    await updateChallenges(userId, taskType, metadata);

    // Calculate new level and progress
    const updatedUser = await db
      .collection("users")
      .findOne({ _id: new ObjectId(userId) });
    const totalPoints = updatedUser?.gamification?.totalPoints || 0;
    const level = Math.floor(totalPoints / 1000) + 1;
    const levelProgress = ((totalPoints % 1000) / 1000) * 100;
    const pointsToNextLevel = 1000 - (totalPoints % 1000);

    // Update level information
    await db.collection("users").updateOne(
      { _id: new ObjectId(userId) },
      {
        $set: {
          "gamification.level": level,
          "gamification.levelProgress": levelProgress,
          "gamification.pointsToNextLevel": pointsToNextLevel,
        },
      }
    );

    return {
      success: true,
      pointsEarned: points,
      totalPoints: totalPoints + points,
      level: level,
      levelProgress: levelProgress,
      pointsToNextLevel: pointsToNextLevel,
    };
  } catch (error) {
    console.error("Error completing task for user:", error);
    throw error;
  }
}

function getTaskDescription(taskType: string, metadata?: any): string {
  const descriptions: Record<string, string> = {
    login: "Logged into the system",
    profile_update: "Updated profile information",
    document_upload: `Uploaded document: ${
      metadata?.documentName || "Unknown"
    }`,
    document_download: `Downloaded document: ${
      metadata?.documentName || "Unknown"
    }`,
    event_participation: `Participated in event: ${
      metadata?.eventName || "Unknown"
    }`,
    iso_submission: `Submitted ISO clause: ${
      metadata?.clauseNumber || "Unknown"
    }`,
    club_join: `Joined club: ${metadata?.clubName || "Unknown"}`,
    training_completion: `Completed training: ${
      metadata?.trainingName || "Unknown"
    }`,
    message_sent: "Sent a message",
    recognition_given: `Gave recognition to ${
      metadata?.recipientName || "someone"
    }`,
  };

  return descriptions[taskType] || `Completed task: ${taskType}`;
}
