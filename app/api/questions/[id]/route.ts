import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getToken } from "next-auth/jwt";
import { QuestionType } from "@prisma/client";

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Check authentication
    const token = await getToken({ req: request });
    if (!token || token.role !== "MANAGER") {
      return NextResponse.json({ error: "Manager access required." }, { status: 403 });
    }

    const { id } = await params;

    // Find the question and verify ownership
    const existingQuestion = await prisma.question.findFirst({
      where: {
        id,
        position: {
          userId: token.sub as string,
        },
      },
      include: {
        position: {
          select: {
            title: true,
            userId: true,
          },
        },
      },
    });

    if (!existingQuestion) {
      return NextResponse.json({ error: "Question not found or access denied." }, { status: 404 });
    }

    // Parse request body
    const body = await request.json();
    const { text, type, options } = body;

    // Build update data
    const updateData: {
      text?: string;
      type?: QuestionType;
      options?: string | null;
    } = {};

    if (text !== undefined) {
      if (typeof text !== "string" || text.trim().length === 0) {
        return NextResponse.json({ error: "Question text must be a non-empty string." }, { status: 400 });
      }
      updateData.text = text.trim();
    }

    if (type !== undefined) {
      if (!["TEXT", "MULTIPLE_CHOICE"].includes(type)) {
        return NextResponse.json({ error: "Question type must be TEXT or MULTIPLE_CHOICE." }, { status: 400 });
      }
      updateData.type = type as QuestionType;
    }

    // Handle options for MULTIPLE_CHOICE questions
    const finalType = type || existingQuestion.type;
    if (finalType === "MULTIPLE_CHOICE") {
      if (options !== undefined) {
        if (!Array.isArray(options) || options.length < 2) {
          return NextResponse.json({ error: "Multiple choice questions require at least 2 options." }, { status: 400 });
        }

        if (!options.every(option => typeof option === "string" && option.trim().length > 0)) {
          return NextResponse.json({ error: "All options must be non-empty strings." }, { status: 400 });
        }

        updateData.options = JSON.stringify(options);
      }
    } else {
      // For TEXT questions, clear options
      updateData.options = null;
    }

    // Update the question
    const updatedQuestion = await prisma.question.update({
      where: { id },
      data: updateData,
      include: {
        position: {
          select: {
            title: true,
          },
        },
        _count: {
          select: {
            answers: true,
          },
        },
      },
    });

    // Format response
    const formattedQuestion = {
      id: updatedQuestion.id,
      positionId: updatedQuestion.positionId,
      text: updatedQuestion.text,
      type: updatedQuestion.type,
      options: updatedQuestion.options ? JSON.parse(updatedQuestion.options) : null,
      order: updatedQuestion.order,
      voiceType: updatedQuestion.voiceType,
      aiVideoUrl: updatedQuestion.aiVideoUrl,
      uploadedMeta: updatedQuestion.uploadedMeta,
      createdAt: updatedQuestion.createdAt,
      position: updatedQuestion.position,
      answerCount: updatedQuestion._count.answers,
    };

    return NextResponse.json({
      success: true,
      data: formattedQuestion,
      message: "Question updated successfully.",
    });
  } catch (error) {
    console.error("Error updating question:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Check authentication
    const token = await getToken({ req: request });
    if (!token || token.role !== "MANAGER") {
      return NextResponse.json({ error: "Manager access required." }, { status: 403 });
    }

    const { id } = await params;

    // Find the question and verify ownership
    const question = await prisma.question.findFirst({
      where: {
        id,
        position: {
          userId: token.sub as string,
        },
      },
      include: {
        position: {
          select: {
            title: true,
          },
        },
        _count: {
          select: {
            answers: true,
          },
        },
      },
    });

    if (!question) {
      return NextResponse.json({ error: "Question not found or access denied." }, { status: 404 });
    }

    // Format response
    const formattedQuestion = {
      id: question.id,
      positionId: question.positionId,
      text: question.text,
      type: question.type,
      options: question.options ? JSON.parse(question.options) : null,
      order: question.order,
      voiceType: question.voiceType,
      aiVideoUrl: question.aiVideoUrl,
      uploadedMeta: question.uploadedMeta,
      createdAt: question.createdAt,
      position: question.position,
      answerCount: question._count.answers,
    };

    return NextResponse.json({
      success: true,
      data: formattedQuestion,
    });
  } catch (error) {
    console.error("Error fetching question:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Check authentication
    const token = await getToken({ req: request });
    if (!token || token.role !== "MANAGER") {
      return NextResponse.json({ error: "Manager access required." }, { status: 403 });
    }

    const { id } = await params;

    // Find the question and verify ownership
    const question = await prisma.question.findFirst({
      where: {
        id,
        position: {
          userId: token.sub as string,
        },
      },
      include: {
        _count: {
          select: {
            answers: true,
          },
        },
      },
    });

    if (!question) {
      return NextResponse.json({ error: "Question not found or access denied." }, { status: 404 });
    }

    // Delete the question (answers will be cascade deleted)
    const deletedAnswersCount = question._count.answers;
    await prisma.question.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: `Question deleted successfully. ${deletedAnswersCount} associated answers were also removed.`,
      data: {
        deletedQuestionId: id,
        deletedAnswersCount,
      },
    });
  } catch (error) {
    console.error("Error deleting question:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
