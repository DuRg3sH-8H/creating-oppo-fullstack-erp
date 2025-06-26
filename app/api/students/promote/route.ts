import { type NextRequest, NextResponse } from "next/server";
import { promoteStudents } from "@/lib/db/students";
import { verifyToken } from "@/lib/jwt";

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get("auth-token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    // Only school admins and super admins can promote students
    if (!["school", "super_admin"].includes(decoded.role)) {
      return NextResponse.json(
        { error: "Insufficient permissions" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { studentIds, toClass, toSection, academicYear, notes } = body;

    if (!studentIds || !Array.isArray(studentIds) || studentIds.length === 0) {
      return NextResponse.json(
        { error: "Student IDs are required" },
        { status: 400 }
      );
    }

    if (!toClass || !toSection || !academicYear) {
      return NextResponse.json(
        {
          error: "Target class, section, and academic year are required",
        },
        { status: 400 }
      );
    }

    const result = await promoteStudents(
      studentIds,
      toClass,
      toSection,
      academicYear,
      decoded.userId,
      notes
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error in POST /api/students/promote:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to promote students",
      },
      { status: 500 }
    );
  }
}
