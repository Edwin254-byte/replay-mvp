import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/analytics/applications/test
 *
 * Test endpoint that returns example JSON responses for all analytics endpoints.
 * This helps frontend developers understand the expected data structure.
 */
export async function GET(request: NextRequest) {
  const examples = {
    "status-summary": {
      success: true,
      data: {
        in_progress: 15,
        completed: 32,
        total: 47,
      },
      timestamp: "2025-09-25T10:30:00.000Z",
    },

    "avg-completion-time": {
      success: true,
      data: {
        averageMinutes: 24.5,
        averageHours: 0.41,
        completedCount: 32,
      },
      timestamp: "2025-09-25T10:30:00.000Z",
    },

    "by-position": {
      success: true,
      data: {
        positions: [
          {
            positionId: "pos_1",
            positionTitle: "Senior Software Engineer",
            applicationCount: 23,
          },
          {
            positionId: "pos_2",
            positionTitle: "Frontend Developer",
            applicationCount: 18,
          },
          {
            positionId: "pos_3",
            positionTitle: "Data Scientist",
            applicationCount: 6,
          },
        ],
        totalPositions: 3,
        totalApplications: 47,
      },
      timestamp: "2025-09-25T10:30:00.000Z",
    },

    "result-distribution": {
      success: true,
      data: {
        counts: {
          PENDING: 15,
          PASSED: 20,
          FAILED: 12,
          total: 47,
        },
        percentages: {
          PENDING: 32,
          PASSED: 43,
          FAILED: 25,
        },
      },
      timestamp: "2025-09-25T10:30:00.000Z",
    },

    trends: {
      success: true,
      data: {
        trends: [
          { date: "2025-08-26", count: 2 },
          { date: "2025-08-27", count: 5 },
          { date: "2025-08-28", count: 1 },
          { date: "2025-08-29", count: 8 },
          { date: "2025-08-30", count: 4 },
        ],
        period: "daily",
        totalApplications: 47,
        dateRange: {
          start: "2025-08-26",
          end: "2025-09-25",
        },
      },
      timestamp: "2025-09-25T10:30:00.000Z",
    },

    abandoned: {
      success: true,
      data: {
        abandonedApplications: [
          {
            id: "app_123",
            applicantName: "John Doe",
            applicantEmail: "john@example.com",
            positionTitle: "Senior Software Engineer",
            createdAt: "2025-09-22T08:00:00.000Z",
            startedAt: "2025-09-22T08:15:00.000Z",
            hoursElapsed: 78,
          },
          {
            id: "app_456",
            applicantName: "Jane Smith",
            applicantEmail: "jane@example.com",
            positionTitle: "Frontend Developer",
            createdAt: "2025-09-21T14:30:00.000Z",
            startedAt: "2025-09-21T14:45:00.000Z",
            hoursElapsed: 92,
          },
        ],
        count: 2,
        thresholdHours: 72,
        thresholdDate: "2025-09-22T10:30:00.000Z",
      },
      timestamp: "2025-09-25T10:30:00.000Z",
    },

    "completion-ratio": {
      success: true,
      data: {
        positionRatios: [
          {
            positionId: "pos_1",
            positionTitle: "Senior Software Engineer",
            totalApplications: 23,
            completedApplications: 18,
            inProgressApplications: 5,
            completionRatio: 0.78,
            completionPercentage: 78,
          },
          {
            positionId: "pos_2",
            positionTitle: "Frontend Developer",
            totalApplications: 18,
            completedApplications: 12,
            inProgressApplications: 6,
            completionRatio: 0.67,
            completionPercentage: 67,
          },
          {
            positionId: "pos_3",
            positionTitle: "Data Scientist",
            totalApplications: 6,
            completedApplications: 2,
            inProgressApplications: 4,
            completionRatio: 0.33,
            completionPercentage: 33,
          },
        ],
        overallStats: {
          totalApplications: 47,
          totalCompleted: 32,
          totalInProgress: 15,
          completionRatio: 0.68,
          completionPercentage: 68,
        },
      },
      timestamp: "2025-09-25T10:30:00.000Z",
    },
  };

  return NextResponse.json({
    success: true,
    message: "Analytics API Examples",
    endpoints: Object.keys(examples).map(endpoint => `GET /api/analytics/applications/${endpoint}`),
    examples,
  });
}
