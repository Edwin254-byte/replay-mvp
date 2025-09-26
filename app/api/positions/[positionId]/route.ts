import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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
