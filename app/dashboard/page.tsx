import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Briefcase, Users, Clock, Plus, Eye, TrendingUp, CheckCircle, AlertCircle } from "lucide-react";

interface DashboardStats {
  totalPositions: number;
  totalApplicants: number;
  pendingEvaluations: number;
  completedApplications: number;
}

async function getDashboardStats(userId: string): Promise<DashboardStats> {
  // Get total positions created by the manager
  const totalPositions = await prisma.position.count({
    where: { userId },
  });

  // Get total applicants across all positions
  const totalApplicants = await prisma.application.count({
    where: {
      position: {
        userId,
      },
    },
  });

  // Get applications that are in progress (pending evaluation)
  const pendingEvaluations = await prisma.application.count({
    where: {
      position: {
        userId,
      },
      status: "in_progress",
    },
  });

  // Get completed applications
  const completedApplications = await prisma.application.count({
    where: {
      position: {
        userId,
      },
      status: "completed",
    },
  });

  return {
    totalPositions,
    totalApplicants,
    pendingEvaluations,
    completedApplications,
  };
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "MANAGER") {
    redirect("/login");
  }

  const stats = await getDashboardStats(session.user.id);

  const summaryCards = [
    {
      title: "Total Positions",
      value: stats.totalPositions,
      description: "Active job positions",
      icon: Briefcase,
      iconColor: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Total Applicants",
      value: stats.totalApplicants,
      description: "Applications received",
      icon: Users,
      iconColor: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Pending Evaluations",
      value: stats.pendingEvaluations,
      description: "Applications in progress",
      icon: Clock,
      iconColor: "text-yellow-600",
      bgColor: "bg-yellow-50",
    },
    {
      title: "Completed",
      value: stats.completedApplications,
      description: "Finished applications",
      icon: CheckCircle,
      iconColor: "text-emerald-600",
      bgColor: "bg-emerald-50",
    },
  ];

  const quickActions = [
    {
      title: "Create Position",
      description: "Add a new job position",
      href: "/dashboard/positions/new",
      icon: Plus,
      variant: "default" as const,
    },
    {
      title: "View Positions",
      description: "Manage existing positions",
      href: "/dashboard/positions",
      icon: Eye,
      variant: "outline" as const,
    },
    {
      title: "Analytics",
      description: "View detailed insights",
      href: "/dashboard/analytics",
      icon: TrendingUp,
      variant: "outline" as const,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">Overview of your hiring pipeline and recent activity</p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {summaryCards.map(card => (
          <Card key={card.title} className="relative">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">{card.title}</CardTitle>
              <div className={`p-2 rounded-lg ${card.bgColor}`}>
                <card.icon className={`h-5 w-5 ${card.iconColor}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900 mb-1">{card.value}</div>
              <p className="text-sm text-gray-500">{card.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <AlertCircle className="mr-2 h-5 w-5 text-blue-600" />
            Quick Actions
          </CardTitle>
          <p className="text-sm text-gray-600">Common tasks to manage your hiring process</p>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {quickActions.map(action => (
              <Link key={action.title} href={action.href}>
                <Button
                  variant={action.variant}
                  className="w-full h-auto p-4 flex flex-col items-center space-y-2 text-center"
                >
                  <action.icon className="h-6 w-6" />
                  <div>
                    <div className="font-semibold">{action.title}</div>
                    <div className="text-xs text-gray-500 mt-1">{action.description}</div>
                  </div>
                </Button>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Status Summary */}
      {stats.totalApplicants > 0 && (
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Application Pipeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">In Progress</span>
                  <span className="text-sm text-gray-600">{stats.pendingEvaluations} applications</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-yellow-500 h-2 rounded-full"
                    style={{
                      width: `${(stats.pendingEvaluations / stats.totalApplicants) * 100}%`,
                    }}
                  />
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Completed</span>
                  <span className="text-sm text-gray-600">{stats.completedApplications} applications</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full"
                    style={{
                      width: `${(stats.completedApplications / stats.totalApplicants) * 100}%`,
                    }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full" />
                  <span className="text-gray-600">{stats.totalPositions} positions created</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  <span className="text-gray-600">{stats.totalApplicants} applications received</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                  <span className="text-gray-600">{stats.pendingEvaluations} awaiting evaluation</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                  <span className="text-gray-600">{stats.completedApplications} completed evaluations</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Empty State */}
      {stats.totalPositions === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <Briefcase className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Get started with your first position</h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Create your first job position to start receiving and managing applications.
            </p>
            <Link href="/dashboard/positions/new">
              <Button size="lg">
                <Plus className="mr-2 h-5 w-5" />
                Create Your First Position
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
