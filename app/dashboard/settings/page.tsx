import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings, User, Bell, Shield, Palette } from "lucide-react";

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "MANAGER") {
    redirect("/login");
  }

  const settingsCategories = [
    {
      title: "Profile Settings",
      description: "Update your personal information",
      icon: User,
      iconColor: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Notifications",
      description: "Configure email and app notifications",
      icon: Bell,
      iconColor: "text-yellow-600",
      bgColor: "bg-yellow-50",
    },
    {
      title: "Security",
      description: "Password and authentication settings",
      icon: Shield,
      iconColor: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Appearance",
      description: "Customize your dashboard theme",
      icon: Palette,
      iconColor: "text-purple-600",
      bgColor: "bg-purple-50",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-2">Manage your account preferences and dashboard configuration</p>
      </div>

      {/* Current User Info */}
      <Card>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-gray-700">Name</label>
              <p className="text-gray-900 mt-1">{session.user.name || "Not set"}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Email</label>
              <p className="text-gray-900 mt-1">{session.user.email}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Role</label>
              <p className="text-gray-900 mt-1 capitalize">{session.user.role.toLowerCase()}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">User ID</label>
              <p className="text-gray-600 mt-1 font-mono text-xs">{session.user.id}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Settings Categories */}
      <div className="grid gap-6 md:grid-cols-2">
        {settingsCategories.map(category => (
          <Card key={category.title} className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                <div className={`p-3 rounded-lg ${category.bgColor}`}>
                  <category.icon className={`h-6 w-6 ${category.iconColor}`} />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">{category.title}</h3>
                  <p className="text-sm text-gray-600">{category.description}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Coming Soon Notice */}
      <Card className="text-center py-8">
        <CardContent>
          <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <Settings className="h-6 w-6 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Settings Panel Coming Soon</h3>
          <p className="text-gray-600 max-w-md mx-auto">
            We are working on comprehensive settings to help you customize your experience. Advanced configuration
            options will be available in future updates.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
