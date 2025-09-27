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

    // Get completed applications with completion times
    const completedApplications = await prisma.application.findMany({
      where: {
        completedAt: {
          not: null,
        },
        position: {
          userId: token.sub as string,
        },
      },
      select: {
        startedAt: true,
        completedAt: true,
      },
    });

    if (completedApplications.length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          averageMinutes: 0,
          averageHours: 0,
          completedCount: 0,
        },
        timestamp: new Date().toISOString(),
      });
    }

    // Calculate completion times in minutes
    const completionTimes = completedApplications.map(app => {
      const startTime = new Date(app.startedAt).getTime();
      const endTime = new Date(app.completedAt!).getTime();
      return (endTime - startTime) / (1000 * 60); // Convert to minutes
    });

    const totalMinutes = completionTimes.reduce((sum, time) => sum + time, 0);
    const averageMinutes = totalMinutes / completionTimes.length;
    const averageHours = averageMinutes / 60;

    return NextResponse.json({
      success: true,
      data: {
        averageMinutes: Math.round(averageMinutes * 100) / 100, // Round to 2 decimal places
        averageHours: Math.round(averageHours * 100) / 100,
        completedCount: completedApplications.length,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error calculating average completion time:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
