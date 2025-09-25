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

    // Get URL parameters for date range (optional)
    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period") || "daily"; // 'daily' or 'weekly'
    const daysBack = parseInt(searchParams.get("days") || "30");

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - daysBack);

    // Get applications within date range
    const applications = await prisma.application.findMany({
      where: {
        position: {
          userId: token.sub as string,
        },
        startedAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      select: {
        startedAt: true,
      },
      orderBy: {
        startedAt: "asc",
      },
    });

    // Group by date
    const trendsMap = new Map<string, number>();

    applications.forEach(app => {
      let dateKey: string;

      if (period === "weekly") {
        // Group by week (start of week)
        const date = new Date(app.startedAt);
        const startOfWeek = new Date(date);
        startOfWeek.setDate(date.getDate() - date.getDay()); // Start of week (Sunday)
        dateKey = startOfWeek.toISOString().split("T")[0];
      } else {
        // Group by day
        dateKey = app.startedAt.toISOString().split("T")[0];
      }

      trendsMap.set(dateKey, (trendsMap.get(dateKey) || 0) + 1);
    });

    // Convert to array and sort by date
    const trends = Array.from(trendsMap.entries())
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return NextResponse.json({
      success: true,
      data: {
        trends,
        period,
        totalApplications: applications.length,
        dateRange: {
          start: startDate.toISOString().split("T")[0],
          end: endDate.toISOString().split("T")[0],
        },
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error fetching application trends:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
