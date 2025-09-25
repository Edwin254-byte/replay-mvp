import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Users, HelpCircle, Eye } from "lucide-react";

export default async function PositionsPage() {
  const session = await getServerSession(authOptions);

  // Note: Layout already handles this redirect, but keeping for safety
  if (!session || session.user.role !== "MANAGER") {
    redirect("/login");
  }

  const positions = await prisma.position.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: {
          applications: true,
          questions: true,
        },
      },
    },
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Positions</h1>
          <p className="text-gray-600 mt-2">Manage your job positions and track applications</p>
        </div>
        <Link href="/dashboard/positions/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Position
          </Button>
        </Link>
      </div>

      {positions.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Plus className="h-6 w-6 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No positions created yet</h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Create your first job position to start receiving applications from candidates.
            </p>
            <Link href="/dashboard/positions/new">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Your First Position
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {positions.map(position => (
            <Card key={position.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <CardTitle className="text-xl">{position.title}</CardTitle>
                    <p className="text-gray-600 text-sm line-clamp-2">
                      {position.description || "No description provided"}
                    </p>
                  </div>
                  <Link href={`/dashboard/positions/${position.id}`}>
                    <Button size="sm">
                      <Eye className="mr-2 h-4 w-4" />
                      Manage
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-6">
                  <div className="flex items-center space-x-2">
                    <div className="p-1 bg-blue-100 rounded">
                      <Users className="h-4 w-4 text-blue-600" />
                    </div>
                    <span className="text-sm text-gray-600">{position._count.applications} Applications</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="p-1 bg-green-100 rounded">
                      <HelpCircle className="h-4 w-4 text-green-600" />
                    </div>
                    <span className="text-sm text-gray-600">{position._count.questions} Questions</span>
                  </div>
                  <div className="flex-1" />
                  <Badge variant="secondary" className="text-xs">
                    Active
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
