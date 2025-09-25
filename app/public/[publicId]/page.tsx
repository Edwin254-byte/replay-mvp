"use client";
import { useState, use } from "react";
import { useRouter } from "next/navigation";

export default function ApplicantInfoPage({ params }: { params: Promise<{ publicId: string }> }) {
  const { publicId } = use(params);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ publicId, name, email }),
      });

      if (response.ok) {
        const { applicationId } = await response.json();
        router.push(`/public/${publicId}/start/${applicationId}`);
      }
    } catch (error) {
      console.error("Error creating application:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-12">
      <h1 className="text-2xl font-semibold mb-6">Start Your Interview</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Full Name</label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            className="w-full border rounded p-2"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Email Address</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full border rounded p-2"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full px-4 py-2 bg-slate-800 text-white rounded disabled:opacity-50"
        >
          {loading ? "Starting..." : "Start Interview"}
        </button>
      </form>
    </div>
  );
}
