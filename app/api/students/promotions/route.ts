import { type NextRequest, NextResponse } from "next/server";
import { getPromotionHistory } from "@/lib/db/students";
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
    const promotions = await getPromotionHistory(schoolId, academicYear);

    return NextResponse.json(promotions);
  } catch (error) {
    console.error("Error in GET /api/students/promotions:", error);
    return NextResponse.json(
      { error: "Failed to fetch promotion history" },
      { status: 500 }
    );
  }
}
