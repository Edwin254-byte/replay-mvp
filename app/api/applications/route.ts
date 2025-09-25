import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const { positionId, name, email } = await request.json();

    // Find position by id
    const position = await prisma.position.findUnique({
      where: { id: positionId },
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
