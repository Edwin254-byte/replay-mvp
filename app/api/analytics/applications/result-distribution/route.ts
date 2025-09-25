import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getToken } from "next-auth/jwt";
import { ApplicationResult } from "@prisma/client";

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const token = await getToken({ req: request });
    if (!token || token.role !== "MANAGER") {
      return NextResponse.json({ error: "Unauthorized. Manager access required." }, { status: 401 });
    }

    // Get result distribution for applications belonging to manager's positions
    const resultDistribution = await prisma.application.groupBy({
      by: ["overallResult"],
      where: {
        position: {
          userId: token.sub as string,
        },
      },
      _count: {
        _all: true,
      },
    });

    // Initialize result counts
    const distribution = {
      PENDING: 0,
      PASSED: 0,
      FAILED: 0,
      total: 0,
    };

    resultDistribution.forEach(item => {
      if (item.overallResult && item.overallResult in distribution && item._count) {
        distribution[item.overallResult as ApplicationResult] = item._count._all;
        distribution.total += item._count._all;
      }
    });

    // Calculate percentages
    const percentages = {
      PENDING: distribution.total > 0 ? Math.round((distribution.PENDING / distribution.total) * 100) : 0,
      PASSED: distribution.total > 0 ? Math.round((distribution.PASSED / distribution.total) * 100) : 0,
      FAILED: distribution.total > 0 ? Math.round((distribution.FAILED / distribution.total) * 100) : 0,
    };

    return NextResponse.json({
      success: true,
      data: {
        counts: distribution,
        percentages,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error fetching result distribution:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
