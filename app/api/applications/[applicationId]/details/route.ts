import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest, { params }: { params: Promise<{ applicationId: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { applicationId } = await params;

    if (!applicationId) {
      return NextResponse.json({ error: "Application ID is required" }, { status: 400 });
    }

    // Fetch application with related data
    const application = await prisma.application.findUnique({
      where: {
        id: applicationId,
      },
      include: {
        position: {
          select: {
            title: true,
            userId: true,
            user: {
              select: {
                name: true,
              },
            },
          },
        },
        answers: {
          include: {
            question: {
              select: {
                text: true,
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

    // Check if user has access to this application
    const userId = session.user.id;
    if (application.position.userId !== userId) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Format the response data
    const formattedApplication = {
      id: application.id,
      applicant: {
        name: application.name,
        email: application.email,
      },
      position: {
        title: application.position.title,
        company: application.position.user.name,
      },
      startedAt: application.startedAt.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
      endedAt: application.completedAt
        ? application.completedAt.toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })
        : null,
      status: application.overallResult || "PENDING",
      progress: application.completedAt ? "Completed" : "In Progress",
      responses: application.answers.map(answer => ({
        id: answer.id,
        questionText: answer.question.text,
        response: answer.response,
        createdAt: answer.createdAt.toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
      })),
      totalQuestions: await prisma.question.count({
        where: {
          positionId: application.positionId,
          createdAt: {
            lte: application.startedAt, // Only count questions that existed when application started
          },
        },
      }),
      completedQuestions: application.answers.length,
    };

    return NextResponse.json({
      success: true,
      data: formattedApplication,
    });
  } catch (error) {
    console.error("Error fetching application details:", error);
    return NextResponse.json({ error: "Failed to fetch application details" }, { status: 500 });
  }
}
