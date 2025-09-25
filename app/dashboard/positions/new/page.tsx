"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewPositionPage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/positions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description }),
      });

      if (response.ok) {
        router.push("/dashboard/positions");
      } else {
        const errorData = await response.json();
        console.error("Error creating position:", errorData.error);
      }
    } catch (error) {
      console.error("Error creating position:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-semibold mb-6">Create New Position</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Position Title</label>
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="w-full border rounded p-2"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            className="w-full border rounded p-2 h-32"
            rows={4}
            placeholder="Describe the position requirements, responsibilities, and qualifications..."
          />
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading || !title.trim()}
            className="px-4 py-2 bg-slate-800 text-white rounded disabled:opacity-50"
          >
            {loading ? "Creating..." : "Create Position"}
          </button>
          <button type="button" onClick={() => router.back()} className="px-4 py-2 border rounded">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
