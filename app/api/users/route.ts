import { type NextRequest, NextResponse } from "next/server";
import { getAllUsers, createUser } from "@/lib/db/users";
import { verifyToken } from "@/lib/jwt";

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const token = request.cookies.get("auth-token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = await verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    // Get query parameters for filtering and pagination
    const { searchParams } = new URL(request.url);
    const filters = {
      role: searchParams.get("role") || undefined,
      schoolId: searchParams.get("schoolId") || undefined,
      status: searchParams.get("status") || undefined,
      search: searchParams.get("search") || undefined,
      page: Number.parseInt(searchParams.get("page") || "1"),
      limit: Number.parseInt(searchParams.get("limit") || "10"),
    };

    const result = await getAllUsers(filters);

    // Transform users to match frontend interface
    const transformedUsers = result.users.map((user) => ({
      id: user._id?.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      schoolId: user.schoolId,
      schoolName: user.schoolName,
      status:
        typeof user.isActive === "boolean"
          ? user.isActive
            ? "active"
            : "inactive"
          : "inactive",
      lastLogin:
        user.lastLogin instanceof Date
          ? user.lastLogin.toISOString()
          : user.lastLogin || null,
      createdAt:
        user.createdAt instanceof Date
          ? user.createdAt.toISOString()
          : user.createdAt || null,
      avatar: user.avatar || "/placeholder.svg?height=40&width=40",
    }));

    return NextResponse.json({
      users: transformedUsers,
      pagination: result.pagination,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const token = request.cookies.get("auth-token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = await verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    // Check if user has permission to create users
    if (decoded.role !== "super-admin") {
      return NextResponse.json(
        { error: "Insufficient permissions" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { name, email, password, role, schoolId, schoolName } = body;

    // Validate required fields
    if (!name || !email || !password || !role) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate role-specific requirements
    if ((role === "school" || role === "eca") && !schoolId) {
      return NextResponse.json(
        {
          error:
            "School ID is required for school admin and ECA coordinator roles",
        },
        { status: 400 }
      );
    }

    const userData = {
      name,
      email: email.toLowerCase(),
      password,
      role,
      schoolId: role === "super-admin" ? undefined : schoolId,
      schoolName: role === "super-admin" ? undefined : schoolName,
      isActive: true,
      avatar: "/placeholder.svg?height=40&width=40",
    };

    const result = await createUser(userData);

    return NextResponse.json({
      message: "User created successfully",
      userId: result.insertedId.toString(),
    });
  } catch (error: any) {
    if (error.message === "User with this email already exists") {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }

    return NextResponse.json(
      { error: "Failed to create user" },
      { status: 500 }
    );
  }
}
