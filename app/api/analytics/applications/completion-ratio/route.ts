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

    // Get completion ratio for each position
    const positions = await prisma.position.findMany({
      where: {
        userId: token.sub as string,
      },
      select: {
        id: true,
        title: true,
        applications: {
          select: {
            status: true,
          },
        },
      },
    });

    // Calculate ratios for each position
    const completionRatios = positions.map(position => {
      const totalApplications = position.applications.length;
      const completedApplications = position.applications.filter(app => app.status === "completed").length;
      const inProgressApplications = position.applications.filter(app => app.status === "in_progress").length;

      const completionRatio =
        totalApplications > 0 ? Math.round((completedApplications / totalApplications) * 100) / 100 : 0;

      return {
        positionId: position.id,
        positionTitle: position.title,
        totalApplications,
        completedApplications,
        inProgressApplications,
        completionRatio,
        completionPercentage: Math.round(completionRatio * 100),
      };
    });

    // Calculate overall statistics
    const overallStats = completionRatios.reduce(
      (acc, pos) => ({
        totalApplications: acc.totalApplications + pos.totalApplications,
        totalCompleted: acc.totalCompleted + pos.completedApplications,
        totalInProgress: acc.totalInProgress + pos.inProgressApplications,
      }),
      { totalApplications: 0, totalCompleted: 0, totalInProgress: 0 }
    );

    const overallCompletionRatio =
      overallStats.totalApplications > 0
        ? Math.round((overallStats.totalCompleted / overallStats.totalApplications) * 100) / 100
        : 0;

    return NextResponse.json({
      success: true,
      data: {
        positionRatios: completionRatios,
        overallStats: {
          ...overallStats,
          completionRatio: overallCompletionRatio,
          completionPercentage: Math.round(overallCompletionRatio * 100),
        },
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error calculating completion ratios:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
