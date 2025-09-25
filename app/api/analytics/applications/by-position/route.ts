import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getToken } from "next-auth/jwt";

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const token = await getToken({ req: request });
    if (!token || token.role !== "MANAGER") {
      return NextResponse.json({ error: "Unauthorized. Manager access required." }, { status: 401 });
    }

    // Get applications grouped by position
    const applicationsByPosition = await prisma.position.findMany({
      where: {
        userId: token.sub as string,
      },
      select: {
        id: true,
        title: true,
        _count: {
          select: {
            applications: true,
          },
        },
      },
    });

    // Transform data into predictable shape
    const positionStats = applicationsByPosition.map(position => ({
      positionId: position.id,
      positionTitle: position.title,
      applicationCount: position._count.applications,
    }));

    return NextResponse.json({
      success: true,
      data: {
        positions: positionStats,
        totalPositions: positionStats.length,
        totalApplications: positionStats.reduce((sum, pos) => sum + pos.applicationCount, 0),
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error fetching applications by position:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
