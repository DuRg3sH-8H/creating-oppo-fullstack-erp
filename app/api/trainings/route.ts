import { type NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth-utils";
import { getAllTrainings, createTraining } from "@/lib/db/trainings";

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const authResult = await verifyToken(request);
    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized",
          details: authResult.error,
        },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = Number.parseInt(searchParams.get("page") || "1");
    const limit = Number.parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const category = searchParams.get("category") || "";
    const trainer = searchParams.get("trainer") || "";

    // Build filters based on user role
    const filters: any = {
      search,
      category: category || undefined,
      trainer: trainer || undefined,
    };

    // Apply role-based filtering
    if (authResult.user.role === "super-admin") {
      // Super-admin can see all trainings
    } else if (authResult.user.role === "school") {
      // School admins can see:
      // 1. Trainings specifically for their school
      // 2. Global trainings (no schoolId or schoolId is null)
      filters.userRole = "school";
      filters.schoolId = authResult.user.schoolId;
    } else if (authResult.user.role === "eca") {
      // ECA users can see global trainings
      filters.userRole = "eca";
    } else {
      // Regular users can see global trainings
      filters.userRole = "user";
    }

    const result = await getAllTrainings(page, limit, filters);

    const response = {
      success: true,
      trainings: result.trainings,
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error(
      "❌ Error stack:",
      error instanceof Error ? error.stack : "No stack trace"
    );

    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {


  try {

    // Verify authentication
    const authResult = await verifyToken(request);
    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized",
          details: authResult.error,
        },
        { status: 401 }
      );
    }


    // Check if user is super-admin
    if (authResult.user.role !== "super-admin") {
      return NextResponse.json(
        {
          success: false,
          error: "Access denied",
          details: "Only super-admin can create trainings",
        },
        { status: 403 }
      );  
    }

    const body = await request.json();

    const trainingData = {
      title: body.title,
      description: body.description,
      date: body.date,
      time: body.time,
      duration: body.duration, // <-- Added duration property
      trainer: body.trainer,
      category: body.category,
      materials: body.materials || [],
      maxParticipants: body.maxParticipants || 50,
      registeredUsers: [],
      schoolId: body.schoolId || null, // Allow global trainings
      createdBy: authResult.user.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await createTraining(trainingData);

    if (!result) {
      return NextResponse.json(
        {
          success: false,
          error: "Failed to create training",
          details: "Database operation failed",
        },
        { status: 500 }
      );
    }

    const response = {
      success: true,
      training: result,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error(
      "❌ Error stack:",
      error instanceof Error ? error.stack : "No stack trace"
    );

    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
