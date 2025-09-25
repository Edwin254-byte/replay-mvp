import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function EditPositionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const position = await prisma.position.findUnique({
    where: { id },
    include: { questions: { orderBy: { order: "asc" } } },
  });

  if (!position) {
    return <div>Position not found</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">Edit Position: {position.title}</h1>

      <div className="space-y-6">
        <div className="border rounded p-4">
          <h2 className="text-xl font-medium mb-4">Position Details</h2>
          <p>
            <strong>Title:</strong> {position.title}
          </p>
          <p>
            <strong>Description:</strong> {position.description || "No description"}
          </p>
          <p>
            <strong>Public ID:</strong> {position.publicId}
          </p>
        </div>

        <div className="border rounded p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-medium">Questions ({position.questions.length})</h2>
            <Link
              href={`/dashboard/positions/${position.id}/questions/new`}
              className="px-4 py-2 bg-slate-800 text-white rounded"
            >
              Add Question
            </Link>
          </div>

          {position.questions.length === 0 ? (
            <p className="text-slate-600">No questions added yet.</p>
          ) : (
            <ul className="space-y-2">
              {position.questions.map((question, index) => (
                <li key={question.id} className="border rounded p-3">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="font-medium">
                        #{index + 1}: {question.title}
                      </p>
                      <p className="text-sm text-slate-600 mt-1">{question.prompt}</p>
                      <p className="text-xs text-slate-500 mt-1">Type: {question.voiceType}</p>
                    </div>
                    <Link
                      href={`/dashboard/positions/${position.id}/questions/${question.id}/edit`}
                      className="text-blue-600 underline text-sm"
                    >
                      Edit
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="flex gap-4">
          <Link href="/dashboard/positions" className="px-4 py-2 border rounded">
            Back to Positions
          </Link>
        </div>
      </div>
    </div>
  );
}
