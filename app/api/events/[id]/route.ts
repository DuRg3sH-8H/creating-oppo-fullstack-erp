import { type NextRequest, NextResponse } from "next/server";
import { updateEvent, deleteEvent } from "@/lib/db/events";
import { verifyToken } from "@/lib/jwt";

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = request.cookies.get("auth-token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== "super-admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const eventData = await request.json();
    await updateEvent(params.id, eventData);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating event:", error);
    return NextResponse.json(
      { error: "Failed to update event" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const token = request.cookies.get("auth-token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== "super-admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Await params for dynamic API routes in Next.js
    const { id } = await context.params;
    if (!id || typeof id !== "string" || id.length !== 24) {
      return NextResponse.json({ error: "Invalid event ID" }, { status: 400 });
    }

    await deleteEvent(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    // Removed console.error for production readiness
    return NextResponse.json(
      { error: "Failed to delete event" },
      { status: 500 }
    );
  }
}
