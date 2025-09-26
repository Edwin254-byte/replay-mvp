"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Volume2, VolumeX, RotateCcw, Play, Pause, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface AvatarInterviewerProps {
  question: {
    id: string;
    title: string;
    text: string;
  };
  avatarType?: "professional_female" | "professional_male" | "friendly_female";
  autoPlay?: boolean;
  onVideoReady?: () => void;
  onVideoError?: (error: string) => void;
}

type VideoStatus = "idle" | "generating" | "ready" | "playing" | "error";

export default function AvatarInterviewer({
  question,
  avatarType = "professional_female",
  autoPlay = true,
  onVideoReady,
  onVideoError,
}: AvatarInterviewerProps) {
  const [videoStatus, setVideoStatus] = useState<VideoStatus>("idle");
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [videoId, setVideoId] = useState<string | null>(null);
  const [muted, setMuted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Generate avatar video when question changes
  useEffect(() => {
    const pollVideoStatus = async (id: string) => {
      const checkStatus = async () => {
        try {
          if (!id || id === "undefined") {
            throw new Error("Invalid video ID");
          }

          const response = await fetch(`/api/avatar/generate?videoId=${id}`);

          const status = await response.json();

          // Check if this is a fallback response
          if (status.fallback) {
            setError("Avatar service unavailable");
            setVideoStatus("error");
            onVideoError?.(status.error || "Avatar service temporarily unavailable");
            toast.error("Avatar service unavailable - question shown as text");
            return;
          }

          if (!response.ok) {
            throw new Error(status.error || "Failed to check status");
          }

          if (status.status === "completed" && status.video_url) {
            setVideoUrl(status.video_url);
            setVideoStatus("ready");
            onVideoReady?.();

            if (autoPlay && videoRef.current) {
              setTimeout(() => {
                videoRef.current?.play();
                setVideoStatus("playing");
              }, 500);
            }
          } else if (status.status === "failed") {
            throw new Error("Video generation failed");
          } else {
            // Still processing, check again in 3 seconds
            setTimeout(checkStatus, 3000);
          }
        } catch (error) {
          console.error("Error checking video status:", error);
          setError("Failed to process avatar video");
          setVideoStatus("error");
          onVideoError?.(error instanceof Error ? error.message : "Unknown error");
        }
      };

      checkStatus();
    };

    const generateAvatarVideo = async () => {
      try {
        setVideoStatus("generating");
        setError(null);
        setVideoUrl(null);

        // Generate video
        const response = await fetch("/api/avatar/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text: question.text,
            avatarType,
          }),
        });

        const data = await response.json();

        // Check if this is a fallback response
        if (data.fallback) {
          setError("Avatar service unavailable");
          setVideoStatus("error");
          onVideoError?.(data.error || "Avatar service temporarily unavailable");
          toast.error("Avatar unavailable - question shown as text");
          return;
        }

        if (!response.ok) {
          throw new Error("Failed to generate avatar video");
        }

        setVideoId(data.videoId);
        // Poll for video completion
        pollVideoStatus(data.videoId);
      } catch (error) {
        console.error("Error generating avatar video:", error);
        setError("Failed to generate avatar video");
        setVideoStatus("error");
        onVideoError?.(error instanceof Error ? error.message : "Unknown error");
        toast.error("Failed to generate avatar video");
      }
    };

    if (question?.text) {
      generateAvatarVideo();
    }
  }, [question?.id, question?.text, avatarType, autoPlay, onVideoReady, onVideoError]); // Re-generate when question changes

  // Handle regeneration
  useEffect(() => {
    if (videoStatus === "idle" && question?.text) {
      // Re-trigger generation
      const timer = setTimeout(() => {
        setVideoStatus("generating");
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [videoStatus, question?.text]);

  const handlePlayPause = () => {
    if (!videoRef.current) return;

    if (videoRef.current.paused) {
      videoRef.current.play();
      setVideoStatus("playing");
    } else {
      videoRef.current.pause();
      setVideoStatus("ready");
    }
  };

  const handleMuteToggle = () => {
    if (!videoRef.current) return;

    videoRef.current.muted = !videoRef.current.muted;
    setMuted(!muted);
  };

  const handleRegenerate = () => {
    if (question?.text) {
      // Trigger re-generation by updating a state that's in the dependency array
      setVideoStatus("idle");
      setError(null);
      setVideoUrl(null);
      setVideoId(null);
    }
  };

  const getAvatarDisplayName = () => {
    switch (avatarType) {
      case "professional_female":
        return "Professional Interviewer";
      case "professional_male":
        return "Senior Interviewer";
      case "friendly_female":
        return "HR Representative";
      default:
        return "AI Interviewer";
    }
  };

  const getStatusMessage = () => {
    switch (videoStatus) {
      case "generating":
        return "AI interviewer is preparing your question...";
      case "ready":
        return "Question ready to play";
      case "playing":
        return "Question being presented";
      case "error":
        return error || "Error occurred";
      default:
        return "Initializing...";
    }
  };

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        {/* Avatar Video Area */}
        <div className="relative bg-gradient-to-br from-blue-50 to-indigo-100 aspect-video">
          {videoUrl && videoStatus !== "error" ? (
            <video
              ref={videoRef}
              src={videoUrl}
              className="w-full h-full object-cover"
              onPlay={() => setVideoStatus("playing")}
              onPause={() => setVideoStatus("ready")}
              onEnded={() => setVideoStatus("ready")}
              playsInline
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              {videoStatus === "generating" ? (
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 bg-blue-200 rounded-full flex items-center justify-center animate-pulse">
                    <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-blue-800 font-medium">Creating Your Interviewer</p>
                    <p className="text-blue-600 text-sm">This may take 30-60 seconds...</p>
                  </div>
                </div>
              ) : videoStatus === "error" ? (
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 bg-red-200 rounded-full flex items-center justify-center">
                    <VolumeX className="w-8 h-8 text-red-600" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-red-800 font-medium">Avatar Unavailable</p>
                    <p className="text-red-600 text-sm">{error}</p>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleRegenerate}
                      className="border-red-200 text-red-700 hover:bg-red-50"
                    >
                      <RotateCcw className="w-4 h-4 mr-1" />
                      Try Again
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                    <Volume2 className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-600">Preparing interviewer...</p>
                </div>
              )}
            </div>
          )}

          {/* Video Controls Overlay */}
          {videoUrl && videoStatus !== "error" && (
            <div className="absolute bottom-4 left-4 right-4">
              <div className="bg-black/50 backdrop-blur-sm rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={handlePlayPause}
                      className="text-white hover:bg-white/20"
                    >
                      {videoStatus === "playing" ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={handleMuteToggle}
                      className="text-white hover:bg-white/20"
                    >
                      {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                    </Button>
                  </div>
                  <Button size="sm" variant="ghost" onClick={handleRegenerate} className="text-white hover:bg-white/20">
                    <RotateCcw className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Question Info */}
        <div className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                {getAvatarDisplayName()}
              </Badge>
              <Badge
                variant="outline"
                className={
                  videoStatus === "generating"
                    ? "border-orange-200 text-orange-700"
                    : videoStatus === "ready"
                      ? "border-green-200 text-green-700"
                      : videoStatus === "playing"
                        ? "border-blue-200 text-blue-700"
                        : videoStatus === "error"
                          ? "border-red-200 text-red-700"
                          : "border-gray-200 text-gray-700"
                }
              >
                {videoStatus === "generating" && <Loader2 className="w-3 h-3 mr-1 animate-spin" />}
                {getStatusMessage()}
              </Badge>
            </div>
          </div>

          {/* Question Text (fallback) */}
          <div className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
            <p className="font-medium mb-1">{question.title}</p>
            <p>{question.text}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
