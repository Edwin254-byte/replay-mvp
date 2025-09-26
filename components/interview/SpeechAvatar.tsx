import React, { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Play, Pause, Volume2, VolumeX, RotateCcw, Clock } from "lucide-react";
import { toast } from "sonner";

interface SpeechAvatarProps {
  question: { id: string; text: string } | null;
  autoPlay?: boolean;
  onSpeechStart?: () => void;
  onSpeechEnd?: () => void;
  onSpeechError?: (error: string) => void;
}

type SpeechStatus = "idle" | "preparing" | "ready" | "speaking" | "paused" | "completed" | "error";

// Avatar configuration
const AVATAR_CONFIG = {
  emoji: "👩‍💼",
  bg: "bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600",
  name: "Professional Female",
  color: "text-blue-50",
  ring: "ring-blue-400",
  description: "Professional, clear female voice",
};

const VOICE_SETTINGS = {
  voiceName: "Microsoft Zira - English (United States)",
  rate: 0.9,
  pitch: 1.3, // Higher pitch for more feminine sound
};

export default function SpeechAvatar({
  question,
  autoPlay = true,
  onSpeechStart,
  onSpeechEnd,
  onSpeechError,
}: SpeechAvatarProps) {
  const [speechStatus, setSpeechStatus] = useState<SpeechStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isSupported, setIsSupported] = useState(false);

  const speechSynthRef = useRef<SpeechSynthesisUtterance | null>(null);
  const onSpeechStartRef = useRef(onSpeechStart);
  const onSpeechEndRef = useRef(onSpeechEnd);
  const onSpeechErrorRef = useRef(onSpeechError);
  const avatarConfig = AVATAR_CONFIG;

  // Update callback refs when props change
  useEffect(() => {
    onSpeechStartRef.current = onSpeechStart;
    onSpeechEndRef.current = onSpeechEnd;
    onSpeechErrorRef.current = onSpeechError;
  });

  // Check if speech synthesis is supported
  useEffect(() => {
    setIsSupported("speechSynthesis" in window);
  }, []);

  // Generate and play speech when question changes
  useEffect(() => {
    if (!question?.text || !isSupported) return;

    const prepareSpeech = () => {
      try {
        setSpeechStatus("preparing");
        setError(null);

        // Cancel any existing speech
        window.speechSynthesis.cancel();

        // Create new utterance
        const utterance = new SpeechSynthesisUtterance(question.text);
        speechSynthRef.current = utterance;

        // Configure voice settings
        const settings = VOICE_SETTINGS;
        utterance.rate = settings.rate;
        utterance.pitch = settings.pitch;

        // Try to find the best female voice
        const voices = window.speechSynthesis.getVoices();

        // Debug: Log all available voices (can be removed later)
        console.log(
          "Available voices:",
          voices.map(v => `${v.name} (${v.lang})`)
        );

        // Priority order for female voices
        const femaleVoiceNames = [
          "Microsoft Zira - English (United States)",
          "Microsoft Hazel - English (Great Britain)",
          "Google US English Female",
          "Apple Samantha",
          "Samantha",
          "Victoria",
          "Karen",
          "Moira",
          "Tessa",
        ];

        let selectedVoice = null;

        // First, try to find specific female voices by name
        for (const voiceName of femaleVoiceNames) {
          selectedVoice = voices.find(
            voice => voice.name.includes(voiceName.split(" - ")[0]) || voice.name === voiceName
          );
          if (selectedVoice) break;
        }

        // If no specific voice found, look for any female voice
        if (!selectedVoice) {
          selectedVoice = voices.find(
            voice =>
              voice.name.toLowerCase().includes("female") ||
              voice.name.toLowerCase().includes("woman") ||
              voice.name.toLowerCase().includes("zira") ||
              voice.name.toLowerCase().includes("hazel") ||
              voice.name.toLowerCase().includes("samantha")
          );
        }

        // Final fallback: any English voice (but prefer higher pitch)
        if (!selectedVoice) {
          selectedVoice = voices.find(
            voice => voice.lang.startsWith("en") && !voice.name.toLowerCase().includes("male")
          );
        }

        if (selectedVoice) {
          utterance.voice = selectedVoice;
          console.log("Selected voice:", selectedVoice.name, "- Language:", selectedVoice.lang);
        } else {
          console.log("No specific voice found, using default");
        }

        // Set up event handlers
        utterance.onstart = () => {
          setSpeechStatus("speaking");
          onSpeechStartRef.current?.();
        };

        utterance.onend = () => {
          setSpeechStatus("completed");
          onSpeechEndRef.current?.();
        };

        utterance.onerror = event => {
          console.error("Speech synthesis error:", event);
          setError("Speech synthesis failed");
          setSpeechStatus("error");
          onSpeechErrorRef.current?.(event.error);
        };

        setSpeechStatus("ready");

        // Auto-play if enabled
        if (autoPlay && !isMuted) {
          setTimeout(() => {
            window.speechSynthesis.speak(utterance);
          }, 500);
        }
      } catch (error) {
        console.error("Error preparing speech:", error);
        setError("Failed to prepare speech");
        setSpeechStatus("error");
        onSpeechError?.(error instanceof Error ? error.message : "Unknown error");
      }
    };

    // Wait for voices to load if needed
    if (window.speechSynthesis.getVoices().length === 0) {
      window.speechSynthesis.addEventListener("voiceschanged", prepareSpeech, { once: true });
    } else {
      prepareSpeech();
    }

    return () => {
      window.speechSynthesis.cancel();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [question?.id, question?.text, autoPlay, isMuted, isSupported]);

  const handlePlayPause = () => {
    if (!speechSynthRef.current) return;

    if (speechStatus === "speaking") {
      window.speechSynthesis.pause();
      setSpeechStatus("paused");
    } else if (speechStatus === "paused") {
      window.speechSynthesis.resume();
      setSpeechStatus("speaking");
    } else if (speechStatus === "ready" || speechStatus === "completed") {
      window.speechSynthesis.speak(speechSynthRef.current);
    }
  };

  const handleMuteToggle = () => {
    setIsMuted(!isMuted);
    if (!isMuted) {
      window.speechSynthesis.cancel();
      setSpeechStatus("ready");
    }
  };

  const handleRegenerate = () => {
    setSpeechStatus("idle");
    setError(null);
  };

  if (!isSupported) {
    return (
      <Card className="p-6 text-center">
        <div className="text-4xl mb-4">❌</div>
        <h3 className="text-lg font-semibold mb-2">Speech Not Supported</h3>
        <p className="text-sm text-muted-foreground mb-4">Your browser doesn&apos;t support speech synthesis</p>
        <div className="p-3 bg-muted rounded-md text-left text-sm">
          <strong>Question:</strong>
          <br />
          {question?.text}
        </div>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-4xl mx-auto overflow-hidden shadow-lg">
      {/* Responsive Side-by-Side Layout */}
      <div className="flex flex-col md:flex-row md:items-start gap-6 p-6">
        {/* Compact Avatar - Left Side (Top on mobile) */}
        <div className={`flex-shrink-0 ${avatarConfig.bg} rounded-2xl p-4 md:w-auto w-full`}>
          <div className="flex md:flex-col items-center md:items-center gap-4 md:gap-0">
            {/* Avatar Circle */}
            <div className="relative">
              <div
                className={`w-16 md:w-20 h-16 md:h-20 rounded-full flex items-center justify-center text-3xl md:text-4xl ${avatarConfig.color} shadow-xl border-3 border-white/30 ${
                  speechStatus === "speaking" ? `animate-pulse ring-4 ${avatarConfig.ring} ring-opacity-40` : ""
                } transition-all duration-300`}
              >
                {avatarConfig.emoji}
              </div>

              {/* Speaking animation overlay */}
              {speechStatus === "speaking" && (
                <>
                  <div className="absolute inset-0 w-16 md:w-20 h-16 md:h-20 rounded-full bg-white/10 animate-ping" />
                  <div className="absolute inset-0 w-16 md:w-20 h-16 md:h-20 rounded-full bg-white/5 animate-pulse" />
                </>
              )}

              {/* Compact status indicator */}
              <div
                className={`absolute -bottom-1 -right-1 w-5 md:w-6 h-5 md:h-6 rounded-full border-2 border-white flex items-center justify-center ${
                  speechStatus === "speaking"
                    ? "bg-green-500 animate-pulse"
                    : speechStatus === "ready"
                      ? "bg-blue-500"
                      : speechStatus === "preparing"
                        ? "bg-yellow-500 animate-spin"
                        : speechStatus === "error"
                          ? "bg-red-500"
                          : "bg-gray-400"
                }`}
              >
                <div className="w-1.5 h-1.5 rounded-full bg-white" />
              </div>
            </div>

            {/* Avatar Info & Controls - Horizontal on mobile, vertical on desktop */}
            <div className="flex-1 md:flex-none">
              {/* Avatar Info */}
              <div className="md:mt-3 text-center md:text-center">
                <h4 className={`text-sm font-bold ${avatarConfig.color}`}>{avatarConfig.name}</h4>

                <div
                  className={`flex items-center justify-center space-x-1 text-xs ${avatarConfig.color} opacity-90 mt-1`}
                >
                  <div
                    className={`w-1.5 h-1.5 rounded-full ${
                      speechStatus === "speaking"
                        ? "bg-green-400 animate-pulse"
                        : speechStatus === "ready"
                          ? "bg-blue-400"
                          : speechStatus === "preparing"
                            ? "bg-yellow-400"
                            : speechStatus === "error"
                              ? "bg-red-400"
                              : "bg-gray-400"
                    }`}
                  />
                  <span className="capitalize font-medium">{speechStatus.replace("_", " ")}</span>
                </div>
              </div>

              {/* Controls */}
              <div className="mt-4 flex md:flex-col space-x-2 md:space-x-0 md:space-y-2">
                <Button
                  variant={speechStatus === "speaking" ? "secondary" : "default"}
                  size="sm"
                  onClick={handlePlayPause}
                  disabled={speechStatus === "preparing" || speechStatus === "error"}
                  className="flex-1 md:w-full text-xs shadow-sm"
                >
                  {speechStatus === "speaking" ? (
                    <>
                      <Pause className="w-3 h-3 mr-1" /> Pause
                    </>
                  ) : (
                    <>
                      <Play className="w-3 h-3 mr-1" />{" "}
                      {speechStatus === "ready" || speechStatus === "completed" ? "Play" : "Start"}
                    </>
                  )}
                </Button>

                <div className="flex space-x-1 md:space-x-1 flex-1 md:flex-none">
                  <Button variant="outline" size="sm" onClick={handleMuteToggle} className="flex-1 text-xs shadow-sm">
                    {isMuted ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
                  </Button>

                  {speechStatus === "error" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleRegenerate}
                      className="flex-1 text-xs shadow-sm border-red-200 hover:border-red-300"
                    >
                      <RotateCcw className="w-3 h-3" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Status Messages */}
          {speechStatus === "preparing" && (
            <div className="mt-3 p-2 bg-white/20 backdrop-blur-sm rounded-lg">
              <p className={`text-xs ${avatarConfig.color} font-medium text-center`}>🎙️ Preparing...</p>
            </div>
          )}

          {speechStatus === "speaking" && (
            <div className="mt-3 p-2 bg-white/20 backdrop-blur-sm rounded-lg">
              <p className={`text-xs ${avatarConfig.color} font-medium text-center`}>🗣️ Speaking...</p>
            </div>
          )}

          {error && (
            <div className="mt-3 p-2 bg-red-500/20 backdrop-blur-sm rounded-lg">
              <p className="text-xs text-red-100 font-medium text-center">⚠️ Error</p>
            </div>
          )}
        </div>

        {/* Question Content - Right Side */}
        <div className="flex-1 min-w-0">
          <div className="space-y-4">
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                <span className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                  Interview Question
                </span>
              </div>
              <h1 className="text-xl font-bold text-gray-900 leading-relaxed">{question?.text}</h1>
            </div>

            {/* Question metadata */}
            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              <div className="flex items-center space-x-1">
                <Volume2 className="w-4 h-4" />
                <span>Audio available</span>
              </div>
              <div className="flex items-center space-x-1">
                <Clock className="w-4 h-4" />
                <span>~2-3 min response</span>
              </div>
            </div>

            {/* Instructions */}
            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
              <h4 className="text-sm font-semibold text-blue-900 mb-1">How to respond:</h4>
              <p className="text-sm text-blue-800">
                Listen to the question being read aloud, then provide your response using the text area, video, or audio
                recording below.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom info bar */}
      <div className="border-t bg-gray-50 px-6 py-3">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>🎵 Browser Speech Synthesis</span>
          <span className="flex items-center space-x-2">
            <span>AI Interviewer:</span>
            <span className="font-medium">{avatarConfig.name}</span>
          </span>
        </div>
      </div>
    </Card>
  );
}
