import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getToken } from "next-auth/jwt";

export async function POST(request: NextRequest, { params }: { params: Promise<{ answerId: string }> }) {
  try {
    // Check authentication
    const token = await getToken({ req: request });
    if (!token || token.role !== "MANAGER") {
      return NextResponse.json({ error: "Manager access required." }, { status: 403 });
    }

    const { answerId } = await params;

    // Parse request body
    const body = await request.json();
    const { score } = body;

    // Validation
    if (typeof score !== "number" || score < 0) {
      return NextResponse.json({ error: "Score must be a non-negative number." }, { status: 400 });
    }

    // Find the answer and verify manager has access to it
    const answer = await prisma.answer.findUnique({
      where: { id: answerId },
      include: {
        application: {
          include: {
            position: {
              select: {
                userId: true,
              },
            },
          },
        },
        question: {
          select: {
            id: true,
            text: true,
            type: true,
            weight: true,
          },
        },
      },
    });

    if (!answer) {
      return NextResponse.json({ error: "Answer not found." }, { status: 404 });
    }

    // Verify the manager owns the position
    if (answer.application.position.userId !== token.sub) {
      return NextResponse.json(
        { error: "Access denied. You can only score answers for your positions." },
        { status: 403 }
      );
    }

    // Update the answer with the score
    const updatedAnswer = await prisma.answer.update({
      where: { id: answerId },
      data: { score },
      include: {
        question: {
          select: {
            id: true,
            text: true,
            type: true,
            weight: true,
          },
        },
        application: {
          select: {
            id: true,
            name: true,
            email: true,
            evaluationStatus: true,
          },
        },
      },
    });

    // Update application evaluation status to IN_REVIEW if it was PENDING
    if (answer.application.evaluationStatus === "PENDING") {
      await prisma.application.update({
        where: { id: answer.applicationId },
        data: { evaluationStatus: "IN_REVIEW" },
      });
    }

    return NextResponse.json({
      success: true,
      message: "Answer scored successfully.",
      data: {
        id: updatedAnswer.id,
        score: updatedAnswer.score,
        question: updatedAnswer.question,
        application: updatedAnswer.application,
      },
    });
  } catch (error) {
    console.error("Error scoring answer:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
