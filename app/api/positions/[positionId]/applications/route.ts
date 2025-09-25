import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getToken } from "next-auth/jwt";

interface Params {
  positionId: string;
}

export async function GET(request: NextRequest, { params }: { params: Promise<Params> }) {
  try {
    // Check authentication
    const token = await getToken({ req: request });
    if (!token || token.role !== "MANAGER") {
      return NextResponse.json({ error: "Unauthorized. Manager access required." }, { status: 401 });
    }

    const { positionId } = await params;

    // Verify the position belongs to the authenticated manager
    const position = await prisma.position.findFirst({
      where: {
        id: positionId,
        userId: token.sub as string,
      },
    });

    if (!position) {
      return NextResponse.json({ error: "Position not found or access denied" }, { status: 404 });
    }

    // Get all applications for the position
    const applications = await prisma.application.findMany({
      where: {
        positionId: positionId,
      },
      include: {
        position: {
          select: {
            title: true,
            description: true,
          },
        },
        _count: {
          select: {
            answers: true,
          },
        },
      },
      orderBy: {
        startedAt: "desc",
      },
    });

    return NextResponse.json({ applications });
  } catch (error) {
    console.error("Error fetching applications:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
