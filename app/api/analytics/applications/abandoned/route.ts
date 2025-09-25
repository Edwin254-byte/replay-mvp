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

    // Get URL parameters for filtering
    const { searchParams } = new URL(request.url);
    const hoursThreshold = parseInt(searchParams.get("hours") || "72"); // Default: 72 hours (3 days)

    // Calculate threshold date
    const thresholdDate = new Date();
    thresholdDate.setHours(thresholdDate.getHours() - hoursThreshold);

    // Find abandoned applications (in_progress and older than threshold)
    const abandonedApplications = await prisma.application.findMany({
      where: {
        status: "in_progress",
        completedAt: null,
        position: {
          userId: token.sub as string,
        },
        startedAt: {
          lt: thresholdDate,
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
        startedAt: true,
        position: {
          select: {
            title: true,
          },
        },
      },
      orderBy: {
        startedAt: "desc",
      },
    });

    // Calculate time since started for each application
    const abandonedWithDuration = abandonedApplications.map(app => {
      const now = new Date();
      const started = new Date(app.startedAt);
      const hoursElapsed = Math.floor((now.getTime() - started.getTime()) / (1000 * 60 * 60));

      return {
        id: app.id,
        applicantName: app.name,
        applicantEmail: app.email,
        positionTitle: app.position.title,
        startedAt: app.startedAt,
        hoursElapsed,
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        abandonedApplications: abandonedWithDuration,
        count: abandonedApplications.length,
        thresholdHours: hoursThreshold,
        thresholdDate: thresholdDate.toISOString(),
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error fetching abandoned applications:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
