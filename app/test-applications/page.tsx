"use client";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// TypeScript interfaces
interface Position {
  id: string;
  title: string;
  description?: string;
  createdAt: string;
}

interface Application {
  id: string;
  name: string;
  email: string;
  resumeUrl?: string;
  status: "in_progress" | "completed";
  overallResult: "PENDING" | "PASSED" | "FAILED";
  positionId: string;
  startedAt: string;
  completedAt?: string;
  position: {
    id: string;
    title: string;
  };
}

interface NewApplicationForm {
  name: string;
  email: string;
  resumeUrl: string;
}

export default function TestApplicationsPage() {
  const [positions, setPositions] = useState<Position[]>([]);
  const [selectedPosition, setSelectedPosition] = useState("");
  const [applications, setApplications] = useState<Application[]>([]);
  const [newApplication, setNewApplication] = useState<NewApplicationForm>({
    name: "",
    email: "",
    resumeUrl: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchPositions();
  }, []);

  const fetchPositions = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/positions");
      if (response.ok) {
        const data = await response.json();
        setPositions(data.positions);
      } else {
        toast.error("Failed to load positions");
      }
    } catch (error) {
      console.error("Error fetching positions:", error);
      toast.error("Error loading positions");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchApplications = async (positionId: string) => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/positions/${positionId}/applications`);
      if (response.ok) {
        const data = await response.json();
        setApplications(data.applications);
        toast.success(`Loaded ${data.applications.length} applications`);
      } else {
        console.error("Failed to fetch applications:", response.statusText);
        toast.error("Failed to load applications");
      }
    } catch (error) {
      console.error("Error fetching applications:", error);
      toast.error("Error loading applications");
    } finally {
      setIsLoading(false);
    }
  };

  const submitApplication = async () => {
    if (!selectedPosition || !newApplication.name || !newApplication.email) {
      toast.error("Please fill in required fields (position, name, and email)");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/applications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...newApplication,
          positionId: selectedPosition,
          resumeUrl: newApplication.resumeUrl || undefined,
        }),
      });

      if (response.ok) {
        toast.success("Application submitted successfully!");
        setNewApplication({ name: "", email: "", resumeUrl: "" });
        if (selectedPosition) {
          fetchApplications(selectedPosition);
        }
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to submit application");
      }
    } catch (error) {
      console.error("Error submitting application:", error);
      toast.error("Network error - please try again");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold">Test Applications Feature</h1>
        <p className="text-gray-600 mt-2">Submit and manage job applications</p>
      </div>

      {/* Submit Application Section */}
      <Card>
        <CardHeader>
          <CardTitle>Submit Application</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="position">Position *</Label>
              <Select value={selectedPosition} onValueChange={setSelectedPosition}>
                <SelectTrigger>
                  <SelectValue placeholder={isLoading ? "Loading positions..." : "Select a position"} />
                </SelectTrigger>
                <SelectContent>
                  {positions.map(position => (
                    <SelectItem key={position.id} value={position.id}>
                      {position.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                type="text"
                value={newApplication.name}
                onChange={e => setNewApplication({ ...newApplication, name: e.target.value })}
                placeholder="Enter your full name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={newApplication.email}
                onChange={e => setNewApplication({ ...newApplication, email: e.target.value })}
                placeholder="Enter your email address"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="resume">Resume URL (optional)</Label>
              <Input
                id="resume"
                type="url"
                value={newApplication.resumeUrl}
                onChange={e => setNewApplication({ ...newApplication, resumeUrl: e.target.value })}
                placeholder="https://example.com/resume.pdf"
              />
            </div>
          </div>

          <Button onClick={submitApplication} disabled={isSubmitting} className="w-full md:w-auto">
            {isSubmitting ? "Submitting..." : "Submit Application"}
          </Button>
        </CardContent>
      </Card>

      {/* View Applications Section */}
      <Card>
        <CardHeader>
          <CardTitle>View Applications (Manager Only)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="view-position">Position</Label>
            <Select
              value={selectedPosition}
              onValueChange={value => {
                setSelectedPosition(value);
                if (value) {
                  fetchApplications(value);
                }
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder={isLoading ? "Loading positions..." : "Select a position"} />
              </SelectTrigger>
              <SelectContent>
                {positions.map(position => (
                  <SelectItem key={position.id} value={position.id}>
                    {position.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {isLoading && selectedPosition && (
            <div className="text-center py-4">
              <p className="text-gray-500">Loading applications...</p>
            </div>
          )}

          {applications.length > 0 && (
            <div className="space-y-4">
              <h3 className="font-medium">Applications ({applications.length})</h3>
              <div className="grid gap-4">
                {applications.map(app => (
                  <Card key={app.id}>
                    <CardContent className="pt-6">
                      <div className="grid gap-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium">{app.name}</p>
                            <p className="text-sm text-gray-600">{app.email}</p>
                          </div>
                          <div className="text-right">
                            <span
                              className={`px-2 py-1 rounded text-xs ${
                                app.status === "in_progress"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-green-100 text-green-800"
                              }`}
                            >
                              {app.status.replace("_", " ").toUpperCase()}
                            </span>
                          </div>
                        </div>

                        <div className="flex gap-4 items-center">
                          <span
                            className={`px-2 py-1 rounded text-xs ${
                              app.overallResult === "PENDING"
                                ? "bg-gray-100 text-gray-800"
                                : app.overallResult === "PASSED"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                            }`}
                          >
                            {app.overallResult}
                          </span>
                          {app.resumeUrl && (
                            <a
                              href={app.resumeUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline text-sm"
                            >
                              View Resume
                            </a>
                          )}
                        </div>

                        <p className="text-sm text-gray-500">
                          Started: {new Date(app.startedAt).toLocaleDateString()}
                          {app.completedAt && (
                            <span> • Completed: {new Date(app.completedAt).toLocaleDateString()}</span>
                          )}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
