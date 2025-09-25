import Link from "next/link";

export default function Home() {
  return (
    <main className="space-y-6">
      <h1 className="text-3xl font-semibold">Replay — AI Interview (MVP)</h1>
      <p className="text-slate-600">Manager dashboard and applicant demo flow (scaffolded).</p>
      <div className="flex gap-4">
        <Link className="px-4 py-2 bg-slate-800 text-white rounded" href="/dashboard/positions">
          Manager Dashboard
        </Link>
        <Link className="px-4 py-2 bg-white border rounded" href="/public/sample">
          Applicant Demo
        </Link>
      </div>
    </main>
  );
}
