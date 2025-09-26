// Analytics API Response Types

export interface AnalyticsResponse<T> {
  success: boolean;
  data: T;
  timestamp: string;
  error?: string;
}

// Status Summary Types
export interface StatusSummaryData {
  in_progress: number;
  completed: number;
  total: number;
}

// Average Completion Time Types
export interface AvgCompletionTimeData {
  averageMinutes: number;
  averageHours: number;
  completedCount: number;
}

// Applications by Position Types
export interface PositionStat {
  positionId: string;
  positionTitle: string;
  applicationCount: number;
}

export interface ApplicationsByPositionData {
  positions: PositionStat[];
  totalPositions: number;
  totalApplications: number;
}

// Result Distribution Types
export interface ResultCounts {
  PENDING: number;
  PASSED: number;
  FAILED: number;
  total: number;
}

export interface ResultPercentages {
  PENDING: number;
  PASSED: number;
  FAILED: number;
}

export interface ResultDistributionData {
  counts: ResultCounts;
  percentages: ResultPercentages;
}

// Trends Types
export interface TrendPoint {
  date: string;
  count: number;
}

export interface DateRange {
  start: string;
  end: string;
}

export interface ApplicationTrendsData {
  trends: TrendPoint[];
  period: "daily" | "weekly";
  totalApplications: number;
  dateRange: DateRange;
}

// Abandoned Applications Types
export interface AbandonedApplication {
  id: string;
  applicantName: string;
  applicantEmail: string;
  positionTitle: string;
  startedAt: Date;
  hoursElapsed: number;
}

export interface AbandonedApplicationsData {
  abandonedApplications: AbandonedApplication[];
  count: number;
  thresholdHours: number;
  thresholdDate: string;
}

// Completion Ratio Types
export interface PositionCompletionRatio {
  positionId: string;
  positionTitle: string;
  totalApplications: number;
  completedApplications: number;
  inProgressApplications: number;
  completionRatio: number;
  completionPercentage: number;
}

export interface OverallStats {
  totalApplications: number;
  totalCompleted: number;
  totalInProgress: number;
  completionRatio: number;
  completionPercentage: number;
}

export interface CompletionRatioData {
  positionRatios: PositionCompletionRatio[];
  overallStats: OverallStats;
}

// Combined Analytics Response Types
export type StatusSummaryResponse = AnalyticsResponse<StatusSummaryData>;
export type AvgCompletionTimeResponse = AnalyticsResponse<AvgCompletionTimeData>;
export type ApplicationsByPositionResponse = AnalyticsResponse<ApplicationsByPositionData>;
export type ResultDistributionResponse = AnalyticsResponse<ResultDistributionData>;
export type ApplicationTrendsResponse = AnalyticsResponse<ApplicationTrendsData>;
export type AbandonedApplicationsResponse = AnalyticsResponse<AbandonedApplicationsData>;
export type CompletionRatioResponse = AnalyticsResponse<CompletionRatioData>;

// Query Parameters Types
export interface TrendsQueryParams {
  period?: "daily" | "weekly";
  days?: number;
}

export interface AbandonedQueryParams {
  hours?: number;
}

// Utility type for all analytics endpoints
export type AnalyticsEndpoint =
  | "status-summary"
  | "avg-completion-time"
  | "by-position"
  | "result-distribution"
  | "trends"
  | "abandoned"
  | "completion-ratio";

export interface ApplicationAnalytics {
  id: string;
  applicant: string;
  email: string;
  started: string;
  ended: string | null;
  progress: "In Progress" | "Completed";
  status: "Not Scored" | "Pass" | "Fail" | "Null";
  application: string;
}

export interface PositionAnalytics {
  inProgressApps: number;
  completedApps: number;
  passedApps: number;
}
