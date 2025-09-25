"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewPositionPage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [introText, setIntroText] = useState("");
  const [farewellText, setFarewellText] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/positions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description, introText, farewellText }),
      });

      if (response.ok) {
        router.push("/dashboard/positions");
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
            className="w-full border rounded p-2 h-24"
            rows={3}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Intro Text (shown to applicants)</label>
          <textarea
            value={introText}
            onChange={e => setIntroText(e.target.value)}
            className="w-full border rounded p-2 h-24"
            rows={3}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Farewell Text (shown after completion)</label>
          <textarea
            value={farewellText}
            onChange={e => setFarewellText(e.target.value)}
            className="w-full border rounded p-2 h-24"
            rows={3}
          />
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading}
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
