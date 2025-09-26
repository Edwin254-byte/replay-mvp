/**
 * HeyGen API Service for AI Avatar Integration
 * Handles avatar creation, video generation, and streaming avatars
 */

interface HeyGenAvatarConfig {
  avatarId: string;
  voice: {
    type: string;
    voice_id: string;
  };
  background?: string;
  scale?: number;
}

// For requests with input_text in voice
interface HeyGenVideoRequestWithVoiceText {
  video_inputs: Array<{
    character: {
      type: string;
      avatar_id: string;
      scale?: number;
    };
    voice: {
      type: string;
      voice_id: string;
      input_text: string;
    };
  }>;
  test?: boolean;
}

// For requests with script at top level
interface HeyGenVideoRequestWithScript {
  script: {
    type: string;
    input_text: string;
  };
  video_inputs: Array<{
    character: {
      type: string;
      avatar_id: string;
      scale?: number;
    };
    voice: {
      type: string;
      voice_id: string;
    };
  }>;
  test?: boolean;
}

interface HeyGenVideoRequest {
  video_inputs: Array<{
    character: {
      type: string;
      avatar_id: string;
      scale?: number;
    };
    voice: {
      type: string;
      voice_id: string;
      input_text?: string; // Make this optional since we handle it dynamically
    };
    background?: {
      type: string;
      url?: string;
    };
  }>;
  test?: boolean;
  caption?: boolean;
}

export class HeyGenService {
  private apiKey: string;
  private baseUrl = "https://api.heygen.com";

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  /**
   * Test API key and connectivity
   */
  async testConnection() {
    try {
      const response = await fetch(`${this.baseUrl}/v2/avatars`, {
        headers: {
          "X-API-KEY": this.apiKey,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorBody = await response.text();
        console.error(`HeyGen API test failed ${response.status}:`, errorBody);
        return { success: false, error: errorBody };
      }

      const result = await response.json();
      return { success: true, data: result };
    } catch (error) {
      console.error("Error testing HeyGen connection:", error);
      return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
    }
  }

  /**
   * Get available avatars
   */
  async getAvatars() {
    try {
      const response = await fetch(`${this.baseUrl}/v2/avatars`, {
        headers: {
          "X-API-KEY": this.apiKey,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HeyGen API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching avatars:", error);
      throw error;
    }
  }

  /**
   * Get available voices
   */
  async getVoices() {
    try {
      const response = await fetch(`${this.baseUrl}/v2/voices`, {
        headers: {
          "X-API-KEY": this.apiKey,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HeyGen API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching voices:", error);
      throw error;
    }
  }

  /**
   * Generate avatar video with text - Testing minimal structure
   */
  async generateVideo(text: string, config: HeyGenAvatarConfig) {
    try {
      // Try approach 1: direct input_text
      const requestBody1: HeyGenVideoRequest = {
        video_inputs: [
          {
            character: {
              type: "avatar",
              avatar_id: config.avatarId,
            },
            voice: {
              type: "text",
              voice_id: config.voice.voice_id,
              input_text: text,
            },
          },
        ],
        test: false, // Set to false for real generation
      };

      console.log("HeyGen request body (attempt 1):", JSON.stringify(requestBody1, null, 2));

      let response = await fetch(`${this.baseUrl}/v2/video/generate`, {
        method: "POST",
        headers: {
          "X-API-KEY": this.apiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody1),
      });

      console.log("HeyGen response status:", response.status);
      const responseText = await response.text();
      console.log("HeyGen response body:", responseText);

      if (!response.ok) {
        console.log("Attempt 1 failed, trying alternative structure...");

        // Try approach 2: script at top level
        const requestBody2: HeyGenVideoRequestWithScript = {
          script: {
            type: "text",
            input_text: text,
          },
          video_inputs: [
            {
              character: {
                type: "avatar",
                avatar_id: config.avatarId,
              },
              voice: {
                type: "text",
                voice_id: config.voice.voice_id,
              },
            },
          ],
          test: false,
        };

        console.log("HeyGen request body (attempt 2):", JSON.stringify(requestBody2, null, 2));

        response = await fetch(`${this.baseUrl}/v2/video/generate`, {
          method: "POST",
          headers: {
            "X-API-KEY": this.apiKey,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody2),
        });

        console.log("HeyGen response status (attempt 2):", response.status);
        const responseText2 = await response.text();
        console.log("HeyGen response body (attempt 2):", responseText2);

        if (!response.ok) {
          console.error(`HeyGen API error ${response.status}:`, responseText2);
          throw new Error(`HeyGen API error: ${response.status} - ${responseText2}`);
        }

        // Parse the successful response from attempt 2
        try {
          return JSON.parse(responseText2);
        } catch (parseError) {
          console.error("Failed to parse response:", parseError);
          throw new Error("Invalid JSON response from HeyGen API");
        }
      }

      // Parse the successful response from attempt 1
      try {
        return JSON.parse(responseText);
      } catch (parseError) {
        console.error("Failed to parse response:", parseError);
        throw new Error("Invalid JSON response from HeyGen API");
      }
    } catch (error) {
      console.error("Error generating video:", error);
      throw error;
    }
  }

  /**
   * Generate avatar video with text - Alternative structure
   */
  async generateVideoAlternative(text: string, config: HeyGenAvatarConfig) {
    try {
      // Alternative structure based on newer HeyGen API
      const requestBody: HeyGenVideoRequestWithScript = {
        script: {
          type: "text",
          input_text: text,
        },
        video_inputs: [
          {
            character: {
              type: "avatar",
              avatar_id: config.avatarId,
            },
            voice: {
              type: "text",
              voice_id: config.voice.voice_id,
            },
          },
        ],
        test: false,
      };

      console.log("HeyGen Alternative request body:", JSON.stringify(requestBody, null, 2));

      const response = await fetch(`${this.baseUrl}/v2/video/generate`, {
        method: "POST",
        headers: {
          "X-API-KEY": this.apiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        console.error(`HeyGen API error ${response.status}:`, errorBody);
        return { error: errorBody };
      }

      return await response.json();
    } catch (error) {
      console.error("Error generating video (alternative):", error);
      throw error;
    }
  }
  async getVideoStatus(videoId: string) {
    try {
      const response = await fetch(`${this.baseUrl}/v1/video_status.get?video_id=${videoId}`, {
        headers: {
          "X-API-KEY": this.apiKey,
        },
      });

      if (!response.ok) {
        throw new Error(`HeyGen API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error checking video status:", error);
      throw error;
    }
  }

  /**
   * Create streaming avatar session (for real-time interaction)
   */
  async createStreamingSession(config: HeyGenAvatarConfig) {
    try {
      const response = await fetch(`${this.baseUrl}/v1/streaming.create_token`, {
        method: "POST",
        headers: {
          "X-API-KEY": this.apiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          quality: "high",
          avatar_name: config.avatarId,
          voice: config.voice,
        }),
      });

      if (!response.ok) {
        throw new Error(`HeyGen API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error creating streaming session:", error);
      throw error;
    }
  }
}

/**
 * Default avatar configurations - Using real HeyGen avatars from your account
 */
export const DEFAULT_AVATARS = {
  professional_female: {
    avatarId: "Abigail_expressive_2024112501", // Real avatar ID from your account
    voice: {
      type: "text",
      voice_id: "73c0b6a2e29d4d38aca41454bf58c955", // Cerise - Cheerful (Female English)
    },
    background: "#ffffff",
    scale: 1,
  },
  professional_male: {
    avatarId: "Abigail_expressive_2024112501", // Using same avatar for now, will update when we see male avatars
    voice: {
      type: "text",
      voice_id: "73c0b6a2e29d4d38aca41454bf58c955", // Same voice for now
    },
    background: "#ffffff",
    scale: 1,
  },
  friendly_female: {
    avatarId: "Abigail_expressive_2024112501", // Using same avatar
    voice: {
      type: "text",
      voice_id: "73c0b6a2e29d4d38aca41454bf58c955", // Cerise - Cheerful
    },
    background: "#ffffff",
    scale: 1,
  },
} as const; /**
 * Singleton HeyGen service instance
 */
export const heyGenService = new HeyGenService(process.env.HEYGEN_API_KEY || "");

// Simpler function to try streaming API instead
export async function tryStreamingAvatar(text: string, avatarConfig: HeyGenAvatarConfig) {
  try {
    const response = await fetch("https://api.heygen.com/v1/streaming.create_token", {
      method: "POST",
      headers: {
        "X-API-KEY": process.env.HEYGEN_API_KEY!,
        "Content-Type": "application/json",
      },
    });

    if (response.ok) {
      console.log("Streaming API is available");
      return await response.json();
    } else {
      console.log("Streaming API not available, falling back to video generation");
      return null;
    }
  } catch (error) {
    console.error("Error checking streaming API:", error);
    return null;
  }
}
