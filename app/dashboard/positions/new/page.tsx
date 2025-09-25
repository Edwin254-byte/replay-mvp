"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Loader2, Plus, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function NewPositionPage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error("Position title is required");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/positions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Position created successfully!");
        router.push("/dashboard/positions");
      } else {
        toast.error(data.error || "Failed to create position");
      }
    } catch (error) {
      console.error("Error creating position:", error);
      toast.error("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with back button */}
      <div className="flex items-center space-x-4">
        <Link href="/dashboard/positions">
          <Button variant="outline" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Positions
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Create New Position</h1>
          <p className="text-gray-600 mt-1">Add a new job position to start receiving applications</p>
        </div>
      </div>

      {/* Form Card */}
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Position Details</CardTitle>
          <CardDescription>Enter the basic information for your new job position</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Position Title *</Label>
              <Input
                id="title"
                type="text"
                placeholder="e.g. Senior Software Engineer"
                value={title}
                onChange={e => setTitle(e.target.value)}
                disabled={loading}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe the role, responsibilities, and requirements..."
                value={description}
                onChange={e => setDescription(e.target.value)}
                disabled={loading}
                rows={4}
              />
              <p className="text-sm text-gray-500">
                Provide details about the position to help candidates understand the role
              </p>
            </div>

            <div className="flex space-x-4">
              <Button type="submit" disabled={loading || !title.trim()} className="flex-1">
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Position
                  </>
                )}
              </Button>

              <Link href="/dashboard/positions">
                <Button type="button" variant="outline" disabled={loading}>
                  Cancel
                </Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
