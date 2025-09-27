"use client";
import { useState, useEffect, use, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle2, Wifi, Volume2, Camera, Clock, Type, Video, Mic } from "lucide-react";
import { toast } from "sonner";
import SpeechAvatar from "@/components/interview/SpeechAvatar";

interface Question {
  id: string;
  title: string;
  text: string;
  type: string;
  order: number;
}

export default function InterviewPage({ params }: { params: Promise<{ publicId: string; appId: string }> }) {
  const { publicId, appId } = use(params);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showPrerequisites, setShowPrerequisites] = useState(true);
  const [position, setPosition] = useState<{
    title: string;
    id: string;
    introText?: string;
    farewellText?: string;
  } | null>(null);
  const [answers, setAnswers] = useState<{ [key: string]: string }>({});
  const [responseType, setResponseType] = useState<"text" | "video" | "audio">("text");
  const [saving, setSaving] = useState(false);
  const [completingInterview, setCompletingInterview] = useState(false);

  // Memoize speech callbacks to prevent unnecessary re-renders
  const handleSpeechStart = useCallback(() => {
    toast.success("Your interviewer is reading the question");
  }, []);

  const handleSpeechEnd = useCallback(() => {
    toast.info("Question completed - you can now respond");
  }, []);

  const handleSpeechError = useCallback((error: string) => {
    toast.error("Speech unavailable - question shown as text");
  }, []);

  // Memoize answer change handler to prevent unnecessary re-renders
  const handleAnswerChange = useCallback((questionId: string, value: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  }, []);

  // Memoize current question for SpeechAvatar to prevent unnecessary re-renders
  const currentQuestionForAvatar = useMemo(() => {
    const question = questions.length > 0 ? questions[currentQuestionIndex] : null;
    return question
      ? {
          id: question.id,
          text: question.text,
        }
      : null;
  }, [questions, currentQuestionIndex]);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);

      // Fetch position details
      const positionResponse = await fetch(`/api/positions/${publicId}`);
      if (positionResponse.ok) {
        const positionData = await positionResponse.json();
        setPosition(positionData);
        setQuestions(positionData.questions || []);

        // Fetch existing answers for this application
        try {
          const answersResponse = await fetch(`/api/applications/${appId}/answers`);
          if (answersResponse.ok) {
            const answersData = await answersResponse.json();
            const existingAnswers: { [key: string]: string } = {};
            answersData.answers?.forEach((answer: { questionId: string; response: string }) => {
              existingAnswers[answer.questionId] = answer.response || "";
            });
            setAnswers(existingAnswers);
          }
        } catch (error) {
          console.log("No existing answers found");
        }
      } else {
        console.error("Failed to fetch position data");
      }
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  }, [publicId, appId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSaveAnswer = async (questionId: string, answerText: string) => {
    if (!answerText.trim()) {
      toast.error("Please provide an answer before saving");
      return;
    }

    try {
      setSaving(true);
      const response = await fetch("/api/answers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          applicationId: appId,
          questionId: questionId,
          text: answerText.trim(),
        }),
      });

      if (response.ok) {
        toast.success("Answer saved successfully!");
        setAnswers(prev => ({ ...prev, [questionId]: answerText.trim() }));
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || "Failed to save answer");
      }
    } catch (error) {
      console.error("Error saving answer:", error);
      toast.error("Error saving answer");
    } finally {
      setSaving(false);
    }
  };

  const handleCompleteInterview = useCallback(async () => {
    try {
      setCompletingInterview(true);
      const response = await fetch(`/api/applications/${appId}/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (response.ok) {
        toast.success("Interview completed! Notifications sent.");
        setCurrentQuestionIndex(questions.length); // Trigger completion view
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || "Failed to complete interview");
      }
    } catch (error) {
      console.error("Error completing interview:", error);
      toast.error("Error completing interview");
    } finally {
      setCompletingInterview(false);
    }
  }, [appId, questions.length]);

  const currentQuestion = questions.length > 0 ? questions[currentQuestionIndex] : null;

  // Modified next question handler that saves automatically
  const handleNextQuestion = useCallback(async () => {
    const currentQuestionId = currentQuestion?.id || "";
    const currentAnswer = answers[currentQuestionId] || "";

    if (!currentAnswer.trim()) {
      toast.error("Please provide an answer before proceeding");
      return;
    }

    try {
      setSaving(true);

      // Save the current answer
      const response = await fetch(`/api/applications/${appId}/answers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionId: currentQuestionId,
          response: currentAnswer,
        }),
      });

      if (response.ok) {
        toast.success("Answer saved successfully!");

        // Proceed to next question or complete interview
        if (currentQuestionIndex === questions.length - 1) {
          handleCompleteInterview();
        } else {
          setCurrentQuestionIndex(currentQuestionIndex + 1);
        }
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || "Failed to save answer. Please try again.");
      }
    } catch (error) {
      console.error("Error saving answer:", error);
      toast.error("Error saving answer. Please try again.");
    } finally {
      setSaving(false);
    }
  }, [currentQuestion?.id, answers, appId, currentQuestionIndex, questions.length, handleCompleteInterview]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin mx-auto w-12 h-12 border-4 border-gray-300 border-t-blue-600 rounded-full mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Preparing Your Interview</h2>
          <p className="text-gray-600">Please wait while we set up your interview questions...</p>
        </div>
      </div>
    );
  }

  if (showPrerequisites) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-3xl mx-auto px-4">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold text-gray-900">Welcome to Your Interview</CardTitle>
              <p className="text-gray-600 mt-2">{position ? `Position: ${position.title}` : "Loading position..."}</p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Introduction Message */}
              {position?.introText && (
                <div className="bg-blue-50 rounded-lg p-4 border-l-4 border-blue-500">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-sm font-medium">👋</span>
                    </div>
                    <div>
                      <h4 className="font-medium text-blue-900 mb-2">Welcome Message</h4>
                      <p className="text-blue-800 whitespace-pre-line">{position.introText}</p>
                    </div>
                  </div>
                </div>
              )}
              {/* Prerequisites */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Before we begin, please ensure:</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start space-x-3 p-4 bg-blue-50 rounded-lg">
                    <Wifi className="w-6 h-6 text-blue-600 mt-1" />
                    <div>
                      <h4 className="font-medium text-gray-900">Stable Internet</h4>
                      <p className="text-sm text-gray-600">
                        Ensure you have a reliable internet connection to avoid interruptions
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3 p-4 bg-green-50 rounded-lg">
                    <Volume2 className="w-6 h-6 text-green-600 mt-1" />
                    <div>
                      <h4 className="font-medium text-gray-900">Clear Audio</h4>
                      <p className="text-sm text-gray-600">Test your microphone and ensure clear audio recording</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3 p-4 bg-purple-50 rounded-lg">
                    <Camera className="w-6 h-6 text-purple-600 mt-1" />
                    <div>
                      <h4 className="font-medium text-gray-900">Good Lighting</h4>
                      <p className="text-sm text-gray-600">Position yourself in a well-lit area for video responses</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3 p-4 bg-orange-50 rounded-lg">
                    <Clock className="w-6 h-6 text-orange-600 mt-1" />
                    <div>
                      <h4 className="font-medium text-gray-900">Quiet Environment</h4>
                      <p className="text-sm text-gray-600">Find a quiet space with minimal distractions</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Interview Info */}
              <div className="border-t pt-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">Interview Details:</h4>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex justify-between">
                      <span>Questions:</span>
                      <Badge variant="secondary">{questions.length} questions</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Estimated time:</span>
                      <Badge variant="secondary">
                        {questions.length * 2}-{questions.length * 3} minutes
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Format:</span>
                      <Badge variant="secondary">Speech Avatar + Text/Video responses</Badge>
                    </div>
                  </div>
                </div>
              </div>

              {/* Start Button */}
              <div className="text-center pt-6">
                <Button
                  onClick={() => setShowPrerequisites(false)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg"
                  disabled={questions.length === 0}
                >
                  <CheckCircle2 className="w-5 h-5 mr-2" />
                  Start Interview
                </Button>
                {questions.length === 0 && (
                  <p className="text-sm text-red-600 mt-2">
                    No questions available for this position. Please contact support.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-2xl w-full mx-4">
          <CardContent className="text-center py-12">
            <CheckCircle2 className="w-16 h-16 text-green-600 mx-auto mb-6" />
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Interview Complete! 🎉</h1>

            {/* Custom Farewell Message */}
            {position?.farewellText && (
              <div className="bg-green-50 rounded-lg p-4 border-l-4 border-green-500 mb-6 text-left">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-sm font-medium">💬</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-green-900 mb-2">Message from the Team</h4>
                    <p className="text-green-800 whitespace-pre-line">{position.farewellText}</p>
                  </div>
                </div>
              </div>
            )}

            <p className="text-gray-600 mb-6">
              Thank you for taking the time to complete this interview. Your responses have been submitted and
              confirmation emails have been sent to both you and the hiring team.
            </p>
            <div className="bg-blue-50 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-blue-900 mb-2">What happens next?</h3>
              <ul className="text-sm text-blue-800 space-y-1 text-left">
                <li>• You&apos;ll receive a confirmation email shortly</li>
                <li>• Our team will review your responses</li>
                <li>• You&apos;ll receive an update within 2-3 business days</li>
                <li>• We&apos;ll contact you via email with next steps</li>
              </ul>
            </div>
            <p className="text-sm text-gray-500">You can now safely close this window.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-4 lg:py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Progress Bar - Full Width */}
        <div className="mb-6">
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-slate-600 mb-2">
                Question {currentQuestionIndex + 1} of {questions.length}
              </p>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-slate-800 h-2 rounded-full transition-all"
                  style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Two-Column Layout for Large Screens */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Question & Avatar */}
          <div className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <SpeechAvatar
                  question={currentQuestionForAvatar}
                  autoPlay={true}
                  onSpeechStart={handleSpeechStart}
                  onSpeechEnd={handleSpeechEnd}
                  onSpeechError={handleSpeechError}
                />
              </CardContent>
            </Card>

            {/* Tips Card - Visible on large screens */}
            <Card className="hidden lg:block">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-3 text-gray-900">💡 Interview Tips</h3>
                <div className="space-y-3 text-sm text-gray-600">
                  <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <p>Take your time to think before responding</p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <p>Use specific examples when possible</p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <p>Keep responses concise but complete</p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <p>You can replay the question anytime</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Response Area */}
          <div className="space-y-6">
            <Card className="h-fit lg:sticky lg:top-6">
              <CardContent className="p-6">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-semibold">Your Response</h3>

                    {/* Response Type Toggle */}
                    <div className="flex items-center space-x-2">
                      <Button
                        size="sm"
                        variant={responseType === "text" ? "default" : "outline"}
                        onClick={() => setResponseType("text")}
                        className="flex items-center space-x-1"
                      >
                        <Type className="w-4 h-4" />
                        <span>Text</span>
                      </Button>
                      <Button
                        size="sm"
                        variant={responseType === "video" ? "default" : "outline"}
                        onClick={() => setResponseType("video")}
                        className="flex items-center space-x-1"
                      >
                        <Video className="w-4 h-4" />
                        <span>Video</span>
                      </Button>
                      <Button
                        size="sm"
                        variant={responseType === "audio" ? "default" : "outline"}
                        onClick={() => setResponseType("audio")}
                        className="flex items-center space-x-1"
                      >
                        <Mic className="w-4 h-4" />
                        <span>Audio</span>
                      </Button>
                    </div>
                  </div>

                  {/* Text Response */}
                  {responseType === "text" && (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Type your response below:</label>
                        <Textarea
                          placeholder="Enter your answer here... Be specific and provide examples when possible."
                          value={answers[currentQuestion?.id || ""] || ""}
                          onChange={e => handleAnswerChange(currentQuestion?.id || "", e.target.value)}
                          rows={8}
                          className="w-full resize-none focus:ring-2 focus:ring-blue-500"
                        />
                        <div className="flex justify-between items-center text-xs text-gray-500">
                          <span>{answers[currentQuestion?.id || ""]?.length || 0} characters</span>
                          <span>Recommended: 200-500 words</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Video Response */}
                  {responseType === "video" && (
                    <div className="space-y-3">
                      <label className="text-sm font-medium text-gray-700">Record a video response:</label>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center bg-gray-50 min-h-[200px] flex flex-col justify-center">
                        <Video className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500 mb-4">Video recording feature coming soon!</p>
                        <p className="text-xs text-gray-400">For now, please use the text response option above.</p>
                      </div>
                    </div>
                  )}

                  {/* Audio Response */}
                  {responseType === "audio" && (
                    <div className="space-y-3">
                      <label className="text-sm font-medium text-gray-700">Record an audio response:</label>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center bg-gray-50 min-h-[200px] flex flex-col justify-center">
                        <Mic className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500 mb-4">Audio recording feature coming soon!</p>
                        <p className="text-xs text-gray-400">For now, please use the text response option above.</p>
                      </div>
                    </div>
                  )}

                  {/* Navigation */}
                  <div className="border-t pt-6">
                    <div className="flex justify-between items-center">
                      <Button
                        onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
                        disabled={currentQuestionIndex === 0}
                        variant="outline"
                      >
                        Previous
                      </Button>

                      <div className="flex items-center space-x-3">
                        {!answers[currentQuestion?.id || ""]?.trim() && (
                          <p className="text-sm text-amber-600 hidden sm:block">
                            💡 Please provide an answer before proceeding
                          </p>
                        )}
                        <Button
                          onClick={handleNextQuestion}
                          disabled={!answers[currentQuestion?.id || ""]?.trim() || saving || completingInterview}
                          className={`${
                            answers[currentQuestion?.id || ""]?.trim()
                              ? "bg-slate-800 hover:bg-slate-700"
                              : "bg-gray-400 cursor-not-allowed"
                          } text-white`}
                        >
                          {saving
                            ? "Saving..."
                            : completingInterview
                              ? "Completing..."
                              : currentQuestionIndex === questions.length - 1
                                ? "Complete Interview"
                                : "Next Question"}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
