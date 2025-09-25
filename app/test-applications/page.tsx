"use client";
import { useState, useEffect } from "react";

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

  useEffect(() => {
    fetchPositions();
  }, []);

  const fetchPositions = async () => {
    try {
      const response = await fetch("/api/positions");
      if (response.ok) {
        const data = await response.json();
        setPositions(data.positions);
      }
    } catch (error) {
      console.error("Error fetching positions:", error);
    }
  };

  const fetchApplications = async (positionId: string) => {
    try {
      const response = await fetch(`/api/positions/${positionId}/applications`);
      if (response.ok) {
        const data = await response.json();
        setApplications(data.applications);
      } else {
        console.error("Failed to fetch applications:", response.statusText);
      }
    } catch (error) {
      console.error("Error fetching applications:", error);
    }
  };

  const submitApplication = async () => {
    if (!selectedPosition || !newApplication.name || !newApplication.email) {
      alert("Please fill in required fields");
      return;
    }

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
        alert("Application submitted successfully!");
        setNewApplication({ name: "", email: "", resumeUrl: "" });
        if (selectedPosition) {
          fetchApplications(selectedPosition);
        }
      } else {
        const error = await response.json();
        alert("Error: " + error.error);
      }
    } catch (error) {
      console.error("Error submitting application:", error);
      alert("Error submitting application");
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <h1 className="text-3xl font-bold">Test Applications Feature</h1>

      {/* Submit Application Section */}
      <div className="border rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Submit Application</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Position</label>
            <select
              value={selectedPosition}
              onChange={e => setSelectedPosition(e.target.value)}
              className="w-full border rounded p-2"
            >
              <option value="">Select a position</option>
              {positions.map(position => (
                <option key={position.id} value={position.id}>
                  {position.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Name *</label>
            <input
              type="text"
              value={newApplication.name}
              onChange={e => setNewApplication({ ...newApplication, name: e.target.value })}
              className="w-full border rounded p-2"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Email *</label>
            <input
              type="email"
              value={newApplication.email}
              onChange={e => setNewApplication({ ...newApplication, email: e.target.value })}
              className="w-full border rounded p-2"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Resume URL (optional)</label>
            <input
              type="url"
              value={newApplication.resumeUrl}
              onChange={e => setNewApplication({ ...newApplication, resumeUrl: e.target.value })}
              className="w-full border rounded p-2"
              placeholder="https://example.com/resume.pdf"
            />
          </div>

          <button onClick={submitApplication} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            Submit Application
          </button>
        </div>
      </div>

      {/* View Applications Section */}
      <div className="border rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">View Applications (Manager Only)</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Position</label>
            <select
              value={selectedPosition}
              onChange={e => {
                setSelectedPosition(e.target.value);
                if (e.target.value) {
                  fetchApplications(e.target.value);
                }
              }}
              className="w-full border rounded p-2"
            >
              <option value="">Select a position</option>
              {positions.map(position => (
                <option key={position.id} value={position.id}>
                  {position.title}
                </option>
              ))}
            </select>
          </div>

          {applications.length > 0 && (
            <div>
              <h3 className="font-medium mb-2">Applications ({applications.length})</h3>
              <div className="space-y-2">
                {applications.map(app => (
                  <div key={app.id} className="border rounded p-3">
                    <p>
                      <strong>Name:</strong> {app.name}
                    </p>
                    <p>
                      <strong>Email:</strong> {app.email}
                    </p>
                    <p>
                      <strong>Status:</strong>{" "}
                      <span
                        className={`px-2 py-1 rounded text-xs ${
                          app.status === "in_progress" ? "bg-yellow-100 text-yellow-800" : "bg-green-100 text-green-800"
                        }`}
                      >
                        {app.status}
                      </span>
                    </p>
                    <p>
                      <strong>Result:</strong>{" "}
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
                    </p>
                    {app.resumeUrl && (
                      <p>
                        <strong>Resume:</strong>{" "}
                        <a
                          href={app.resumeUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 underline"
                        >
                          View Resume
                        </a>
                      </p>
                    )}
                    <p className="text-sm text-gray-600">
                      Started: {new Date(app.startedAt).toLocaleDateString()}
                      {app.completedAt && <span> • Completed: {new Date(app.completedAt).toLocaleDateString()}</span>}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
