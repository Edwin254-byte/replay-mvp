import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getToken } from "next-auth/jwt";

export async function GET(request: NextRequest, { params }: { params: Promise<{ applicationId: string }> }) {
  try {
    // Check authentication
    const token = await getToken({ req: request });
    if (!token || token.role !== "MANAGER") {
      return NextResponse.json({ error: "Manager access required." }, { status: 403 });
    }

    const { applicationId } = await params;

    // Find the application and verify manager has access
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
        answers: {
          include: {
            question: {
              select: {
                id: true,
                text: true,
                type: true,
                weight: true,
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
        },
      },
    });

    if (!application) {
      return NextResponse.json({ error: "Application not found." }, { status: 404 });
    }

    // Verify the manager owns the position
    if (application.position.userId !== token.sub) {
      return NextResponse.json(
        { error: "Access denied. You can only view evaluations for your positions." },
        { status: 403 }
      );
    }

    // Calculate scoring summary
    let totalWeightedScore = 0;
    let maxPossibleScore = 0;
    let scoredAnswersCount = 0;

    const answersWithScoring = application.answers.map(answer => {
      const weight = answer.question.weight;
      maxPossibleScore += 100 * weight; // Max score per question is 100

      let weightedScore = 0;
      if (answer.score !== null) {
        weightedScore = answer.score * weight;
        totalWeightedScore += weightedScore;
        scoredAnswersCount++;
      }

      return {
        id: answer.id,
        response: answer.response,
        score: answer.score,
        weightedScore: answer.score !== null ? weightedScore : null,
        recordedMeta: answer.recordedMeta ? JSON.parse(answer.recordedMeta) : null,
        recordedUrl: answer.recordedUrl,
        startedAt: answer.startedAt,
        endedAt: answer.endedAt,
        createdAt: answer.createdAt,
        updatedAt: answer.updatedAt,
        question: {
          id: answer.question.id,
          text: answer.question.text,
          type: answer.question.type,
          weight: answer.question.weight,
          options: answer.question.options ? JSON.parse(answer.question.options) : null,
          order: answer.question.order,
        },
      };
    });

    // Calculate percentage if scores exist
    const scorePercentage =
      maxPossibleScore > 0 && application.totalScore !== null
        ? (application.totalScore / maxPossibleScore) * 100
        : null;

    return NextResponse.json({
      success: true,
      data: {
        application: {
          id: application.id,
          name: application.name,
          email: application.email,
          resumeUrl: application.resumeUrl,
          status: application.status,
          totalScore: application.totalScore,
          evaluationStatus: application.evaluationStatus,
          overallResult: application.overallResult,
          startedAt: application.startedAt,
          completedAt: application.completedAt,
          position: {
            id: application.position.id,
            title: application.position.title,
          },
        },
        evaluation: {
          totalScore: application.totalScore || totalWeightedScore,
          maxPossibleScore,
          scorePercentage: scorePercentage !== null ? Math.round(scorePercentage * 100) / 100 : null,
          threshold: 70,
          isPassed: application.evaluationStatus === "PASSED",
          isFailed: application.evaluationStatus === "FAILED",
          isComplete: application.evaluationStatus === "PASSED" || application.evaluationStatus === "FAILED",
          progress: {
            totalAnswers: application.answers.length,
            scoredAnswers: scoredAnswersCount,
            unscoredAnswers: application.answers.length - scoredAnswersCount,
            completionPercentage:
              application.answers.length > 0 ? Math.round((scoredAnswersCount / application.answers.length) * 100) : 0,
          },
        },
        answers: answersWithScoring,
      },
    });
  } catch (error) {
    console.error("Error fetching application evaluation:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
