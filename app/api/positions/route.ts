import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getToken } from "next-auth/jwt";

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const token = await getToken({ req: request });
    if (!token || token.role !== "MANAGER") {
      return NextResponse.json({ error: "Unauthorized. Manager access required." }, { status: 401 });
    }

    const positions = await prisma.position.findMany({
      where: { userId: token.sub },
      orderBy: { createdAt: "desc" },
      include: {
        applications: {
          select: {
            status: true,
          },
        },
        _count: {
          select: {
            applications: true,
            questions: true,
          },
        },
      },
    });
    return NextResponse.json({ positions });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch positions" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const token = await getToken({ req: request });
    if (!token || token.role !== "MANAGER") {
      return NextResponse.json({ error: "Unauthorized. Manager access required." }, { status: 401 });
    }

    if (!token.sub) {
      return NextResponse.json({ error: "Invalid user session" }, { status: 401 });
    }

    const { title, description } = await request.json();

    if (!title || !title.trim()) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    const position = await prisma.position.create({
      data: {
        title: title.trim(),
        description: description?.trim() || "",
        userId: token.sub as string,
      },
    });

    return NextResponse.json({ position });
  } catch (error) {
    console.error("Error creating position:", error);
    return NextResponse.json({ error: "Failed to create position" }, { status: 500 });
  }
}
