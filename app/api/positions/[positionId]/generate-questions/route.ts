/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getToken } from "next-auth/jwt";
import { aiInterviewer } from "@/lib/ai-interviewer";
import { QuestionSource, QuestionType } from "@prisma/client";

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

    // Parse request body for options
    const body = await request.json();
    const {
      questionCount = 5,
      difficulty = "mid",
      categories = ["technical", "behavioral", "problem-solving"],
      replaceExisting = false,
    } = body;

    // Generate AI questions
    let aiQuestions;
    let isUsingFallback = false;
    let fallbackReason = "";

    try {
      aiQuestions = await aiInterviewer.generateQuestions({
        title: position.title,
        description: position.description || undefined,
        questionCount,
        difficulty,
        categories,
      });
    } catch (aiError: any) {
      // If AI fails, use fallback questions
      console.log("AI generation failed, using fallback questions:", aiError.message);
      isUsingFallback = true;
      fallbackReason = aiError.message;

      // Get fallback questions from the service
      aiQuestions = aiInterviewer.getFallbackQuestions(position.title).slice(0, questionCount);
    }

    if (aiQuestions.length === 0) {
      return NextResponse.json({ error: "Failed to generate questions" }, { status: 500 });
    }

    // Get the next order number
    const lastQuestion = await prisma.question.findFirst({
      where: { positionId },
      orderBy: { order: "desc" },
    });

    let nextOrder = lastQuestion ? lastQuestion.order + 1 : 1;

    // If replaceExisting is true, remove existing AI-generated questions
    if (replaceExisting) {
      await prisma.question.deleteMany({
        where: {
          positionId,
          source: QuestionSource.AI_GENERATED,
        },
      });

      // Recalculate order
      const remainingQuestions = await prisma.question.count({
        where: { positionId },
      });
      nextOrder = remainingQuestions + 1;
    }

    // Create AI questions in database
    const createdQuestions = [];
    const aiPrompt = isUsingFallback
      ? `Fallback questions for ${position.title} position (AI service was busy)`
      : `Generated for ${position.title} position with ${difficulty} difficulty level`;

    for (let i = 0; i < aiQuestions.length; i++) {
      const question = aiQuestions[i];

      const createdQuestion = await prisma.question.create({
        data: {
          positionId,
          title: question.title,
          text: question.text,
          type: QuestionType.TEXT,
          source: isUsingFallback ? QuestionSource.MANUAL : QuestionSource.AI_GENERATED,
          aiPrompt,
          generatedAt: new Date(),
          order: nextOrder + i,
        },
        include: {
          position: {
            select: {
              title: true,
            },
          },
        },
      });

      createdQuestions.push(createdQuestion);
    }

    const successMessage = isUsingFallback
      ? `Generated ${createdQuestions.length} professional questions! (AI service was temporarily busy, so we used our expertly crafted templates)`
      : `Successfully generated ${createdQuestions.length} AI questions!`;

    return NextResponse.json(
      {
        success: true,
        data: {
          questions: createdQuestions,
          count: createdQuestions.length,
          replaceExisting,
          isUsingFallback,
          fallbackReason: isUsingFallback ? fallbackReason : undefined,
        },
        message: successMessage,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error generating AI questions:", error);

    // Check if it's an API key issue
    if (error instanceof Error && error.message.includes("API")) {
      return NextResponse.json(
        {
          error: "AI service temporarily unavailable. Please try again later.",
        },
        { status: 503 }
      );
    }

    return NextResponse.json({ error: "Failed to generate AI questions" }, { status: 500 });
  }
}
