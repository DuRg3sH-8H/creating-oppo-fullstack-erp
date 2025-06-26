import { type NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth-utils";
import {
  getTrainingById,
  updateTraining,
  deleteTraining,
} from "@/lib/db/trainings";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    // Verify authentication
    const authResult = await verifyToken(request);
    if (!authResult.success) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const training = await getTrainingById(id);

    if (!training) {
      return NextResponse.json(
        { error: "Training not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      training,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    // Verify authentication
    const authResult = await verifyToken(request);
    if (!authResult.success) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only super-admin can update trainings
    if (authResult.user?.role !== "super-admin") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const body = await request.json();

    const updatedTraining = await updateTraining(id, body);

    if (!updatedTraining) {
      return NextResponse.json(
        { error: "Training not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      training: updatedTraining,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    // Verify authentication
    const authResult = await verifyToken(request);
    if (!authResult.success) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only super-admin can delete trainings
    if (authResult.user?.role !== "super-admin") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const result = await deleteTraining(id);

    if (!result) {
      return NextResponse.json(
        { error: "Training not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Training deleted successfully",
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
