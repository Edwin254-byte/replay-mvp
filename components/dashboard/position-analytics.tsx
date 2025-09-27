"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
} from "@tanstack/react-table";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ChevronUp,
  Eye,
  Search,
  Loader2,
  X,
} from "lucide-react";
import { useMemo, useState, useEffect, useCallback } from "react";
import { toast } from "sonner";

interface PositionAnalyticsProps {
  positionId: string;
}

interface PositionAnalyticsData {
  inProgressApps: number;
  completedApps: number;
  passedApps: number;
  failedApps: number;
  pendingApps: number;
  totalApps: number;
  averageCompletionMinutes: number;
}

interface ApplicationData {
  id: string;
  applicant: string;
  email: string;
  started: string;
  ended: string | null;
  progress: string;
  status: string;
  application: string;
  totalAnswers: number;
}

interface ApplicationDetails {
  id: string;
  applicant: {
    name: string;
    email: string;
  };
  position: {
    title: string;
    company: string;
  };
  startedAt: string;
  endedAt: string | null;
  status: string;
  progress: string;
  responses: Array<{
    id: string;
    questionText: string;
    response: string;
    createdAt: string;
  }>;
  totalQuestions: number;
  completedQuestions: number;
}

const getStatusBadgeVariant = (status: string) => {
  switch (status) {
    case "PASSED":
      return "default";
    case "FAILED":
      return "destructive";
    case "PENDING":
      return "secondary";
    default:
      return "secondary";
  }
};

const getProgressBadgeVariant = (progress: string) => {
  switch (progress) {
    case "Completed":
      return "default";
    case "In Progress":
      return "secondary";
    default:
      return "secondary";
  }
};

export default function PositionAnalytics({ positionId }: PositionAnalyticsProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [analytics, setAnalytics] = useState<PositionAnalyticsData | null>(null);
  const [applications, setApplications] = useState<ApplicationData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedApplicationId, setSelectedApplicationId] = useState<string | null>(null);
  const [applicationDetails, setApplicationDetails] = useState<ApplicationDetails | null>(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/positions/${positionId}/analytics`);
        if (!response.ok) {
          throw new Error("Failed to fetch analytics data");
        }

        const data = await response.json();
        if (data.success) {
          setAnalytics(data.data.analytics);
          setApplications(data.data.applications);
        } else {
          throw new Error(data.error || "Failed to load analytics");
        }
      } catch (error) {
        console.error("Error fetching analytics:", error);
        setError(error instanceof Error ? error.message : "Failed to load analytics");
        toast.error("Failed to load analytics data");
      } finally {
        setLoading(false);
      }
    };

    if (positionId) {
      fetchAnalytics();
    }
  }, [positionId]);

  // Fetch application details for modal
  const fetchApplicationDetails = async (applicationId: string) => {
    try {
      setModalLoading(true);
      setModalError(null);

      const response = await fetch(`/api/applications/${applicationId}/details`);
      if (!response.ok) {
        throw new Error("Failed to fetch application details");
      }

      const data = await response.json();
      if (data.success) {
        setApplicationDetails(data.data);
      } else {
        throw new Error(data.error || "Failed to load application details");
      }
    } catch (error) {
      console.error("Error fetching application details:", error);
      setModalError(error instanceof Error ? error.message : "Failed to load application details");
    } finally {
      setModalLoading(false);
    }
  };

  // Handle view application click
  const handleViewApplication = useCallback(async (applicationId: string) => {
    setSelectedApplicationId(applicationId);
    setIsModalOpen(true);
    await fetchApplicationDetails(applicationId);
  }, []);

  // Handle modal close
  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedApplicationId(null);
    setApplicationDetails(null);
    setModalError(null);
  }, []);

  const columns: ColumnDef<ApplicationData>[] = useMemo(
    () => [
      {
        accessorKey: "applicant",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-auto p-0 font-medium text-left"
          >
            Applicant
            {column.getIsSorted() === "asc" ? (
              <ChevronUp className="ml-2 h-4 w-4" />
            ) : column.getIsSorted() === "desc" ? (
              <ChevronDown className="ml-2 h-4 w-4" />
            ) : null}
          </Button>
        ),
        cell: ({ row }) => <div className="font-medium text-slate-900">{row.getValue("applicant")}</div>,
      },
      {
        accessorKey: "email",
        header: "Email",
        cell: ({ row }) => <div className="text-slate-600">{row.getValue("email")}</div>,
      },
      {
        accessorKey: "started",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-auto p-0 font-medium text-left"
          >
            Started
            {column.getIsSorted() === "asc" ? (
              <ChevronUp className="ml-2 h-4 w-4" />
            ) : column.getIsSorted() === "desc" ? (
              <ChevronDown className="ml-2 h-4 w-4" />
            ) : null}
          </Button>
        ),
        cell: ({ row }) => <div className="text-slate-600">{row.getValue("started")}</div>,
      },
      {
        accessorKey: "ended",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-auto p-0 font-medium text-left"
          >
            Ended
            {column.getIsSorted() === "asc" ? (
              <ChevronUp className="ml-2 h-4 w-4" />
            ) : column.getIsSorted() === "desc" ? (
              <ChevronDown className="ml-2 h-4 w-4" />
            ) : null}
          </Button>
        ),
        cell: ({ row }) => <div className="text-slate-600">{row.getValue("ended") || "-"}</div>,
      },
      {
        accessorKey: "progress",
        header: "Progress",
        cell: ({ row }) => {
          const progress = row.getValue("progress") as string;
          return (
            <Badge variant={getProgressBadgeVariant(progress)} className="text-xs">
              {progress === "Completed" && "✓"} {progress}
            </Badge>
          );
        },
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
          const status = row.getValue("status") as string;
          return (
            <Badge variant={getStatusBadgeVariant(status)} className="text-xs">
              {status}
            </Badge>
          );
        },
      },
      {
        accessorKey: "application",
        header: "Application",
        cell: ({ row }) => (
          <Button
            variant="ghost"
            size="sm"
            className="text-slate-600 underline"
            onClick={() => handleViewApplication(row.original.id)}
          >
            <Eye className="w-4 h-4 mr-1" />
            View Application
          </Button>
        ),
        enableSorting: false,
      },
    ],
    [handleViewApplication]
  );

  const table = useReactTable({
    data: applications,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting,
      columnFilters,
      globalFilter,
    },
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Loading analytics...</span>
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <div className="text-center p-8">
        <p className="text-red-600 mb-4">{error || "Failed to load analytics"}</p>
        <Button onClick={() => window.location.reload()}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Compact Statistics Cards - Single Row */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <Card className="p-3">
          <div className="text-xs font-medium text-slate-600 mb-1">In Progress</div>
          <div className="text-xl font-bold">{analytics.inProgressApps}</div>
        </Card>

        <Card className="p-3">
          <div className="text-xs font-medium text-slate-600 mb-1">Completed</div>
          <div className="text-xl font-bold">{analytics.completedApps}</div>
        </Card>

        <Card className="p-3">
          <div className="text-xs font-medium text-slate-600 mb-1">Passed</div>
          <div className="text-xl font-bold">{analytics.passedApps}</div>
          <div className="text-xs text-slate-500">
            {analytics.totalApps > 0 ? Math.round((analytics.passedApps / analytics.totalApps) * 100) : 0}% rate
          </div>
        </Card>

        <Card className="p-3">
          <div className="text-xs font-medium text-slate-600 mb-1">Failed</div>
          <div className="text-xl font-bold text-red-600">{analytics.failedApps}</div>
        </Card>

        <Card className="p-3">
          <div className="text-xs font-medium text-slate-600 mb-1">Avg. Time</div>
          <div className="text-xl font-bold">{analytics.averageCompletionMinutes}min</div>
        </Card>

        <Card className="p-3">
          <div className="text-xs font-medium text-slate-600 mb-1">Total Apps</div>
          <div className="text-xl font-bold">{analytics.totalApps}</div>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Applications</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-4">
            <div className="relative max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
              <Input
                placeholder="Search applications..."
                value={globalFilter ?? ""}
                onChange={event => setGlobalFilter(String(event.target.value))}
                className="pl-10"
              />
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map(headerGroup => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map(header => (
                      <TableHead key={header.id} className="text-slate-600">
                        {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map(row => (
                    <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                      {row.getVisibleCells().map(cell => (
                        <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="h-24 text-center">
                      No applications found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-between space-x-2 py-4">
            <div className="text-sm text-slate-600">
              Showing {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} to{" "}
              {Math.min(
                (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
                table.getFilteredRowModel().rows.length
              )}{" "}
              of {table.getFilteredRowModel().rows.length} applications
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.setPageIndex(0)}
                disabled={!table.getCanPreviousPage()}
              >
                <ChevronsLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                disabled={!table.getCanNextPage()}
              >
                <ChevronsRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Application Details Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Application Details</span>
              <Button variant="ghost" size="sm" onClick={handleCloseModal} className="h-6 w-6 p-0">
                <X className="h-4 w-4" />
              </Button>
            </DialogTitle>
          </DialogHeader>

          <ScrollArea className="max-h-[calc(80vh-8rem)] pr-4">
            {modalLoading ? (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                <span className="ml-2 text-gray-600">Loading application...</span>
              </div>
            ) : modalError ? (
              <div className="text-center p-8">
                <p className="text-red-600 mb-4">{modalError}</p>
                <Button onClick={() => selectedApplicationId && fetchApplicationDetails(selectedApplicationId)}>
                  Retry
                </Button>
              </div>
            ) : applicationDetails ? (
              <div className="space-y-6">
                {/* Applicant Information */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">Applicant Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-slate-600">Name</label>
                      <p className="text-slate-900">{applicationDetails.applicant.name}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-600">Email</label>
                      <p className="text-slate-900">{applicationDetails.applicant.email}</p>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Position Information */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">Position Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-slate-600">Position</label>
                      <p className="text-slate-900">{applicationDetails.position.title}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-600">Company</label>
                      <p className="text-slate-900">{applicationDetails.position.company}</p>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Application Status */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">Application Status</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <label className="text-sm font-medium text-slate-600">Started</label>
                      <p className="text-slate-900">{applicationDetails.startedAt}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-600">Ended</label>
                      <p className="text-slate-900">{applicationDetails.endedAt || "In Progress"}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-600">Progress</label>
                      <Badge variant={getProgressBadgeVariant(applicationDetails.progress)} className="text-xs">
                        {applicationDetails.progress}
                      </Badge>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-600">Status</label>
                      <Badge variant={getStatusBadgeVariant(applicationDetails.status)} className="text-xs">
                        {applicationDetails.status}
                      </Badge>
                    </div>
                  </div>
                  <div className="mt-4">
                    <label className="text-sm font-medium text-slate-600">Completion Progress</label>
                    <div className="flex items-center space-x-2 mt-1">
                      <div className="bg-slate-200 rounded-full h-2 flex-1">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all"
                          style={{
                            width: `${(applicationDetails.completedQuestions / applicationDetails.totalQuestions) * 100}%`,
                          }}
                        />
                      </div>
                      <span className="text-sm text-slate-600">
                        {applicationDetails.completedQuestions}/{applicationDetails.totalQuestions} questions
                      </span>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Interview Responses */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">Interview Responses</h3>
                  {applicationDetails.responses && applicationDetails.responses.length > 0 ? (
                    <div className="space-y-4">
                      {applicationDetails.responses.map((response, index) => (
                        <div key={response.id} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium text-slate-900">Question {index + 1}</h4>
                            <span className="text-xs text-slate-500">{response.createdAt}</span>
                          </div>
                          <div className="mb-3">
                            <p className="text-slate-700 font-medium">{response.questionText}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-slate-600">Answer:</label>
                            <div className="mt-1 p-3 bg-slate-50 rounded border">
                              <p className="text-slate-900 whitespace-pre-wrap">{response.response}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-500 text-center py-8">No responses available yet.</p>
                  )}
                </div>
              </div>
            ) : null}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}
