"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { mockAnalytics, mockApplications } from "@/lib/data/mock-data";
import { ApplicationAnalytics } from "@/lib/types/analytics";
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
import { ChevronDown, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, ChevronUp, Eye, Search } from "lucide-react";
import { useMemo, useState } from "react";

// TODO: Implement real analytics API endpoints
// - /api/positions/[id]/analytics for position statistics
// - /api/positions/[id]/applications for application data with analytics fields
// - Backend aggregation queries for performance metrics

const getStatusBadgeVariant = (status: string) => {
  switch (status) {
    case "Pass":
      return "default"; // Green
    case "Fail":
      return "destructive"; // Red
    case "Not Scored":
      return "secondary"; // Gray
    case "Null":
      return "outline"; // Outline
    default:
      return "secondary";
  }
};

const getProgressBadgeVariant = (progress: string) => {
  switch (progress) {
    case "Completed":
      return "default"; // Green
    case "In Progress":
      return "secondary"; // Gray
    default:
      return "secondary";
  }
};

interface PositionAnalyticsProps {
  positionId: string;
}

export default function PositionAnalytics({ positionId }: PositionAnalyticsProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState("");

  const columns = useMemo<ColumnDef<ApplicationAnalytics>[]>(
    () => [
      {
        accessorKey: "applicant",
        header: ({ column }) => {
          return (
            <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} className="h-auto p-0 font-medium text-left">
              Applicant
              {column.getIsSorted() === "asc" ? (
                <ChevronUp className="ml-2 h-4 w-4" />
              ) : column.getIsSorted() === "desc" ? (
                <ChevronDown className="ml-2 h-4 w-4" />
              ) : null}
            </Button>
          );
        },
        cell: ({ row }) => <div className="font-medium">{row.getValue("applicant")}</div>,
      },
      {
        accessorKey: "email",
        header: "Email",
        cell: ({ row }) => <div className="text-slate-600">{row.getValue("email")}</div>,
      },
      {
        accessorKey: "started",
        header: ({ column }) => {
          return (
            <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} className="h-auto p-0 font-medium text-left">
              Started
              {column.getIsSorted() === "asc" ? (
                <ChevronUp className="ml-2 h-4 w-4" />
              ) : column.getIsSorted() === "desc" ? (
                <ChevronDown className="ml-2 h-4 w-4" />
              ) : null}
            </Button>
          );
        },
        cell: ({ row }) => <div className="text-slate-600">{row.getValue("started")}</div>,
      },
      {
        accessorKey: "ended",
        header: ({ column }) => {
          return (
            <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} className="h-auto p-0 font-medium text-left">
              Ended
              {column.getIsSorted() === "asc" ? (
                <ChevronUp className="ml-2 h-4 w-4" />
              ) : column.getIsSorted() === "desc" ? (
                <ChevronDown className="ml-2 h-4 w-4" />
              ) : null}
            </Button>
          );
        },
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
        filterFn: (row, id, value) => {
          return value.includes(row.getValue(id));
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
        filterFn: (row, id, value) => {
          return value.includes(row.getValue(id));
        },
      },
      {
        accessorKey: "application",
        header: "Application",
        cell: ({ row }) => (
          <Button variant="ghost" size="sm" className="text-slate-600 underline">
            <Eye className="w-4 h-4 mr-1" />
            View Application
          </Button>
        ),
        enableSorting: false,
      },
    ],
    []
  );

  const table = useReactTable({
    data: mockApplications,
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

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">In Progress Apps</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{mockAnalytics.inProgressApps}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Completed Apps</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{mockAnalytics.completedApps}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Passed Apps</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{mockAnalytics.passedApps}</div>
          </CardContent>
        </Card>
      </div>

      {/* Applications Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Application Analytics</CardTitle>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                <Input
                  placeholder="Search applications..."
                  value={globalFilter ?? ""}
                  onChange={event => setGlobalFilter(String(event.target.value))}
                  className="pl-9 w-64"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Table */}
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  {table.getHeaderGroups().map(headerGroup => (
                    <TableRow key={headerGroup.id}>
                      {headerGroup.headers.map(header => (
                        <TableHead key={header.id} className="text-left">
                          {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                        </TableHead>
                      ))}
                    </TableRow>
                  ))}
                </TableHeader>
                <TableBody>
                  {table.getRowModel().rows?.length ? (
                    table.getRowModel().rows.map(row => (
                      <TableRow key={row.id} data-state={row.getIsSelected() && "selected"} className="hover:bg-slate-50">
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

            {/* Pagination */}
            <div className="flex items-center justify-between">
              <div className="flex-1 text-sm text-slate-600">
                {table.getFilteredSelectedRowModel().rows.length} of {table.getFilteredRowModel().rows.length} row(s) selected.
              </div>
              <div className="flex items-center space-x-6 lg:space-x-8">
                <div className="flex items-center space-x-2">
                  <p className="text-sm font-medium">Rows per page</p>
                  <select
                    value={table.getState().pagination.pageSize}
                    onChange={e => {
                      table.setPageSize(Number(e.target.value));
                    }}
                    className="h-8 w-[70px] rounded border border-slate-300 px-2 py-1 text-sm"
                  >
                    {[10, 20, 30, 40, 50].map(pageSize => (
                      <option key={pageSize} value={pageSize}>
                        {pageSize}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex w-[100px] items-center justify-center text-sm font-medium">
                  Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    className="hidden h-8 w-8 p-0 lg:flex"
                    onClick={() => table.setPageIndex(0)}
                    disabled={!table.getCanPreviousPage()}
                  >
                    <span className="sr-only">Go to first page</span>
                    <ChevronsLeft className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" className="h-8 w-8 p-0" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
                    <span className="sr-only">Go to previous page</span>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" className="h-8 w-8 p-0" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
                    <span className="sr-only">Go to next page</span>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    className="hidden h-8 w-8 p-0 lg:flex"
                    onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                    disabled={!table.getCanNextPage()}
                  >
                    <span className="sr-only">Go to last page</span>
                    <ChevronsRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
