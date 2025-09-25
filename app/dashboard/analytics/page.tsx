import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, TrendingUp, Users, Clock } from "lucide-react";

export default async function AnalyticsPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "MANAGER") {
    redirect("/login");
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
        <p className="text-gray-600 mt-2">Detailed insights and metrics for your hiring pipeline</p>
      </div>

      {/* Coming Soon Card */}
      <Card className="text-center py-12">
        <CardContent>
          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <BarChart3 className="h-8 w-8 text-blue-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Analytics Dashboard Coming Soon</h3>
          <p className="text-gray-600 max-w-md mx-auto mb-8">
            We are working on comprehensive analytics to help you understand your hiring pipeline better. Soon you will
            be able to view detailed metrics, conversion rates, and performance insights.
          </p>
          <div className="grid gap-4 md:grid-cols-3 max-w-2xl mx-auto">
            <div className="p-4 bg-gray-50 rounded-lg">
              <TrendingUp className="h-6 w-6 text-blue-600 mx-auto mb-2" />
              <h4 className="font-semibold text-sm">Conversion Rates</h4>
              <p className="text-xs text-gray-600 mt-1">Application to hire ratios</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <Users className="h-6 w-6 text-green-600 mx-auto mb-2" />
              <h4 className="font-semibold text-sm">Candidate Insights</h4>
              <p className="text-xs text-gray-600 mt-1">Detailed applicant analytics</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <Clock className="h-6 w-6 text-purple-600 mx-auto mb-2" />
              <h4 className="font-semibold text-sm">Time to Hire</h4>
              <p className="text-xs text-gray-600 mt-1">Process efficiency metrics</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
