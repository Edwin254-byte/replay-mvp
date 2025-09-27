import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ApplicationResult } from "@prisma/client";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ applicationId: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { applicationId } = await params;
    const body = await request.json();
    const { status } = body;

    if (!applicationId) {
      return NextResponse.json({ error: "Application ID is required" }, { status: 400 });
    }

    if (!status || !["PASSED", "FAILED"].includes(status)) {
      return NextResponse.json({ error: "Valid status is required (PASSED or FAILED)" }, { status: 400 });
    }

    // First, verify the application exists and belongs to the manager
    const application = await prisma.application.findUnique({
      where: {
        id: applicationId,
      },
      include: {
        position: {
          select: {
            userId: true,
          },
        },
      },
    });

    if (!application) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    // Check if the manager owns this position
    if (application.position.userId !== session.user.id) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Update the application status
    const updatedApplication = await prisma.application.update({
      where: {
        id: applicationId,
      },
      data: {
        overallResult: status as ApplicationResult,
        evaluationStatus: status === "PASSED" ? "PASSED" : "FAILED",
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        id: updatedApplication.id,
        status: updatedApplication.overallResult,
        evaluationStatus: updatedApplication.evaluationStatus,
      },
      message: `Application marked as ${status.toLowerCase()}`,
    });
  } catch (error) {
    console.error("Error updating application status:", error);
    return NextResponse.json({ error: "Failed to update application status" }, { status: 500 });
  }
}
