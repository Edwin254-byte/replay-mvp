import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getToken } from "next-auth/jwt";

export async function POST(request: NextRequest, { params }: { params: Promise<{ applicationId: string }> }) {
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
          },
        },
      },
    });

    if (!application) {
      return NextResponse.json({ error: "Application not found." }, { status: 404 });
    }

    // Verify applicant owns this application
    if (token.role === "APPLICANT" && application.email !== token.email) {
      return NextResponse.json(
        { error: "Access denied. You can only answer questions for your own applications." },
        { status: 403 }
      );
    }

    // Check if application is still in progress
    if (application.status !== "in_progress") {
      return NextResponse.json({ error: "Cannot answer questions for completed applications." }, { status: 400 });
    }

    // Parse request body
    const body = await request.json();
    const { questionId, response } = body;

    // Validation
    if (!questionId || typeof questionId !== "string") {
      return NextResponse.json({ error: "questionId is required and must be a string." }, { status: 400 });
    }

    if (!response || typeof response !== "string" || response.trim().length === 0) {
      return NextResponse.json({ error: "Response is required and must be a non-empty string." }, { status: 400 });
    }

    // Verify the question belongs to the application's position
    const question = await prisma.question.findFirst({
      where: {
        id: questionId,
        positionId: application.positionId,
      },
    });

    if (!question) {
      return NextResponse.json({ error: "Question not found or does not belong to this position." }, { status: 404 });
    }

    // For MULTIPLE_CHOICE questions, validate the response
    if (question.type === "MULTIPLE_CHOICE" && question.options) {
      const validOptions = JSON.parse(question.options);
      if (!validOptions.includes(response.trim())) {
        return NextResponse.json({ error: "Response must be one of the provided options." }, { status: 400 });
      }
    }

    // Check if answer already exists
    const existingAnswer = await prisma.answer.findFirst({
      where: {
        applicationId,
        questionId,
      },
    });

    if (existingAnswer) {
      return NextResponse.json(
        { error: "Answer already exists for this question. Use PUT to update." },
        { status: 409 }
      );
    }

    // Create the answer
    const answer = await prisma.answer.create({
      data: {
        applicationId,
        questionId,
        response: response.trim(),
        startedAt: new Date(),
        endedAt: new Date(),
      },
      include: {
        question: {
          select: {
            id: true,
            text: true,
            type: true,
            options: true,
            order: true,
          },
        },
      },
    });

    // Format question options for response
    const formattedQuestion = {
      ...answer.question,
      options: answer.question.options ? JSON.parse(answer.question.options) : null,
    };

    return NextResponse.json(
      {
        success: true,
        data: {
          id: answer.id,
          applicationId: answer.applicationId,
          questionId: answer.questionId,
          response: answer.response,
          startedAt: answer.startedAt,
          endedAt: answer.endedAt,
          createdAt: answer.createdAt,
          updatedAt: answer.updatedAt,
          question: formattedQuestion,
        },
        message: "Answer submitted successfully.",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error submitting answer:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

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
            userId: true,
          },
        },
      },
    });

    if (!application) {
      return NextResponse.json({ error: "Application not found." }, { status: 404 });
    }

    // Verify access based on role
    if (token.role === "APPLICANT") {
      if (application.email !== token.email) {
        return NextResponse.json({ error: "Access denied. You can only view your own answers." }, { status: 403 });
      }
    } else if (token.role === "MANAGER") {
      if (application.position.userId !== token.sub) {
        return NextResponse.json({ error: "Access denied to this application's answers." }, { status: 403 });
      }
    }

    // Get all answers for this application
    const answers = await prisma.answer.findMany({
      where: { applicationId },
      include: {
        question: {
          select: {
            id: true,
            text: true,
            type: true,
            options: true,
            order: true,
          },
        },
      },
      orderBy: {
        question: {
          order: "asc",
        },
      },
    });

    // Format answers with question details
    const formattedAnswers = answers.map(answer => ({
      id: answer.id,
      applicationId: answer.applicationId,
      questionId: answer.questionId,
      response: answer.response,
      startedAt: answer.startedAt,
      endedAt: answer.endedAt,
      result: answer.result,
      createdAt: answer.createdAt,
      updatedAt: answer.updatedAt,
      question: {
        ...answer.question,
        options: answer.question.options ? JSON.parse(answer.question.options) : null,
      },
    }));

    return NextResponse.json({
      success: true,
      data: {
        application: {
          id: application.id,
          name: application.name,
          email: application.email,
          status: application.status,
          position: {
            id: application.position.id,
            title: application.position.title,
          },
        },
        answers: formattedAnswers,
        totalAnswers: formattedAnswers.length,
      },
    });
  } catch (error) {
    console.error("Error fetching answers:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
