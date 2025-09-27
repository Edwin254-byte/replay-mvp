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

    // Get applications belonging to manager's positions
    const applications = await prisma.application.findMany({
      where: {
        position: {
          userId: token.sub as string,
        },
      },
      select: {
        id: true,
        completedAt: true,
        status: true,
      },
    });

    // Calculate summary based on completedAt field (more reliable than status)
    const summary = {
      in_progress: 0,
      completed: 0,
      total: applications.length,
    };

    applications.forEach(app => {
      if (app.completedAt) {
        summary.completed++;
      } else {
        summary.in_progress++;
      }
    });

    return NextResponse.json({
      success: true,
      data: summary,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error fetching status summary:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
