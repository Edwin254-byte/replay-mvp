import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getToken } from "next-auth/jwt";

export async function GET(request: NextRequest, { params }: { params: Promise<{ applicationId: string }> }) {
  try {
    // Check authentication
    const token = await getToken({ req: request });
    if (!token) {
      return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    }

    const { applicationId } = await params;

    // Find the application and verify access
    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        position: {
          select: {
            id: true,
            title: true,
            description: true,
          },
        },
      },
    });

    if (!application) {
      return NextResponse.json({ error: "Application not found." }, { status: 404 });
    }

    // For applicants, verify they own the application
    // For managers, verify they own the position
    if (token.role === "APPLICANT") {
      if (application.email !== token.email) {
        return NextResponse.json({ error: "Access denied. You can only view your own applications." }, { status: 403 });
      }
    } else if (token.role === "MANAGER") {
      const position = await prisma.position.findFirst({
        where: {
          id: application.positionId,
          userId: token.sub as string,
        },
      });

      if (!position) {
        return NextResponse.json({ error: "Access denied to this application." }, { status: 403 });
      }
    }

    // Get all questions for the position linked to this application
    const questions = await prisma.question.findMany({
      where: { positionId: application.positionId },
      orderBy: { order: "asc" },
    });

    // Get existing answers for this application
    const existingAnswers = await prisma.answer.findMany({
      where: { applicationId },
      select: {
        id: true,
        questionId: true,
        response: true,
        startedAt: true,
        endedAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // Create a map of questionId -> answer for quick lookup
    const answersMap = new Map(existingAnswers.map(answer => [answer.questionId, answer]));

    // Format questions with their answers (if any)
    const questionsWithAnswers = questions.map(question => {
      const existingAnswer = answersMap.get(question.id);

      return {
        id: question.id,
        text: question.text,
        type: question.type,
        options: question.options ? JSON.parse(question.options) : null,
        order: question.order,
        answer: existingAnswer
          ? {
              id: existingAnswer.id,
              response: existingAnswer.response,
              startedAt: existingAnswer.startedAt,
              endedAt: existingAnswer.endedAt,
              createdAt: existingAnswer.createdAt,
              updatedAt: existingAnswer.updatedAt,
            }
          : null,
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        application: {
          id: application.id,
          name: application.name,
          email: application.email,
          status: application.status,
          position: application.position,
        },
        questions: questionsWithAnswers,
        totalQuestions: questions.length,
        answeredQuestions: existingAnswers.length,
        progress: questions.length > 0 ? Math.round((existingAnswers.length / questions.length) * 100) : 0,
      },
    });
  } catch (error) {
    console.error("Error fetching application questions:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
