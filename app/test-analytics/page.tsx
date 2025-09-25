"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  useStatusSummary,
  useAvgCompletionTime,
  useApplicationsByPosition,
  useResultDistribution,
  useApplicationTrends,
  useAbandonedApplications,
  useCompletionRatio,
} from "@/lib/hooks/useAnalytics";

export default function AnalyticsTestPage() {
  const statusSummary = useStatusSummary();
  const avgCompletionTime = useAvgCompletionTime();
  const applicationsByPosition = useApplicationsByPosition();
  const resultDistribution = useResultDistribution();
  const trends = useApplicationTrends({ period: "daily", days: 7 });
  const abandonedApplications = useAbandonedApplications({ hours: 48 });
  const completionRatio = useCompletionRatio();

  const endpoints = [
    { name: "Status Summary", hook: statusSummary },
    { name: "Avg Completion Time", hook: avgCompletionTime },
    { name: "Applications by Position", hook: applicationsByPosition },
    { name: "Result Distribution", hook: resultDistribution },
    { name: "Application Trends", hook: trends },
    { name: "Abandoned Applications", hook: abandonedApplications },
    { name: "Completion Ratio", hook: completionRatio },
  ];

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Analytics API Test Dashboard</h1>
        <p className="text-gray-600">
          Testing all Application analytics endpoints. Each card shows the data returned by the corresponding API
          endpoint.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Status Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Status Summary
              <Badge variant={statusSummary.loading ? "secondary" : statusSummary.error ? "destructive" : "default"}>
                {statusSummary.loading ? "Loading" : statusSummary.error ? "Error" : "Success"}
              </Badge>
            </CardTitle>
            <CardDescription>Applications by status (in_progress vs completed)</CardDescription>
          </CardHeader>
          <CardContent>
            {statusSummary.error && <p className="text-red-500 text-sm">{statusSummary.error}</p>}
            {statusSummary.data && (
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>In Progress:</span>
                  <span className="font-semibold">{statusSummary.data.in_progress}</span>
                </div>
                <div className="flex justify-between">
                  <span>Completed:</span>
                  <span className="font-semibold">{statusSummary.data.completed}</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span>Total:</span>
                  <span className="font-semibold">{statusSummary.data.total}</span>
                </div>
              </div>
            )}
            <Button
              onClick={statusSummary.refetch}
              variant="outline"
              size="sm"
              className="mt-3 w-full"
              disabled={statusSummary.loading}
            >
              Refresh
            </Button>
          </CardContent>
        </Card>

        {/* Average Completion Time */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Avg Completion Time
              <Badge
                variant={avgCompletionTime.loading ? "secondary" : avgCompletionTime.error ? "destructive" : "default"}
              >
                {avgCompletionTime.loading ? "Loading" : avgCompletionTime.error ? "Error" : "Success"}
              </Badge>
            </CardTitle>
            <CardDescription>Average time to complete applications</CardDescription>
          </CardHeader>
          <CardContent>
            {avgCompletionTime.error && <p className="text-red-500 text-sm">{avgCompletionTime.error}</p>}
            {avgCompletionTime.data && (
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Minutes:</span>
                  <span className="font-semibold">{avgCompletionTime.data.averageMinutes}</span>
                </div>
                <div className="flex justify-between">
                  <span>Hours:</span>
                  <span className="font-semibold">{avgCompletionTime.data.averageHours}</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span>Completed Count:</span>
                  <span className="font-semibold">{avgCompletionTime.data.completedCount}</span>
                </div>
              </div>
            )}
            <Button
              onClick={avgCompletionTime.refetch}
              variant="outline"
              size="sm"
              className="mt-3 w-full"
              disabled={avgCompletionTime.loading}
            >
              Refresh
            </Button>
          </CardContent>
        </Card>

        {/* Result Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Result Distribution
              <Badge
                variant={
                  resultDistribution.loading ? "secondary" : resultDistribution.error ? "destructive" : "default"
                }
              >
                {resultDistribution.loading ? "Loading" : resultDistribution.error ? "Error" : "Success"}
              </Badge>
            </CardTitle>
            <CardDescription>Applications grouped by overall result</CardDescription>
          </CardHeader>
          <CardContent>
            {resultDistribution.error && <p className="text-red-500 text-sm">{resultDistribution.error}</p>}
            {resultDistribution.data && (
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Pending:</span>
                  <span className="font-semibold">
                    {resultDistribution.data.counts.PENDING} ({resultDistribution.data.percentages.PENDING}%)
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Passed:</span>
                  <span className="font-semibold text-green-600">
                    {resultDistribution.data.counts.PASSED} ({resultDistribution.data.percentages.PASSED}%)
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Failed:</span>
                  <span className="font-semibold text-red-600">
                    {resultDistribution.data.counts.FAILED} ({resultDistribution.data.percentages.FAILED}%)
                  </span>
                </div>
              </div>
            )}
            <Button
              onClick={resultDistribution.refetch}
              variant="outline"
              size="sm"
              className="mt-3 w-full"
              disabled={resultDistribution.loading}
            >
              Refresh
            </Button>
          </CardContent>
        </Card>

        {/* Applications by Position */}
        <Card className="md:col-span-2 lg:col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Applications by Position
              <Badge
                variant={
                  applicationsByPosition.loading
                    ? "secondary"
                    : applicationsByPosition.error
                      ? "destructive"
                      : "default"
                }
              >
                {applicationsByPosition.loading ? "Loading" : applicationsByPosition.error ? "Error" : "Success"}
              </Badge>
            </CardTitle>
            <CardDescription>Total applications grouped by position</CardDescription>
          </CardHeader>
          <CardContent>
            {applicationsByPosition.error && <p className="text-red-500 text-sm">{applicationsByPosition.error}</p>}
            {applicationsByPosition.data && (
              <div className="space-y-4">
                <div className="grid gap-2">
                  {applicationsByPosition.data.positions.map(position => (
                    <div key={position.positionId} className="flex justify-between items-center p-3 border rounded">
                      <span className="font-medium">{position.positionTitle}</span>
                      <Badge variant="outline">{position.applicationCount} applications</Badge>
                    </div>
                  ))}
                </div>
                <div className="border-t pt-3 flex justify-between text-sm">
                  <span>Total Positions: {applicationsByPosition.data.totalPositions}</span>
                  <span>Total Applications: {applicationsByPosition.data.totalApplications}</span>
                </div>
              </div>
            )}
            <Button
              onClick={applicationsByPosition.refetch}
              variant="outline"
              size="sm"
              className="mt-3"
              disabled={applicationsByPosition.loading}
            >
              Refresh
            </Button>
          </CardContent>
        </Card>

        {/* Abandoned Applications */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Abandoned Applications
              <Badge
                variant={
                  abandonedApplications.loading ? "secondary" : abandonedApplications.error ? "destructive" : "default"
                }
              >
                {abandonedApplications.loading ? "Loading" : abandonedApplications.error ? "Error" : "Success"}
              </Badge>
            </CardTitle>
            <CardDescription>In-progress applications older than 48 hours</CardDescription>
          </CardHeader>
          <CardContent>
            {abandonedApplications.error && <p className="text-red-500 text-sm">{abandonedApplications.error}</p>}
            {abandonedApplications.data && (
              <div className="space-y-3">
                <p className="text-sm text-gray-600">Found {abandonedApplications.data.count} abandoned applications</p>
                {abandonedApplications.data.abandonedApplications.slice(0, 3).map(app => (
                  <div key={app.id} className="p-3 border rounded space-y-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">{app.applicantName}</p>
                        <p className="text-sm text-gray-600">{app.positionTitle}</p>
                      </div>
                      <Badge variant="destructive">{app.hoursElapsed}h elapsed</Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <Button
              onClick={abandonedApplications.refetch}
              variant="outline"
              size="sm"
              className="mt-3"
              disabled={abandonedApplications.loading}
            >
              Refresh
            </Button>
          </CardContent>
        </Card>

        {/* Completion Ratio */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Completion Ratio
              <Badge
                variant={completionRatio.loading ? "secondary" : completionRatio.error ? "destructive" : "default"}
              >
                {completionRatio.loading ? "Loading" : completionRatio.error ? "Error" : "Success"}
              </Badge>
            </CardTitle>
            <CardDescription>Ratio of completed vs total applications</CardDescription>
          </CardHeader>
          <CardContent>
            {completionRatio.error && <p className="text-red-500 text-sm">{completionRatio.error}</p>}
            {completionRatio.data && (
              <div className="space-y-4">
                <div className="space-y-2">
                  {completionRatio.data.positionRatios.slice(0, 3).map(position => (
                    <div key={position.positionId} className="flex justify-between items-center">
                      <span className="text-sm truncate flex-1">{position.positionTitle}</span>
                      <Badge variant="outline">{position.completionPercentage}%</Badge>
                    </div>
                  ))}
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Overall:</span>
                    <Badge variant="default">{completionRatio.data.overallStats.completionPercentage}%</Badge>
                  </div>
                </div>
              </div>
            )}
            <Button
              onClick={completionRatio.refetch}
              variant="outline"
              size="sm"
              className="mt-3 w-full"
              disabled={completionRatio.loading}
            >
              Refresh
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* API Information */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>API Endpoints</CardTitle>
          <CardDescription>All available analytics endpoints</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 text-sm font-mono">
            <div>GET /api/analytics/applications/status-summary</div>
            <div>GET /api/analytics/applications/avg-completion-time</div>
            <div>GET /api/analytics/applications/by-position</div>
            <div>GET /api/analytics/applications/result-distribution</div>
            <div>GET /api/analytics/applications/trends?period=daily&days=30</div>
            <div>GET /api/analytics/applications/abandoned?hours=72</div>
            <div>GET /api/analytics/applications/completion-ratio</div>
            <div className="mt-2 pt-2 border-t text-blue-600">GET /api/analytics/applications/test (View examples)</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
