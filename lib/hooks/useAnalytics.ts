"use client";

import { useState, useEffect, useCallback } from "react";
import {
  StatusSummaryResponse,
  AvgCompletionTimeResponse,
  ApplicationsByPositionResponse,
  ResultDistributionResponse,
  ApplicationTrendsResponse,
  AbandonedApplicationsResponse,
  CompletionRatioResponse,
  AnalyticsEndpoint,
  TrendsQueryParams,
  AbandonedQueryParams,
} from "@/lib/types/analytics";

// Generic analytics hook
function useAnalytics<T>(endpoint: AnalyticsEndpoint, queryParams?: Record<string, string | number>) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (queryParams) {
        Object.entries(queryParams).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            params.append(key, value.toString());
          }
        });
      }

      const url = `/api/analytics/applications/${endpoint}${params.toString() ? `?${params.toString()}` : ""}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || "Analytics request failed");
      }

      setData(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }, [endpoint, queryParams]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
  };
}

// Specific hooks for each analytics endpoint
export const useStatusSummary = () => {
  return useAnalytics<StatusSummaryResponse["data"]>("status-summary");
};

export const useAvgCompletionTime = () => {
  return useAnalytics<AvgCompletionTimeResponse["data"]>("avg-completion-time");
};

export const useApplicationsByPosition = () => {
  return useAnalytics<ApplicationsByPositionResponse["data"]>("by-position");
};

export const useResultDistribution = () => {
  return useAnalytics<ResultDistributionResponse["data"]>("result-distribution");
};

export const useApplicationTrends = (params?: TrendsQueryParams) => {
  return useAnalytics<ApplicationTrendsResponse["data"]>("trends", params as Record<string, string | number>);
};

export const useAbandonedApplications = (params?: AbandonedQueryParams) => {
  return useAnalytics<AbandonedApplicationsResponse["data"]>("abandoned", params as Record<string, string | number>);
};

export const useCompletionRatio = () => {
  return useAnalytics<CompletionRatioResponse["data"]>("completion-ratio");
};

// Bulk analytics hook for dashboard
export const useAnalyticsDashboard = () => {
  const statusSummary = useStatusSummary();
  const avgCompletionTime = useAvgCompletionTime();
  const applicationsByPosition = useApplicationsByPosition();
  const resultDistribution = useResultDistribution();
  const trends = useApplicationTrends({ period: "daily", days: 30 });
  const abandonedApplications = useAbandonedApplications({ hours: 72 });
  const completionRatio = useCompletionRatio();

  const isLoading =
    statusSummary.loading ||
    avgCompletionTime.loading ||
    applicationsByPosition.loading ||
    resultDistribution.loading ||
    trends.loading ||
    abandonedApplications.loading ||
    completionRatio.loading;

  const hasError =
    statusSummary.error ||
    avgCompletionTime.error ||
    applicationsByPosition.error ||
    resultDistribution.error ||
    trends.error ||
    abandonedApplications.error ||
    completionRatio.error;

  const refetchAll = () => {
    statusSummary.refetch();
    avgCompletionTime.refetch();
    applicationsByPosition.refetch();
    resultDistribution.refetch();
    trends.refetch();
    abandonedApplications.refetch();
    completionRatio.refetch();
  };

  return {
    data: {
      statusSummary: statusSummary.data,
      avgCompletionTime: avgCompletionTime.data,
      applicationsByPosition: applicationsByPosition.data,
      resultDistribution: resultDistribution.data,
      trends: trends.data,
      abandonedApplications: abandonedApplications.data,
      completionRatio: completionRatio.data,
    },
    loading: isLoading,
    error: hasError,
    refetch: refetchAll,
  };
};
