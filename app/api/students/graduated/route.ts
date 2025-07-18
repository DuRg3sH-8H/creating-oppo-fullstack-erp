import { type NextRequest, NextResponse } from "next/server";
import { getGraduatedStudents } from "@/lib/db/students";
import { verifyToken } from "@/lib/jwt";

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("auth-token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const schoolId =
      decoded.role === "school"
        ? searchParams.get("schoolId") || decoded.schoolId
        : decoded.schoolId;

    if (!schoolId) {
      return NextResponse.json(
        { error: "School ID required" },
        { status: 400 }
      );
    }

    const academicYear = searchParams.get("academicYear") || undefined;
    const graduatedStudents = await getGraduatedStudents(
      schoolId,
      academicYear
    );

    return NextResponse.json(graduatedStudents);
  } catch (error) {
    console.error("Error in GET /api/students/graduated:", error);
    return NextResponse.json(
      { error: "Failed to fetch graduated students" },
      { status: 500 }
    );
  }
}
