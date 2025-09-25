import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// Schema for validating POST request body
const createJobApplicationSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Valid email is required"),
  resumeUrl: z.string().url().optional(),
  positionId: z.string().min(1, "Position ID is required"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request body
    const validatedData = createJobApplicationSchema.parse(body);

    // Check if position exists
    const position = await prisma.position.findUnique({
      where: { id: validatedData.positionId },
    });

    if (!position) {
      return NextResponse.json({ error: "Position not found" }, { status: 404 });
    }

    // Create job application
    const jobApplication = await prisma.jobApplication.create({
      data: {
        name: validatedData.name,
        email: validatedData.email,
        resumeUrl: validatedData.resumeUrl,
        positionId: validatedData.positionId,
      },
      include: {
        position: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      application: jobApplication,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation failed", details: error.issues }, { status: 400 });
    }

    console.error("Error creating job application:", error);
    return NextResponse.json({ error: "Failed to create job application" }, { status: 500 });
  }
}
