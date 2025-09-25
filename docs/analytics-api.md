# Application Analytics API Documentation

This document provides comprehensive information about the analytics endpoints for the Application model in the Replay MVP platform.

## Overview

The analytics API provides insights into application data with seven main endpoints, each designed to return specific metrics about applications and their performance. All endpoints are secured with manager-level authentication and return data scoped to the authenticated manager's positions.

## Base URL

All analytics endpoints are under: `/api/analytics/applications/`

## Endpoints

### 1. Status Summary - `GET /status-summary`

**Purpose**: Count applications by status (in_progress vs completed)

**Response Structure**:

```json
{
  "success": true,
  "data": {
    "in_progress": 15,
    "completed": 32,
    "total": 47
  },
  "timestamp": "2025-09-25T10:30:00.000Z"
}
```

**Prisma Query**:

```typescript
prisma.application.groupBy({
  by: ["status"],
  where: { position: { userId: managerId } },
  _count: { id: true },
});
```

### 2. Average Completion Time - `GET /avg-completion-time`

**Purpose**: Calculate average time from startedAt to completedAt for completed applications

**Response Structure**:

```json
{
  "success": true,
  "data": {
    "averageMinutes": 24.5,
    "averageHours": 0.41,
    "completedCount": 32
  },
  "timestamp": "2025-09-25T10:30:00.000Z"
}
```

**Prisma Query**:

```typescript
prisma.application.findMany({
  where: {
    status: "completed",
    completedAt: { not: null },
    position: { userId: managerId },
  },
  select: { startedAt: true, completedAt: true },
});
```

### 3. Applications by Position - `GET /by-position`

**Purpose**: Group applications by position title with counts

**Response Structure**:

```json
{
  "success": true,
  "data": {
    "positions": [
      {
        "positionId": "pos_1",
        "positionTitle": "Senior Software Engineer",
        "applicationCount": 23
      }
    ],
    "totalPositions": 3,
    "totalApplications": 47
  },
  "timestamp": "2025-09-25T10:30:00.000Z"
}
```

**Prisma Query**:

```typescript
prisma.position.findMany({
  where: { userId: managerId },
  select: {
    id: true,
    title: true,
    _count: { select: { applications: true } },
  },
});
```

### 4. Result Distribution - `GET /result-distribution`

**Purpose**: Count applications by overallResult (PENDING/PASSED/FAILED)

**Response Structure**:

```json
{
  "success": true,
  "data": {
    "counts": {
      "PENDING": 15,
      "PASSED": 20,
      "FAILED": 12,
      "total": 47
    },
    "percentages": {
      "PENDING": 32,
      "PASSED": 43,
      "FAILED": 25
    }
  },
  "timestamp": "2025-09-25T10:30:00.000Z"
}
```

**Prisma Query**:

```typescript
prisma.application.groupBy({
  by: ["overallResult"],
  where: { position: { userId: managerId } },
  _count: { _all: true },
});
```

### 5. Application Trends - `GET /trends`

**Purpose**: Show applications created over time (daily or weekly)

**Query Parameters**:

- `period`: `daily` | `weekly` (default: `daily`)
- `days`: number of days back to analyze (default: `30`)

**Response Structure**:

```json
{
  "success": true,
  "data": {
    "trends": [
      { "date": "2025-08-26", "count": 2 },
      { "date": "2025-08-27", "count": 5 }
    ],
    "period": "daily",
    "totalApplications": 47,
    "dateRange": {
      "start": "2025-08-26",
      "end": "2025-09-25"
    }
  },
  "timestamp": "2025-09-25T10:30:00.000Z"
}
```

**Prisma Query**:

```typescript
prisma.application.findMany({
  where: {
    position: { userId: managerId },
    startedAt: { gte: startDate, lte: endDate },
  },
  select: { startedAt: true },
  orderBy: { startedAt: "asc" },
});
```

### 6. Abandoned Applications - `GET /abandoned`

**Purpose**: Find applications that are in_progress but haven't been completed within a threshold

**Query Parameters**:

- `hours`: threshold in hours (default: `72`)

**Response Structure**:

```json
{
  "success": true,
  "data": {
    "abandonedApplications": [
      {
        "id": "app_123",
        "applicantName": "John Doe",
        "applicantEmail": "john@example.com",
        "positionTitle": "Senior Software Engineer",
        "startedAt": "2025-09-22T08:15:00.000Z",
        "hoursElapsed": 78
      }
    ],
    "count": 2,
    "thresholdHours": 72,
    "thresholdDate": "2025-09-22T10:30:00.000Z"
  },
  "timestamp": "2025-09-25T10:30:00.000Z"
}
```

**Prisma Query**:

```typescript
prisma.application.findMany({
  where: {
    status: "in_progress",
    completedAt: null,
    position: { userId: managerId },
    startedAt: { lt: thresholdDate },
  },
  select: {
    id: true,
    name: true,
    email: true,
    startedAt: true,
    position: { select: { title: true } },
  },
  orderBy: { startedAt: "desc" },
});
```

### 7. Completion Ratio - `GET /completion-ratio`

**Purpose**: Calculate completion ratios per position and overall

**Response Structure**:

```json
{
  "success": true,
  "data": {
    "positionRatios": [
      {
        "positionId": "pos_1",
        "positionTitle": "Senior Software Engineer",
        "totalApplications": 23,
        "completedApplications": 18,
        "inProgressApplications": 5,
        "completionRatio": 0.78,
        "completionPercentage": 78
      }
    ],
    "overallStats": {
      "totalApplications": 47,
      "totalCompleted": 32,
      "totalInProgress": 15,
      "completionRatio": 0.68,
      "completionPercentage": 68
    }
  },
  "timestamp": "2025-09-25T10:30:00.000Z"
}
```

**Prisma Query**:

```typescript
prisma.position.findMany({
  where: { userId: managerId },
  select: {
    id: true,
    title: true,
    applications: { select: { status: true } },
  },
});
```

## Authentication

All endpoints require:

- Valid JWT token
- User role: `MANAGER`
- Data is automatically scoped to the authenticated manager's positions

## Error Handling

All endpoints return consistent error responses:

```json
{
  "error": "Unauthorized. Manager access required.",
  "success": false
}
```

Common error statuses:

- `401`: Unauthorized (missing token or not a manager)
- `500`: Internal server error

## TypeScript Integration

### Service Layer

The `ApplicationAnalyticsService` class provides reusable methods for all analytics queries that can be imported and used in other parts of the application.

```typescript
import { ApplicationAnalyticsService } from "@/lib/services/application-analytics";

// Usage example
const statusSummary = await ApplicationAnalyticsService.getStatusSummary(managerId);
```

### React Hooks

Pre-built hooks are available for frontend integration:

```typescript
import { useStatusSummary, useApplicationTrends, useAnalyticsDashboard } from "@/lib/hooks/useAnalytics";

// Usage in React components
const { data, loading, error, refetch } = useStatusSummary();
const trends = useApplicationTrends({ period: "weekly", days: 14 });
```

### Type Definitions

All response types are defined in `@/lib/types/analytics`:

```typescript
import { StatusSummaryResponse, ApplicationTrendsResponse } from "@/lib/types/analytics";
```

## Testing

A test endpoint is available at `/api/analytics/applications/test` which returns example responses for all endpoints to help with frontend development.

A test page is available at `/test-analytics` to see all endpoints in action.

## Performance Considerations

- All queries are scoped by manager ID to ensure data isolation
- Indexes should be added on frequently queried fields:
  - `Application.positionId`
  - `Application.status`
  - `Application.overallResult`
  - `Application.startedAt`
- Consider pagination for endpoints that may return large datasets
- Use caching for frequently requested analytics data

## Future Enhancements

Potential additions:

1. Real-time analytics with WebSocket updates
2. Export functionality (CSV, PDF reports)
3. Comparative analytics (period-over-period)
4. Advanced filtering options
5. Custom date ranges for all endpoints
6. Performance metrics (response times, throughput)
