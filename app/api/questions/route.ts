import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const { positionId, title, prompt, voiceType, order } = await request.json();

    const question = await prisma.question.create({
      data: {
        positionId,
        title,
        prompt,
        voiceType,
        order: order || 1,
      },
    });

    return NextResponse.json({ question });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create question" }, { status: 500 });
  }
}
