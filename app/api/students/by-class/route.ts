import { type NextRequest, NextResponse } from "next/server";
import { getStudentsByClass } from "@/lib/db/students";
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

    const className = searchParams.get("class");
    const section = searchParams.get("section") || undefined;

    if (!schoolId || !className) {
      return NextResponse.json(
        {
          error: "School ID and class name are required",
        },
        { status: 400 }
      );
    }

    const students = await getStudentsByClass(schoolId, className, section);
    return NextResponse.json(students);
  } catch (error) {
    console.error("Error in GET /api/students/by-class:", error);
    return NextResponse.json(
      { error: "Failed to fetch students by class" },
      { status: 500 }
    );
  }
}
