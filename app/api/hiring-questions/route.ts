import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getToken } from "next-auth/jwt";
import { z } from "zod";

// Schema for creating a hiring question
const createQuestionSchema = z.object({
  text: z.string().min(5, "Question text must be at least 5 characters"),
  type: z.enum(["TEXT", "MULTIPLE_CHOICE"]).default("TEXT"),
  positionId: z.string().min(1, "Position ID is required"),
});

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const token = await getToken({ req: request });
    if (!token || token.role !== "MANAGER") {
      return NextResponse.json({ error: "Unauthorized. Manager access required." }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = createQuestionSchema.parse(body);

    // Verify the position belongs to the authenticated manager
    const position = await prisma.position.findFirst({
      where: {
        id: validatedData.positionId,
        userId: token.sub,
      },
    });

    if (!position) {
      return NextResponse.json({ error: "Position not found or access denied" }, { status: 404 });
    }

    // Create the hiring question
    const question = await prisma.hiringQuestion.create({
      data: {
        text: validatedData.text,
        type: validatedData.type,
        positionId: validatedData.positionId,
      },
      include: {
        position: {
          select: {
            title: true,
          },
        },
      },
    });

    return NextResponse.json(question, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation failed", details: error.issues }, { status: 400 });
    }

    console.error("Error creating hiring question:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const token = await getToken({ req: request });
    if (!token || token.role !== "MANAGER") {
      return NextResponse.json({ error: "Unauthorized. Manager access required." }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const positionId = searchParams.get("positionId");

    if (!positionId) {
      return NextResponse.json({ error: "Position ID is required" }, { status: 400 });
    }

    // Verify the position belongs to the authenticated manager
    const position = await prisma.position.findFirst({
      where: {
        id: positionId,
        userId: token.sub,
      },
    });

    if (!position) {
      return NextResponse.json({ error: "Position not found or access denied" }, { status: 404 });
    }

    // Get all hiring questions for the position
    const questions = await prisma.hiringQuestion.findMany({
      where: {
        positionId: positionId,
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
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(questions);
  } catch (error) {
    console.error("Error fetching hiring questions:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
