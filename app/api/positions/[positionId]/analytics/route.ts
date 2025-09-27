import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getToken } from "next-auth/jwt";

export async function GET(request: NextRequest, { params }: { params: Promise<{ positionId: string }> }) {
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
      return NextResponse.json({ error: "Position not found or access denied." }, { status: 404 });
    }

    // Get applications with detailed analytics for this position
    const applications = await prisma.application.findMany({
      where: {
        positionId: positionId,
      },
      select: {
        id: true,
        name: true,
        email: true,
        startedAt: true,
        completedAt: true,
        status: true,
        overallResult: true,
        answers: {
          select: {
            id: true,
            response: true,
            startedAt: true,
            endedAt: true,
          },
        },
      },
      orderBy: {
        startedAt: "desc",
      },
    });

    // Calculate analytics
    const totalApplications = applications.length;
    const completedApplications = applications.filter(app => app.completedAt !== null);
    const inProgressApplications = applications.filter(app => app.completedAt === null);

    const passedApplications = applications.filter(app => app.overallResult === "PASSED");
    const failedApplications = applications.filter(app => app.overallResult === "FAILED");
    const pendingApplications = applications.filter(app => app.overallResult === "PENDING");

    // Calculate average completion time for completed applications
    const completedWithTimes = completedApplications.filter(app => app.startedAt && app.completedAt);
    const totalCompletionTime = completedWithTimes.reduce((sum, app) => {
      if (app.startedAt && app.completedAt) {
        return sum + (new Date(app.completedAt).getTime() - new Date(app.startedAt).getTime());
      }
      return sum;
    }, 0);

    const averageCompletionMinutes =
      completedWithTimes.length > 0 ? Math.round(totalCompletionTime / completedWithTimes.length / (1000 * 60)) : 0;

    // Format applications for the table
    const formattedApplications = applications.map(app => ({
      id: app.id,
      applicant: app.name,
      email: app.email,
      started: app.startedAt
        ? new Date(app.startedAt).toLocaleDateString("en-US", {
            month: "numeric",
            day: "numeric",
            year: "2-digit",
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
          })
        : "N/A",
      ended: app.completedAt
        ? new Date(app.completedAt).toLocaleDateString("en-US", {
            month: "numeric",
            day: "numeric",
            year: "2-digit",
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
          })
        : null,
      progress: app.completedAt ? "Completed" : "In Progress",
      status: app.overallResult === "PASSED" ? "PASSED" : app.overallResult === "FAILED" ? "FAILED" : "PENDING",
      application: "View Application",
      totalAnswers: app.answers.length,
    }));

    // Return analytics data
    return NextResponse.json({
      success: true,
      data: {
        // Summary statistics
        analytics: {
          inProgressApps: inProgressApplications.length,
          completedApps: completedApplications.length,
          passedApps: passedApplications.length,
          failedApps: failedApplications.length,
          pendingApps: pendingApplications.length,
          totalApps: totalApplications,
          averageCompletionMinutes,
        },
        // Application details for the table
        applications: formattedApplications,
        // Position info
        position: {
          id: position.id,
          title: position.title,
        },
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error fetching position analytics:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
