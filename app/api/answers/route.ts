import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const questionId = formData.get("questionId") as string;
    const applicationId = formData.get("applicationId") as string;

    if (!file || !questionId || !applicationId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Create metadata for the simulated file upload
    const recordedMeta = JSON.stringify({
      filename: file.name,
      mimetype: file.type,
      size: file.size,
      duration: null, // Would be calculated from actual video file
    });

    const answer = await prisma.answer.create({
      data: {
        applicationId,
        questionId,
        recordedMeta,
        recordedUrl: null, // Simulated - would store actual URL in production
        startedAt: new Date(),
        endedAt: new Date(),
      },
    });

    return NextResponse.json({ answer });
  } catch (error) {
    return NextResponse.json({ error: "Failed to save answer" }, { status: 500 });
  }
}
