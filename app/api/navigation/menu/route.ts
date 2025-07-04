import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { verifyToken } from "@/lib/jwt"
import { findUserById } from "@/lib/db/users"

export async function GET() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("auth-token")

    if (!token) {
      return NextResponse.json({ success: false, message: "Not authenticated" }, { status: 401 })
    }

    const decoded = verifyToken(token.value)
    if (!decoded || typeof decoded !== "object" || !decoded.id) {
      return NextResponse.json({ success: false, message: "Invalid token" }, { status: 401 })
    }

    const user = await findUserById(decoded.id)
    if (!user) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 })
    }

    // Generate menu items based on user role
    const menuItems = getMenuItemsByRole(user.role)

    return NextResponse.json({
      success: true,
      menuItems,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        schoolId: user.schoolId,
        schoolName: user.schoolName,
      },
    })
  } catch (error) {
    console.error("Navigation menu error:", error)
    return NextResponse.json({ success: false, message: "An error occurred" }, { status: 500 })
  }
}

function getMenuItemsByRole(role: string) {
  const baseItems = [
    {
      name: "Dashboard",
      icon: "LayoutDashboard",
      href: "/dashboard",
      roles: ["super-admin", "school", "eca"],
    },
  ]

  const allItems = [
    ...baseItems,
    {
      name: "Schools",
      icon: "GraduationCap",
      href: "/dashboard/schools",
      roles: ["super-admin"],
    },
    {
      name: "ISO Management",
      icon: "Shield",
      href: "/dashboard/iso",
      roles: ["super-admin", "school"],
    },
    {
      name: "Students",
      icon: "UserRound",
      href: "/dashboard/students",
      roles: ["school"],
    },
    {
      name: "Trainings",
      icon: "BookOpen",
      href: "/dashboard/trainings",
      roles: ["super-admin", "school", "eca"],
    },
    {
      name: "Clubs",
      icon: "Award",
      href: "/dashboard/clubs",
      roles: ["super-admin", "school", "eca"],
    },
    {
      name: "Calendar",
      icon: "Calendar",
      href: "/dashboard/calendar",
      roles: ["super-admin", "school", "eca"],
    },
    {
      name: "Documents",
      icon: "FileText",
      href: "/dashboard/documents",
      roles: ["super-admin", "school"],
    },
    {
      name: "Users",
      icon: "Users",
      href: "/dashboard/users",
      roles: ["super-admin"],
    },
    {
      name: "Messages",
      icon: "MessageSquare",
      href: "/dashboard/messages",
      roles: ["super-admin", "school", "eca"],
    },
    {
      name: "Settings",
      icon: "Settings",
      href: "/dashboard/settings",
      roles: ["super-admin", "school", "eca"],
    },
  ]

  return allItems.filter((item) => item.roles.includes(role))
}
