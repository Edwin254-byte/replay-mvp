"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart3, TrendingUp, Users, Clock, CheckCircle2, AlertCircle, Target, Activity } from "lucide-react";

interface StatusSummary {
  in_progress: number;
  completed: number;
  total: number;
}

interface AvgCompletionTime {
  averageMinutes: number;
  averageHours: number;
  completedCount: number;
}

interface PositionStat {
  positionId: string;
  positionTitle: string;
  applicationCount: number;
}

interface ApplicationsByPosition {
  positions: PositionStat[];
  totalPositions: number;
  totalApplications: number;
}

interface ResultDistribution {
  counts: {
    PENDING: number;
    PASSED: number;
    FAILED: number;
    total: number;
  };
  percentages: {
    PENDING: number;
    PASSED: number;
    FAILED: number;
  };
}

interface PositionCompletionRatio {
  positionId: string;
  positionTitle: string;
  totalApplications: number;
  completedApplications: number;
  inProgressApplications: number;
  completionRatio: number;
  completionPercentage: number;
}

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [statusSummary, setStatusSummary] = useState<StatusSummary | null>(null);
  const [avgCompletionTime, setAvgCompletionTime] = useState<AvgCompletionTime | null>(null);
  const [applicationsByPosition, setApplicationsByPosition] = useState<ApplicationsByPosition | null>(null);
  const [resultDistribution, setResultDistribution] = useState<ResultDistribution | null>(null);
  const [completionRatios, setCompletionRatios] = useState<PositionCompletionRatio[] | null>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);

        // Fetch all analytics data in parallel
        const [statusRes, completionTimeRes, positionsRes, resultsRes, ratiosRes] = await Promise.all([
          fetch("/api/analytics/applications/status-summary"),
          fetch("/api/analytics/applications/avg-completion-time"),
          fetch("/api/analytics/applications/by-position"),
          fetch("/api/analytics/applications/result-distribution"),
          fetch("/api/analytics/applications/completion-ratio"),
        ]);

        if (statusRes.ok) {
          const data = await statusRes.json();
          setStatusSummary(data.data);
        }

        if (completionTimeRes.ok) {
          const data = await completionTimeRes.json();
          setAvgCompletionTime(data.data);
        }

        if (positionsRes.ok) {
          const data = await positionsRes.json();
          setApplicationsByPosition(data.data);
        }

        if (resultsRes.ok) {
          const data = await resultsRes.json();
          setResultDistribution(data.data);
        }

        if (ratiosRes.ok) {
          const data = await ratiosRes.json();
          setCompletionRatios(data.data.positions);
        }
      } catch (error) {
        console.error("Error fetching analytics:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-600 mt-2">Loading analytics data...</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map(i => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
        <p className="text-gray-600 mt-2">Detailed insights and metrics for your hiring pipeline</p>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Total Applications */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-4 w-4 text-blue-500" />
              <span className="ml-2 text-sm font-medium text-gray-600">Total Applications</span>
            </div>
            <div className="mt-2">
              <div className="text-2xl font-bold">{statusSummary?.total || 0}</div>
              <p className="text-xs text-gray-500">{applicationsByPosition?.totalPositions || 0} positions</p>
            </div>
          </CardContent>
        </Card>

        {/* Completed Applications */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <span className="ml-2 text-sm font-medium text-gray-600">Completed</span>
            </div>
            <div className="mt-2">
              <div className="text-2xl font-bold">{statusSummary?.completed || 0}</div>
              <p className="text-xs text-gray-500">
                {statusSummary?.total ? Math.round((statusSummary.completed / statusSummary.total) * 100) : 0}%
                completion rate
              </p>
            </div>
          </CardContent>
        </Card>

        {/* In Progress Applications */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Activity className="h-4 w-4 text-orange-500" />
              <span className="ml-2 text-sm font-medium text-gray-600">In Progress</span>
            </div>
            <div className="mt-2">
              <div className="text-2xl font-bold">{statusSummary?.in_progress || 0}</div>
              <p className="text-xs text-gray-500">Active interviews</p>
            </div>
          </CardContent>
        </Card>

        {/* Average Completion Time */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Clock className="h-4 w-4 text-purple-500" />
              <span className="ml-2 text-sm font-medium text-gray-600">Avg. Time</span>
            </div>
            <div className="mt-2">
              <div className="text-2xl font-bold">
                {avgCompletionTime?.averageMinutes ? `${Math.round(avgCompletionTime.averageMinutes)}m` : "N/A"}
              </div>
              <p className="text-xs text-gray-500">{avgCompletionTime?.completedCount || 0} completed</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Result Distribution */}
      {resultDistribution && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Target className="h-5 w-5 mr-2" />
              Application Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <div className="text-2xl font-bold text-yellow-700">{resultDistribution.counts.PENDING}</div>
                <div className="text-sm text-yellow-600">Pending Review</div>
                <div className="text-xs text-yellow-500">{Math.round(resultDistribution.percentages.PENDING)}%</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-700">{resultDistribution.counts.PASSED}</div>
                <div className="text-sm text-green-600">Passed</div>
                <div className="text-xs text-green-500">{Math.round(resultDistribution.percentages.PASSED)}%</div>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <div className="text-2xl font-bold text-red-700">{resultDistribution.counts.FAILED}</div>
                <div className="text-sm text-red-600">Not Selected</div>
                <div className="text-xs text-red-500">{Math.round(resultDistribution.percentages.FAILED)}%</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Position Performance */}
      {applicationsByPosition && applicationsByPosition.positions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="h-5 w-5 mr-2" />
              Applications by Position
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {applicationsByPosition.positions.map(position => (
                <div key={position.positionId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium">{position.positionTitle}</div>
                    <div className="text-sm text-gray-500">{position.applicationCount} applications</div>
                  </div>
                  <Badge variant="secondary">
                    {Math.round((position.applicationCount / applicationsByPosition.totalApplications) * 100)}%
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Completion Ratios */}
      {completionRatios && completionRatios.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="h-5 w-5 mr-2" />
              Completion Rates by Position
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {completionRatios.map(ratio => (
                <div key={ratio.positionId} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{ratio.positionTitle}</span>
                    <span className="text-sm text-gray-500">
                      {ratio.completedApplications}/{ratio.totalApplications} completed
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${ratio.completionPercentage}%` }}
                    ></div>
                  </div>
                  <div className="text-xs text-gray-500">{ratio.completionPercentage}% completion rate</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {!statusSummary?.total && (
        <Card className="text-center py-12">
          <CardContent>
            <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <BarChart3 className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Data Yet</h3>
            <p className="text-gray-600 max-w-md mx-auto">
              Once you start receiving applications for your positions, you will see detailed analytics and insights
              here.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
