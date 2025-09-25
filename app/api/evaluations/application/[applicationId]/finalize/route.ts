import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getToken } from "next-auth/jwt";

export async function POST(request: NextRequest, { params }: { params: Promise<{ applicationId: string }> }) {
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
            userId: true,
            title: true,
          },
        },
        answers: {
          include: {
            question: {
              select: {
                id: true,
                text: true,
                weight: true,
              },
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
        { error: "Access denied. You can only finalize applications for your positions." },
        { status: 403 }
      );
    }

    // Calculate total score and max possible score
    let totalScore = 0;
    let maxPossibleScore = 0;
    let scoredAnswersCount = 0;

    for (const answer of application.answers) {
      const weight = answer.question.weight;
      maxPossibleScore += 100 * weight; // Assuming max score per question is 100

      if (answer.score !== null) {
        totalScore += answer.score * weight;
        scoredAnswersCount++;
      }
    }

    // Check if all answers have been scored
    if (scoredAnswersCount !== application.answers.length) {
      return NextResponse.json(
        {
          error: `Cannot finalize evaluation. ${application.answers.length - scoredAnswersCount} answers still need to be scored.`,
          data: {
            totalAnswers: application.answers.length,
            scoredAnswers: scoredAnswersCount,
            unscoredAnswers: application.answers.length - scoredAnswersCount,
          },
        },
        { status: 400 }
      );
    }

    // Determine pass/fail status (70% threshold)
    const scorePercentage = maxPossibleScore > 0 ? (totalScore / maxPossibleScore) * 100 : 0;
    const evaluationStatus = scorePercentage >= 70 ? "PASSED" : "FAILED";

    // Update the application
    const updatedApplication = await prisma.application.update({
      where: { id: applicationId },
      data: {
        totalScore,
        evaluationStatus,
        overallResult: evaluationStatus === "PASSED" ? "PASSED" : "FAILED",
      },
      include: {
        position: {
          select: {
            id: true,
            title: true,
          },
        },
        answers: {
          include: {
            question: {
              select: {
                id: true,
                text: true,
                weight: true,
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

    return NextResponse.json({
      success: true,
      message: `Application evaluation finalized. Status: ${evaluationStatus}`,
      data: {
        application: {
          id: updatedApplication.id,
          name: updatedApplication.name,
          email: updatedApplication.email,
          totalScore: updatedApplication.totalScore,
          evaluationStatus: updatedApplication.evaluationStatus,
          overallResult: updatedApplication.overallResult,
          position: updatedApplication.position,
        },
        scoring: {
          totalScore,
          maxPossibleScore,
          scorePercentage: Math.round(scorePercentage * 100) / 100,
          threshold: 70,
          passed: evaluationStatus === "PASSED",
        },
        answers: updatedApplication.answers.map(answer => ({
          id: answer.id,
          response: answer.response,
          score: answer.score,
          weightedScore: answer.score! * answer.question.weight,
          question: {
            id: answer.question.id,
            text: answer.question.text,
            weight: answer.question.weight,
          },
        })),
      },
    });
  } catch (error) {
    console.error("Error finalizing application evaluation:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
