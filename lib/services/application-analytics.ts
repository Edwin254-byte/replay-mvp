import { prisma } from "@/lib/prisma";
import { ApplicationResult } from "@prisma/client";

// Service functions for Application analytics
export class ApplicationAnalyticsService {
  /**
   * Get status summary (in_progress vs completed) for manager's positions
   */
  static async getStatusSummary(managerId: string) {
    const statusSummary = await prisma.application.groupBy({
      by: ["status"],
      where: {
        position: {
          userId: managerId,
        },
      },
      _count: {
        id: true,
      },
    });

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

    return summary;
  }

  /**
   * Calculate average completion time for completed applications
   */
  static async getAverageCompletionTime(managerId: string) {
    const completedApplications = await prisma.application.findMany({
      where: {
        status: "completed",
        completedAt: {
          not: null,
        },
        position: {
          userId: managerId,
        },
      },
      select: {
        startedAt: true,
        completedAt: true,
      },
    });

    if (completedApplications.length === 0) {
      return {
        averageMinutes: 0,
        averageHours: 0,
        completedCount: 0,
      };
    }

    const completionTimes = completedApplications.map(app => {
      const startTime = new Date(app.startedAt).getTime();
      const endTime = new Date(app.completedAt!).getTime();
      return (endTime - startTime) / (1000 * 60); // Convert to minutes
    });

    const totalMinutes = completionTimes.reduce((sum, time) => sum + time, 0);
    const averageMinutes = totalMinutes / completionTimes.length;
    const averageHours = averageMinutes / 60;

    return {
      averageMinutes: Math.round(averageMinutes * 100) / 100,
      averageHours: Math.round(averageHours * 100) / 100,
      completedCount: completedApplications.length,
    };
  }

  /**
   * Get applications grouped by position
   */
  static async getApplicationsByPosition(managerId: string) {
    const applicationsByPosition = await prisma.position.findMany({
      where: {
        userId: managerId,
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

    const positionStats = applicationsByPosition.map(position => ({
      positionId: position.id,
      positionTitle: position.title,
      applicationCount: position._count.applications,
    }));

    return {
      positions: positionStats,
      totalPositions: positionStats.length,
      totalApplications: positionStats.reduce((sum, pos) => sum + pos.applicationCount, 0),
    };
  }

  /**
   * Get result distribution (PENDING/PASSED/FAILED)
   */
  static async getResultDistribution(managerId: string) {
    const resultDistribution = await prisma.application.groupBy({
      by: ["overallResult"],
      where: {
        position: {
          userId: managerId,
        },
      },
      _count: {
        _all: true,
      },
    });

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

    const percentages = {
      PENDING: distribution.total > 0 ? Math.round((distribution.PENDING / distribution.total) * 100) : 0,
      PASSED: distribution.total > 0 ? Math.round((distribution.PASSED / distribution.total) * 100) : 0,
      FAILED: distribution.total > 0 ? Math.round((distribution.FAILED / distribution.total) * 100) : 0,
    };

    return {
      counts: distribution,
      percentages,
    };
  }

  /**
   * Get application trends over time
   */
  static async getApplicationTrends(managerId: string, period: "daily" | "weekly" = "daily", daysBack: number = 30) {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - daysBack);

    const applications = await prisma.application.findMany({
      where: {
        position: {
          userId: managerId,
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

    const trendsMap = new Map<string, number>();

    applications.forEach(app => {
      let dateKey: string;

      if (period === "weekly") {
        const date = new Date(app.startedAt);
        const startOfWeek = new Date(date);
        startOfWeek.setDate(date.getDate() - date.getDay());
        dateKey = startOfWeek.toISOString().split("T")[0];
      } else {
        dateKey = app.startedAt.toISOString().split("T")[0];
      }

      trendsMap.set(dateKey, (trendsMap.get(dateKey) || 0) + 1);
    });

    const trends = Array.from(trendsMap.entries())
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return {
      trends,
      period,
      totalApplications: applications.length,
      dateRange: {
        start: startDate.toISOString().split("T")[0],
        end: endDate.toISOString().split("T")[0],
      },
    };
  }

  /**
   * Find abandoned applications
   */
  static async getAbandonedApplications(managerId: string, hoursThreshold: number = 72) {
    const thresholdDate = new Date();
    thresholdDate.setHours(thresholdDate.getHours() - hoursThreshold);

    const abandonedApplications = await prisma.application.findMany({
      where: {
        status: "in_progress",
        completedAt: null,
        position: {
          userId: managerId,
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

    return {
      abandonedApplications: abandonedWithDuration,
      count: abandonedApplications.length,
      thresholdHours: hoursThreshold,
      thresholdDate: thresholdDate.toISOString(),
    };
  }

  /**
   * Calculate completion ratios by position
   */
  static async getCompletionRatios(managerId: string) {
    const positions = await prisma.position.findMany({
      where: {
        userId: managerId,
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

    return {
      positionRatios: completionRatios,
      overallStats: {
        ...overallStats,
        completionRatio: overallCompletionRatio,
        completionPercentage: Math.round(overallCompletionRatio * 100),
      },
    };
  }
}
