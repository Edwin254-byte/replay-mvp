import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface Params {
  applicationId: string;
}

export async function GET(request: NextRequest, { params }: { params: Promise<Params> }) {
  try {
    const { applicationId } = await params;

    // Get application with answers and questions
    const application = await prisma.jobApplication.findUnique({
      where: {
        id: applicationId,
      },
      include: {
        position: {
          select: {
            title: true,
            description: true,
          },
        },
        hiringAnswers: {
          include: {
            question: {
              select: {
                id: true,
                text: true,
                type: true,
              },
            },
          },
          orderBy: {
            createdAt: "asc",
          },
        },
      },
    });

    if (!application) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    // Get all questions for the position (to show unanswered questions)
    const allQuestions = await prisma.hiringQuestion.findMany({
      where: {
        positionId: application.positionId,
      },
      select: {
        id: true,
        text: true,
        type: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    // Combine data
    const result = {
      ...application,
      allQuestions,
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching application with answers:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
