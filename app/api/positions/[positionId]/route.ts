import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getToken } from "next-auth/jwt";
import type { Prisma } from "@prisma/client";

export async function GET(request: NextRequest, { params }: { params: Promise<{ positionId: string }> }) {
  try {
    const { positionId } = await params;

    const position = await prisma.position.findUnique({
      where: { id: positionId },
      include: {
        questions: { orderBy: { order: "asc" } },
        applications: true,
        _count: {
          select: {
            applications: true,
            questions: true,
          },
        },
      },
    });

    if (!position) {
      return NextResponse.json({ error: "Position not found" }, { status: 404 });
    }

    return NextResponse.json(position);
  } catch (error) {
    console.error("Error fetching position:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ positionId: string }> }) {
  try {
    // Check authentication
    const token = await getToken({ req: request });
    if (!token || token.role !== "MANAGER") {
      return NextResponse.json({ error: "Unauthorized. Manager access required." }, { status: 401 });
    }

    const { positionId } = await params;

    // Verify the position belongs to the authenticated manager
    const existingPosition = await prisma.position.findFirst({
      where: {
        id: positionId,
        userId: token.sub as string,
      },
    });

    if (!existingPosition) {
      return NextResponse.json({ error: "Position not found or access denied." }, { status: 404 });
    }

    // Parse request body
    const body = await request.json();
    const { title, description, introText, farewellText } = body;

    // Validation
    if (title !== undefined && (typeof title !== "string" || title.trim().length === 0)) {
      return NextResponse.json(
        { error: "Position title is required and must be a non-empty string." },
        { status: 400 }
      );
    }

    if (description !== undefined && typeof description !== "string") {
      return NextResponse.json({ error: "Description must be a string." }, { status: 400 });
    }

    if (introText !== undefined && typeof introText !== "string") {
      return NextResponse.json({ error: "Intro text must be a string." }, { status: 400 });
    }

    if (farewellText !== undefined && typeof farewellText !== "string") {
      return NextResponse.json({ error: "Farewell text must be a string." }, { status: 400 });
    }

    // Build update data - only include fields that are being updated
    const updateData: Prisma.PositionUpdateInput = {};
    if (title !== undefined) {
      updateData.title = title.trim();
    }
    if (description !== undefined) {
      updateData.description = description.trim() || null;
    }
    if (introText !== undefined) {
      updateData.introText = introText.trim() || null;
    }
    if (farewellText !== undefined) {
      updateData.farewellText = farewellText.trim() || null;
    }

    // Update the position
    const updatedPosition = await prisma.position.update({
      where: { id: positionId },
      data: updateData,
      include: {
        questions: { orderBy: { order: "asc" } },
        applications: true,
        _count: {
          select: {
            applications: true,
            questions: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: updatedPosition,
      message: "Position updated successfully.",
    });
  } catch (error) {
    console.error("Error updating position:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
