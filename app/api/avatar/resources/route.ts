import { NextRequest, NextResponse } from "next/server";
import { heyGenService } from "@/lib/heygen";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") || "avatars"; // 'avatars' or 'voices'
  try {
    if (!process.env.HEYGEN_API_KEY) {
      return NextResponse.json({ error: "HeyGen API key not configured" }, { status: 500 });
    }

    let result;
    if (type === "voices") {
      result = await heyGenService.getVoices();
    } else {
      result = await heyGenService.getAvatars();
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error(`Error fetching HeyGen ${type}:`, error);
    return NextResponse.json({ error: `Failed to fetch ${type}` }, { status: 500 });
  }
}
