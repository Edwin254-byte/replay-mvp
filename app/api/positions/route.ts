import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { nanoid } from "nanoid";

export async function GET() {
  try {
    const positions = await prisma.position.findMany({
      orderBy: { createdAt: "desc" },
      include: { questions: true, applications: true },
    });
    return NextResponse.json({ positions });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch positions" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { title, description, introText, farewellText } = await request.json();

    const position = await prisma.position.create({
      data: {
        title,
        description,
        introText,
        farewellText,
        publicId: nanoid(10),
        createdBy: "admin", // TODO: get from session
      },
    });

    return NextResponse.json({ position });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create position" }, { status: 500 });
  }
}
