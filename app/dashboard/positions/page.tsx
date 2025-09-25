import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function PositionsPage() {
  const positions = await prisma.position.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Positions</h2>
      <Link href="/dashboard/positions/new" className="px-4 py-2 bg-slate-800 text-white rounded">
        New Position
      </Link>
      <ul className="mt-6 space-y-2">
        {positions.map(p => (
          <li key={p.id} className="border rounded p-2 flex justify-between">
            <span>{p.title}</span>
            <div className="space-x-2">
              <Link href={`/dashboard/positions/${p.id}`} className="underline">
                Edit
              </Link>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
