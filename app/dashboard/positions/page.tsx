import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function PositionsPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "MANAGER") {
    redirect("/auth/signin");
  }

  const positions = await prisma.position.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: {
          applications: true,
          questions: true,
        },
      },
    },
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Positions</h2>
        <Link href="/dashboard/positions/new" className="px-4 py-2 bg-slate-800 text-white rounded">
          New Position
        </Link>
      </div>

      {positions.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-slate-600 mb-4">No positions created yet.</p>
          <Link href="/dashboard/positions/new" className="px-4 py-2 bg-slate-800 text-white rounded">
            Create Your First Position
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {positions.map(p => (
            <div key={p.id} className="border rounded-lg p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="text-lg font-semibold">{p.title}</h3>
                  <p className="text-slate-600 text-sm">{p.description}</p>
                </div>
                <Link
                  href={`/dashboard/positions/${p.id}`}
                  className="px-3 py-1 bg-blue-600 text-white rounded text-sm"
                >
                  Manage
                </Link>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
                <div>
                  <span className="text-slate-600">Applications:</span>
                  <span className="ml-1 font-semibold">{p._count.applications}</span>
                </div>
                <div>
                  <span className="text-slate-600">Questions:</span>
                  <span className="ml-1 font-semibold">{p._count.questions}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
