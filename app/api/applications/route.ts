import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendApplicationStartEmail } from "@/lib/email";

export async function POST(request: NextRequest) {
  try {
    const { positionId, publicId, name, email, resumeUrl } = await request.json();

    // Use publicId if positionId is not provided (from public form)
    const actualPositionId = positionId || publicId;

    if (!actualPositionId) {
      return NextResponse.json({ error: "Position ID is required" }, { status: 400 });
    }

    if (!name || !email) {
      return NextResponse.json({ error: "Name and email are required" }, { status: 400 });
    }

    // Find position by id
    const position = await prisma.position.findUnique({
      where: { id: actualPositionId },
      include: {
        user: true, // Include manager details for email
      },
    });

    if (!position) {
      return NextResponse.json({ error: "Position not found" }, { status: 404 });
    }

    // Check if an application already exists for this email and position
    const existingApplication = await prisma.application.findFirst({
      where: {
        positionId: actualPositionId,
        email: email.toLowerCase(), // Case-insensitive email check
      },
    });

    let application;
    let isNewApplication = false;

    if (existingApplication) {
      // Return the existing application instead of creating a new one
      application = existingApplication;
    } else {
      // Create a new application
      application = await prisma.application.create({
        data: {
          positionId: actualPositionId,
          name,
          email: email.toLowerCase(),
          resumeUrl: resumeUrl || undefined,
          status: "in_progress",
          overallResult: "PENDING",
        },
      });
      isNewApplication = true;
    }

    // Send email notification for new applications only
    if (isNewApplication) {
      try {
        await sendApplicationStartEmail({
          applicantName: name,
          applicantEmail: email.toLowerCase(),
          positionTitle: position.title,
          publicId: actualPositionId,
          applicationId: application.id,
        });
      } catch (emailError) {
        console.error("Failed to send application start email:", emailError);
        // Don't fail the application creation if email fails
      }
    }

    return NextResponse.json({ applicationId: application.id });
  } catch (error) {
    console.error("Error creating application:", error);
    return NextResponse.json({ error: "Failed to create application" }, { status: 500 });
  }
}
