"use client";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Position, PositionWithStats } from "@/types/positions";
import { Link as LinkIcon, Plus, Search } from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function PositionsPage() {
  const [positions, setPositions] = useState<Position[]>([]);
  const [loading, setLoading] = useState(true);
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return; // Still loading session

    if (!session || session.user.role !== "MANAGER") {
      router.push("/login");
      return;
    }

    // Fetch positions from API
    const fetchPositions = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/positions");
        if (response.ok) {
          const data = await response.json();
          setPositions(data.positions || []);
        } else {
          console.error("Failed to fetch positions");
        }
      } catch (error) {
        console.error("Error fetching positions:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPositions();
  }, [session, status, router]);

  // Calculate statistics for each position
  const positionsWithStats: PositionWithStats[] = positions.map(position => {
    const total = position.applications.length;
    const inProgress = position.applications.filter(app => app.status === "in_progress").length;
    const completed = position.applications.filter(app => app.status === "completed").length;
    const passed = position.applications.filter(app => app.status === "completed").length; // Assuming completed means passed for now

    return {
      ...position,
      stats: {
        total,
        inProgress,
        completed,
        passed,
      },
    };
  });

  // Generate avatar color based on position title
  const getAvatarColor = (title: string) => {
    const colors = ["bg-blue-500", "bg-green-500", "bg-purple-500", "bg-pink-500", "bg-indigo-500", "bg-yellow-500", "bg-red-500"];
    const index = title.length % colors.length;
    return colors[index];
  };

  // Show loading if session is still loading
  if (status === "loading") {
    return (
      <div className="text-center py-12">
        <div className="animate-spin mx-auto w-8 h-8 border-2 border-gray-300 border-t-gray-900 rounded-full mb-4"></div>
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  // Redirect if not authenticated (this should be handled by middleware, but just in case)
  if (!session || session.user.role !== "MANAGER") {
    return null; // Component will redirect in useEffect
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Positions</h1>
          <p className="text-gray-600 mt-1">Manage your positions and monitor their performance</p>
        </div>
        <Button asChild className="bg-black hover:bg-gray-800 text-white">
          <Link href="/dashboard/positions/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Position
          </Link>
        </Button>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input placeholder="Search..." className="pl-10" />
      </div>

      {loading ? (
        <div className="text-center py-12 bg-white rounded-lg border">
          <div className="animate-spin mx-auto w-8 h-8 border-2 border-gray-300 border-t-gray-900 rounded-full mb-4"></div>
          <p className="text-gray-600">Loading positions...</p>
        </div>
      ) : positions.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border">
          <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <Plus className="h-6 w-6 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No positions created yet</h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">Create your first job position to start receiving applications from candidates.</p>
          <Button asChild>
            <Link href="/dashboard/positions/new">
              <Plus className="mr-2 h-4 w-4" />
              Create Your First Position
            </Link>
          </Button>
        </div>
      ) : (
        <div className="bg-white rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow className="border-b">
                <TableHead className="font-medium text-gray-700">Name</TableHead>
                <TableHead className="font-medium text-gray-700 text-center">In Progress</TableHead>
                <TableHead className="font-medium text-gray-700 text-center">Completed</TableHead>
                <TableHead className="font-medium text-gray-700 text-center">Passed</TableHead>
                <TableHead className="font-medium text-gray-700">Share Link</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {positionsWithStats.map(position => (
                <TableRow
                  key={position.id}
                  className="hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => router.push(`/dashboard/positions/${position.id}`)}
                >
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <Avatar className={`h-10 w-10 ${getAvatarColor(position.title)}`}>
                        <AvatarFallback className="text-white font-semibold">{position.title.substring(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium text-gray-900">{position.title}</div>
                        <p className="text-sm text-gray-500 mt-1 line-clamp-1">{position.description || "No description"}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="inline-flex items-center justify-center w-8 h-6 text-sm font-medium bg-blue-100 text-blue-800 rounded-full">
                      {position.stats.inProgress}
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="inline-flex items-center justify-center w-8 h-6 text-sm font-medium bg-green-100 text-green-800 rounded-full">
                      {position.stats.completed}
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="inline-flex items-center justify-center w-8 h-6 text-sm font-medium bg-purple-100 text-purple-800 rounded-full">
                      {position.stats.passed}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-gray-600 hover:text-gray-900"
                      onClick={e => {
                        e.stopPropagation(); // Prevent row click
                        const shareUrl = `${window.location.origin}/public/${position.id}`;
                        navigator.clipboard.writeText(shareUrl);
                      }}
                    >
                      <LinkIcon className="h-4 w-4 mr-1" />
                      Copy Share Link
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
