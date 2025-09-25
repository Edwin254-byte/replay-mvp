import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";

const prisma = new PrismaClient();

// Schema for creating a hiring answer
const createAnswerSchema = z.object({
  response: z.string().min(1, "Response is required"),
  applicationId: z.string().min(1, "Application ID is required"),
  questionId: z.string().min(1, "Question ID is required"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = createAnswerSchema.parse(body);

    // Verify the application exists
    const application = await prisma.jobApplication.findUnique({
      where: {
        id: validatedData.applicationId,
      },
      include: {
        position: true,
      },
    });

    if (!application) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    // Verify the question exists and belongs to the same position
    const question = await prisma.hiringQuestion.findUnique({
      where: {
        id: validatedData.questionId,
      },
    });

    if (!question || question.positionId !== application.positionId) {
      return NextResponse.json({ error: "Question not found or does not belong to this position" }, { status: 404 });
    }

    // Check if answer already exists (prevent duplicates)
    const existingAnswer = await prisma.hiringAnswer.findFirst({
      where: {
        applicationId: validatedData.applicationId,
        questionId: validatedData.questionId,
      },
    });

    if (existingAnswer) {
      // Update existing answer
      const updatedAnswer = await prisma.hiringAnswer.update({
        where: {
          id: existingAnswer.id,
        },
        data: {
          response: validatedData.response,
        },
        include: {
          question: {
            select: {
              text: true,
              type: true,
            },
          },
        },
      });

      return NextResponse.json(updatedAnswer);
    }

    // Create new answer
    const answer = await prisma.hiringAnswer.create({
      data: {
        response: validatedData.response,
        applicationId: validatedData.applicationId,
        questionId: validatedData.questionId,
      },
      include: {
        question: {
          select: {
            text: true,
            type: true,
          },
        },
      },
    });

    return NextResponse.json(answer, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation failed" }, { status: 400 });
    }

    console.error("Error creating hiring answer:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const applicationId = searchParams.get("applicationId");

    if (!applicationId) {
      return NextResponse.json({ error: "Application ID is required" }, { status: 400 });
    }

    // Verify the application exists
    const application = await prisma.jobApplication.findUnique({
      where: {
        id: applicationId,
      },
    });

    if (!application) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    // Get all answers for the application
    const answers = await prisma.hiringAnswer.findMany({
      where: {
        applicationId: applicationId,
      },
      include: {
        question: {
          select: {
            text: true,
            type: true,
          },
        },
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    return NextResponse.json(answers);
  } catch (error) {
    console.error("Error fetching hiring answers:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
