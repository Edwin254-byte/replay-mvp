import { NextRequest, NextResponse } from "next/server";
import { heyGenService, DEFAULT_AVATARS } from "@/lib/heygen";

export async function POST(request: NextRequest) {
  try {
    const { text, avatarType = "professional_female" } = await request.json();

    if (!text || text.trim().length === 0) {
      return NextResponse.json({ error: "Text is required" }, { status: 400 });
    }

    if (!process.env.HEYGEN_API_KEY) {
      return NextResponse.json(
        {
          error: "Avatar service temporarily unavailable",
          fallback: true,
        },
        { status: 503 }
      );
    }

    // Get avatar configuration
    const avatarConfig =
      DEFAULT_AVATARS[avatarType as keyof typeof DEFAULT_AVATARS] || DEFAULT_AVATARS.professional_female;

    // Generate video with avatar
    const result = await heyGenService.generateVideo(text, avatarConfig);

    console.log("HeyGen API result:", JSON.stringify(result, null, 2));

    // Check if we got a valid response with video_id
    if (!result || !result.video_id) {
      console.error("HeyGen API did not return a video_id:", result);
      return NextResponse.json(
        {
          error: "Avatar generation failed - no video ID returned",
          fallback: true,
          details: "Invalid response from HeyGen API",
        },
        { status: 200 }
      );
    }

    return NextResponse.json({
      success: true,
      videoId: result.video_id,
      message: "Avatar video generation started",
    });
  } catch (error) {
    console.error("Error generating avatar video:", error);

    // Return a fallback response instead of complete failure
    return NextResponse.json(
      {
        error: "Avatar generation failed - falling back to text mode",
        fallback: true,
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 200 }
    ); // Use 200 so the frontend can handle gracefully
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const videoId = searchParams.get("videoId");

    if (!videoId || videoId === "undefined") {
      console.log("Invalid video ID received:", videoId);
      return NextResponse.json(
        {
          error: "Video ID is required",
          status: "failed",
          fallback: true,
        },
        { status: 400 }
      );
    }

    if (!process.env.HEYGEN_API_KEY) {
      return NextResponse.json(
        {
          error: "HeyGen API key not configured",
          status: "failed",
          fallback: true,
        },
        { status: 500 }
      );
    }

    // Check video status
    const status = await heyGenService.getVideoStatus(videoId);

    return NextResponse.json(status);
  } catch (error) {
    console.error("Error checking video status:", error);
    return NextResponse.json(
      {
        error: "Failed to check video status",
        status: "failed",
        fallback: true,
      },
      { status: 200 }
    ); // Return 200 with fallback flag
  }
}
