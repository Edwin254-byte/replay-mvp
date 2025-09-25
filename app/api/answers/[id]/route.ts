import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getToken } from "next-auth/jwt";

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Check authentication
    const token = await getToken({ req: request });
    if (!token) {
      return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    }

    const { id } = await params;

    // Find the answer and verify access
    const existingAnswer = await prisma.answer.findUnique({
      where: { id },
      include: {
        application: {
          select: {
            id: true,
            email: true,
            status: true,
            position: {
              select: {
                id: true,
                title: true,
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
            options: true,
            order: true,
          },
        },
      },
    });

    if (!existingAnswer) {
      return NextResponse.json({ error: "Answer not found." }, { status: 404 });
    }

    // Verify access based on role
    if (token.role === "APPLICANT") {
      if (existingAnswer.application.email !== token.email) {
        return NextResponse.json({ error: "Access denied. You can only update your own answers." }, { status: 403 });
      }
    } else if (token.role === "MANAGER") {
      if (existingAnswer.application.position.userId !== token.sub) {
        return NextResponse.json({ error: "Access denied to this answer." }, { status: 403 });
      }
    }

    // Check if application is still in progress (only applicants have this restriction)
    if (token.role === "APPLICANT" && existingAnswer.application.status !== "in_progress") {
      return NextResponse.json({ error: "Cannot update answers for completed applications." }, { status: 400 });
    }

    // Parse request body
    const body = await request.json();
    const { response } = body;

    // Validation
    if (!response || typeof response !== "string" || response.trim().length === 0) {
      return NextResponse.json({ error: "Response is required and must be a non-empty string." }, { status: 400 });
    }

    // For MULTIPLE_CHOICE questions, validate the response
    if (existingAnswer.question.type === "MULTIPLE_CHOICE" && existingAnswer.question.options) {
      const validOptions = JSON.parse(existingAnswer.question.options);
      if (!validOptions.includes(response.trim())) {
        return NextResponse.json({ error: "Response must be one of the provided options." }, { status: 400 });
      }
    }

    // Update the answer
    const updatedAnswer = await prisma.answer.update({
      where: { id },
      data: {
        response: response.trim(),
        endedAt: new Date(), // Update the timestamp
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
        application: {
          select: {
            id: true,
            name: true,
            email: true,
            status: true,
            position: {
              select: {
                id: true,
                title: true,
              },
            },
          },
        },
      },
    });

    // Format response
    const formattedAnswer = {
      id: updatedAnswer.id,
      applicationId: updatedAnswer.applicationId,
      questionId: updatedAnswer.questionId,
      response: updatedAnswer.response,
      startedAt: updatedAnswer.startedAt,
      endedAt: updatedAnswer.endedAt,
      result: updatedAnswer.result,
      createdAt: updatedAnswer.createdAt,
      updatedAt: updatedAnswer.updatedAt,
      question: {
        ...updatedAnswer.question,
        options: updatedAnswer.question.options ? JSON.parse(updatedAnswer.question.options) : null,
      },
      application: updatedAnswer.application,
    };

    return NextResponse.json({
      success: true,
      data: formattedAnswer,
      message: "Answer updated successfully.",
    });
  } catch (error) {
    console.error("Error updating answer:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Check authentication
    const token = await getToken({ req: request });
    if (!token) {
      return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    }

    const { id } = await params;

    // Find the answer and verify access
    const answer = await prisma.answer.findUnique({
      where: { id },
      include: {
        application: {
          select: {
            id: true,
            name: true,
            email: true,
            status: true,
            position: {
              select: {
                id: true,
                title: true,
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
            options: true,
            order: true,
          },
        },
      },
    });

    if (!answer) {
      return NextResponse.json({ error: "Answer not found." }, { status: 404 });
    }

    // Verify access based on role
    if (token.role === "APPLICANT") {
      if (answer.application.email !== token.email) {
        return NextResponse.json({ error: "Access denied. You can only view your own answers." }, { status: 403 });
      }
    } else if (token.role === "MANAGER") {
      if (answer.application.position.userId !== token.sub) {
        return NextResponse.json({ error: "Access denied to this answer." }, { status: 403 });
      }
    }

    // Format response
    const formattedAnswer = {
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
      application: answer.application,
    };

    return NextResponse.json({
      success: true,
      data: formattedAnswer,
    });
  } catch (error) {
    console.error("Error fetching answer:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Check authentication
    const token = await getToken({ req: request });
    if (!token) {
      return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    }

    const { id } = await params;

    // Find the answer and verify access
    const answer = await prisma.answer.findUnique({
      where: { id },
      include: {
        application: {
          select: {
            id: true,
            email: true,
            status: true,
            position: {
              select: {
                userId: true,
              },
            },
          },
        },
      },
    });

    if (!answer) {
      return NextResponse.json({ error: "Answer not found." }, { status: 404 });
    }

    // Verify access based on role
    if (token.role === "APPLICANT") {
      if (answer.application.email !== token.email) {
        return NextResponse.json({ error: "Access denied. You can only delete your own answers." }, { status: 403 });
      }

      // Check if application is still in progress
      if (answer.application.status !== "in_progress") {
        return NextResponse.json({ error: "Cannot delete answers for completed applications." }, { status: 400 });
      }
    } else if (token.role === "MANAGER") {
      if (answer.application.position.userId !== token.sub) {
        return NextResponse.json({ error: "Access denied to this answer." }, { status: 403 });
      }
    }

    // Delete the answer
    await prisma.answer.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Answer deleted successfully.",
      data: {
        deletedAnswerId: id,
      },
    });
  } catch (error) {
    console.error("Error deleting answer:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
