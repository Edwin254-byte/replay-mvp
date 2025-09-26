import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get("content-type");

    // Handle JSON (text responses)
    if (contentType?.includes("application/json")) {
      const { applicationId, questionId, text } = await request.json();

      if (!applicationId || !questionId || !text) {
        return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
      }

      const answer = await prisma.answer.create({
        data: {
          applicationId,
          questionId,
          response: text.trim(),
          recordedMeta: null,
          recordedUrl: null,
        },
      });

      return NextResponse.json({
        success: true,
        answer: {
          id: answer.id,
          response: answer.response,
        },
      });
    }

    // Handle FormData (file uploads - for future use)
    else {
      const formData = await request.formData();
      const file = formData.get("file") as File;
      const questionId = formData.get("questionId") as string;
      const applicationId = formData.get("applicationId") as string;
      const response = formData.get("response") as string;

      if (!file || !questionId || !applicationId || !response) {
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
          response, // Required field for the text response
          recordedMeta,
          recordedUrl: null, // Simulated - would store actual URL in production
          startedAt: new Date(),
          endedAt: new Date(),
        },
      });

      return NextResponse.json({
        success: true,
        answer: {
          id: answer.id,
          response: answer.response,
        },
      });
    }
  } catch (error) {
    console.error("Error saving answer:", error);
    return NextResponse.json({ error: "Failed to save answer" }, { status: 500 });
  }
}
