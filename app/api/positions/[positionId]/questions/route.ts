import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getToken } from "next-auth/jwt";
import { QuestionType } from "@prisma/client";

export async function POST(request: NextRequest, { params }: { params: Promise<{ positionId: string }> }) {
  try {
    // Check authentication
    const token = await getToken({ req: request });
    if (!token || token.role !== "MANAGER") {
      return NextResponse.json({ error: "Unauthorized. Manager access required." }, { status: 401 });
    }

    const { positionId } = await params;

    // Verify the position belongs to the authenticated manager
    const position = await prisma.position.findFirst({
      where: {
        id: positionId,
        userId: token.sub as string,
      },
    });

    if (!position) {
      return NextResponse.json({ error: "Position not found or access denied." }, { status: 404 });
    }

    // Parse request body
    const body = await request.json();
    const { text, type = "TEXT", options } = body;

    // Validation
    if (!text || typeof text !== "string" || text.trim().length === 0) {
      return NextResponse.json({ error: "Question text is required." }, { status: 400 });
    }

    if (!["TEXT", "MULTIPLE_CHOICE"].includes(type)) {
      return NextResponse.json({ error: "Question type must be TEXT or MULTIPLE_CHOICE." }, { status: 400 });
    }

    if (type === "MULTIPLE_CHOICE") {
      if (!options || !Array.isArray(options) || options.length < 2) {
        return NextResponse.json({ error: "Multiple choice questions require at least 2 options." }, { status: 400 });
      }

      // Validate options are strings
      if (!options.every(option => typeof option === "string" && option.trim().length > 0)) {
        return NextResponse.json({ error: "All options must be non-empty strings." }, { status: 400 });
      }
    }

    // Get the next order number
    const lastQuestion = await prisma.question.findFirst({
      where: { positionId },
      orderBy: { order: "desc" },
    });

    const nextOrder = lastQuestion ? lastQuestion.order + 1 : 1;

    // Create the question
    const question = await prisma.question.create({
      data: {
        positionId,
        text: text.trim(),
        type: type as QuestionType,
        options: type === "MULTIPLE_CHOICE" ? JSON.stringify(options) : null,
        order: nextOrder,
      },
      include: {
        position: {
          select: {
            title: true,
          },
        },
      },
    });

    // Format response
    const formattedQuestion = {
      id: question.id,
      positionId: question.positionId,
      text: question.text,
      type: question.type,
      options: question.options ? JSON.parse(question.options) : null,
      order: question.order,
      createdAt: question.createdAt,
      position: question.position,
    };

    return NextResponse.json(
      {
        success: true,
        data: formattedQuestion,
        message: "Question created successfully.",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating question:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ positionId: string }> }) {
  try {
    // Check authentication
    const token = await getToken({ req: request });
    if (!token || token.role !== "MANAGER") {
      return NextResponse.json({ error: "Unauthorized. Manager access required." }, { status: 401 });
    }

    const { positionId } = await params;

    // Verify the position belongs to the authenticated manager
    const position = await prisma.position.findFirst({
      where: {
        id: positionId,
        userId: token.sub as string,
      },
    });

    if (!position) {
      return NextResponse.json({ error: "Position not found or access denied." }, { status: 404 });
    }

    // Get all questions for the position
    const questions = await prisma.question.findMany({
      where: { positionId },
      orderBy: { order: "asc" },
      include: {
        _count: {
          select: {
            answers: true,
          },
        },
      },
    });

    // Format questions
    const formattedQuestions = questions.map(question => ({
      id: question.id,
      positionId: question.positionId,
      text: question.text,
      type: question.type,
      options: question.options ? JSON.parse(question.options) : null,
      order: question.order,
      createdAt: question.createdAt,
      answerCount: question._count.answers,
    }));

    return NextResponse.json({
      success: true,
      data: {
        questions: formattedQuestions,
        position: {
          id: position.id,
          title: position.title,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching questions:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
