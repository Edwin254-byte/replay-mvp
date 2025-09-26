import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendApplicationCompleteEmails } from "@/lib/email";

export async function POST(request: NextRequest, { params }: { params: Promise<{ applicationId: string }> }) {
  try {
    const { applicationId } = await params;

    // Get the application with position and manager details
    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        position: {
          include: {
            user: true, // Manager details
          },
        },
      },
    });

    if (!application) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    // Check if already completed
    if (application.status === "completed") {
      return NextResponse.json({ message: "Application already completed" });
    }

    // Update application status
    const updatedApplication = await prisma.application.update({
      where: { id: applicationId },
      data: {
        status: "completed",
        completedAt: new Date(),
      },
    });

    // Send completion emails
    try {
      await sendApplicationCompleteEmails({
        applicantName: application.name,
        applicantEmail: application.email,
        positionTitle: application.position.title,
        managerName: application.position.user.name,
        managerEmail: application.position.user.email,
        applicationId: application.id,
      });
    } catch (emailError) {
      console.error("Failed to send completion emails:", emailError);
      // Don't fail the completion if email fails
    }

    return NextResponse.json({
      success: true,
      message: "Application completed successfully",
      application: updatedApplication,
    });
  } catch (error) {
    console.error("Error completing application:", error);
    return NextResponse.json({ error: "Failed to complete application" }, { status: 500 });
  }
}
