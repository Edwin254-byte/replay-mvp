import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    console.log("Testing HeyGen API connection...");

    if (!process.env.HEYGEN_API_KEY) {
      return NextResponse.json({
        error: "HeyGen API key not configured",
        configured: false,
      });
    }

    // Test 1: Get avatars
    console.log("Testing avatars endpoint...");
    const avatarsResponse = await fetch("https://api.heygen.com/v1/avatar.list", {
      method: "GET",
      headers: {
        "X-API-KEY": process.env.HEYGEN_API_KEY,
        "Content-Type": "application/json",
      },
    });

    console.log("Avatars response status:", avatarsResponse.status);
    const avatarsText = await avatarsResponse.text();
    console.log("Avatars response:", avatarsText);

    let avatarsData;
    try {
      avatarsData = JSON.parse(avatarsText);
    } catch {
      avatarsData = { error: "Invalid JSON", raw: avatarsText };
    }

    // Test 2: Get voices
    console.log("Testing voices endpoint...");
    const voicesResponse = await fetch("https://api.heygen.com/v1/voice.list", {
      method: "GET",
      headers: {
        "X-API-KEY": process.env.HEYGEN_API_KEY,
        "Content-Type": "application/json",
      },
    });

    console.log("Voices response status:", voicesResponse.status);
    const voicesText = await voicesResponse.text();
    console.log("Voices response:", voicesText);

    let voicesData;
    try {
      voicesData = JSON.parse(voicesText);
    } catch {
      voicesData = { error: "Invalid JSON", raw: voicesText };
    }

    // Test 3: Try simple video generation
    console.log("Testing video generation...");
    const videoGenResponse = await fetch("https://api.heygen.com/v2/video/generate", {
      method: "POST",
      headers: {
        "X-API-KEY": process.env.HEYGEN_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        video_inputs: [
          {
            character: {
              type: "avatar",
              avatar_id: "Abigail_expressive_2024112501",
            },
            voice: {
              type: "text",
              voice_id: "73c0b6a2e29d4d38aca41454bf58c955",
              input_text: "Hello, this is a test message",
            },
          },
        ],
        test: true,
      }),
    });

    console.log("Video generation response status:", videoGenResponse.status);
    const videoGenText = await videoGenResponse.text();
    console.log("Video generation response:", videoGenText);

    let videoGenData;
    try {
      videoGenData = JSON.parse(videoGenText);
    } catch {
      videoGenData = { error: "Invalid JSON", raw: videoGenText };
    }

    return NextResponse.json({
      configured: true,
      tests: {
        avatars: {
          status: avatarsResponse.status,
          success: avatarsResponse.ok,
          data: avatarsData,
        },
        voices: {
          status: voicesResponse.status,
          success: voicesResponse.ok,
          data: voicesData,
        },
        videoGeneration: {
          status: videoGenResponse.status,
          success: videoGenResponse.ok,
          data: videoGenData,
        },
      },
    });
  } catch (error) {
    console.error("Error testing HeyGen API:", error);
    return NextResponse.json({
      error: "Test failed",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
