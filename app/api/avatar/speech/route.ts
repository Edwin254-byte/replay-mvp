import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json();

    if (!text || text.trim().length === 0) {
      return NextResponse.json({ error: "Text is required" }, { status: 400 });
    }

    // For now, return a simple audio-based solution using Web Speech API
    // This will be handled on the frontend
    return NextResponse.json({
      success: true,
      type: "speech",
      text: text,
      message: "Speech synthesis ready",
    });
  } catch (error) {
    console.error("Error preparing speech:", error);
    return NextResponse.json(
      {
        error: "Failed to prepare speech",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
