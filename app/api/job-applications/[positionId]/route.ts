import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { UserRole } from "@prisma/client";

export async function GET(request: NextRequest, { params }: { params: Promise<{ positionId: string }> }) {
  try {
    // Check authentication - only managers can view applications
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    // Check if user is a manager (assuming role is stored in session)
    // Note: You might need to fetch user from database if role isn't in session
    const user = await prisma.user.findUnique({
      where: { email: session.user.email! },
    });

    if (!user || user.role !== UserRole.MANAGER) {
      return NextResponse.json({ error: "Manager access required" }, { status: 403 });
    }

    const { positionId } = await params;

    // Check if position exists
    const position = await prisma.position.findUnique({
      where: { id: positionId },
    });

    if (!position) {
      return NextResponse.json({ error: "Position not found" }, { status: 404 });
    }

    // Get all job applications for this position
    const applications = await prisma.jobApplication.findMany({
      where: { positionId },
      include: {
        position: {
          select: {
            id: true,
            title: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      success: true,
      position: {
        id: position.id,
        title: position.title,
      },
      applications,
    });
  } catch (error) {
    console.error("Error fetching job applications:", error);
    return NextResponse.json({ error: "Failed to fetch job applications" }, { status: 500 });
  }
}
