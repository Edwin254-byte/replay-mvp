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

    // Get status summary for applications belonging to manager's positions
    const statusSummary = await prisma.application.groupBy({
      by: ["status"],
      where: {
        position: {
          userId: token.sub as string,
        },
      },
      _count: {
        id: true,
      },
    });

    // Transform data into predictable shape
    const summary = {
      in_progress: 0,
      completed: 0,
      total: 0,
    };

    statusSummary.forEach(item => {
      if (item.status === "in_progress") {
        summary.in_progress = item._count.id;
      } else if (item.status === "completed") {
        summary.completed = item._count.id;
      }
      summary.total += item._count.id;
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
