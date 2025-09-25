import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const { publicId, name, email } = await request.json();

    // Find position by publicId
    const position = await prisma.position.findUnique({
      where: { publicId },
    });

    if (!position) {
      return NextResponse.json({ error: "Position not found" }, { status: 404 });
    }

    const application = await prisma.application.create({
      data: {
        positionId: position.id,
        name,
        email,
      },
    });

    return NextResponse.json({ applicationId: application.id });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create application" }, { status: 500 });
  }
}
