"use client";
import PositionAnalytics from "@/components/dashboard/position-analytics";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Application } from "@prisma/client";
import { Copy, Eye, Plus, Trash2, X } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { getDefaultMessages } from "@/lib/default-messages";

// Type definitions
interface Question {
  id: string;
  title: string;
  text: string;
  type: string;
  source?: string;
  order: number;
  voiceType?: string;
}

interface Position {
  id: string;
  title: string;
  description: string | null;
  createdAt: Date;
  userId: string;
  questions: Question[];
  applications: Application[];
  _count: {
    applications: number;
    questions: number;
  };
}

export default function EditPositionPage() {
  const params = useParams();
  const router = useRouter();
  const [position, setPosition] = useState<Position | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [positionTitle, setPositionTitle] = useState("");
  const [positionDescription, setPositionDescription] = useState("");
  const [introText, setIntroText] = useState("");
  const [farewellText, setFarewellText] = useState("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [newQuestion, setNewQuestion] = useState({ title: "", text: "" });
  const [addingQuestion, setAddingQuestion] = useState(false);
  const [generatingAIQuestions, setGeneratingAIQuestions] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    const fetchPosition = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/positions/${params.id}`);
        if (response.ok) {
          const data = await response.json();
          setPosition(data);
          setPositionTitle(data.title);
          setPositionDescription(data.description || "");

          // Set default messages if they're empty
          const defaultMessages = getDefaultMessages(data.title);
          setIntroText(data.introText || defaultMessages.intro);
          setFarewellText(data.farewellText || defaultMessages.farewell);

          setQuestions(data.questions || []);
        } else {
          console.error("Failed to fetch position");
          toast.error("Failed to load position details");
        }
      } catch (error) {
        console.error("Error fetching position:", error);
        toast.error("Error loading position details");
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchPosition();
    }
  }, [params.id]);

  const handleCopyShareLink = () => {
    const shareUrl = `${window.location.origin}/public/${params.id}`;
    navigator.clipboard.writeText(shareUrl);
    toast.success("Share link copied to clipboard!");
  };

  const handleRestoreDefaultMessages = () => {
    if (!positionTitle.trim()) {
      toast.error("Please enter a position title first");
      return;
    }

    const defaultMessages = getDefaultMessages(positionTitle);
    setIntroText(defaultMessages.intro);
    setFarewellText(defaultMessages.farewell);
    toast.success("Default messages restored!");
  };

  const handleSavePosition = async () => {
    if (!positionTitle.trim()) {
      toast.error("Position title is required");
      return;
    }

    try {
      setSaving(true);
      const response = await fetch(`/api/positions/${params.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: positionTitle.trim(),
          description: positionDescription.trim(),
          introText: introText.trim(),
          farewellText: farewellText.trim(),
        }),
      });

      if (response.ok) {
        const { data } = await response.json();
        setPosition(data);
        toast.success("Position updated successfully!");
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || "Failed to update position");
      }
    } catch (error) {
      console.error("Error updating position:", error);
      toast.error("Error updating position");
    } finally {
      setSaving(false);
    }
  };

  const handleAddQuestion = async () => {
    if (!newQuestion.title.trim() || !newQuestion.text.trim()) {
      toast.error("Question title and text are required");
      return;
    }

    try {
      setAddingQuestion(true);
      const response = await fetch(`/api/positions/${params.id}/questions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newQuestion.title.trim(),
          text: newQuestion.text.trim(),
          type: "TEXT",
        }),
      });

      if (response.ok) {
        const { data } = await response.json();
        setQuestions(prev => [...prev, data]);
        setNewQuestion({ title: "", text: "" });
        toast.success("Question added successfully!");
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || "Failed to add question");
      }
    } catch (error) {
      console.error("Error adding question:", error);
      toast.error("Error adding question");
    } finally {
      setAddingQuestion(false);
    }
  };

  const handleGenerateAIQuestions = async () => {
    if (!positionTitle.trim()) {
      toast.error("Please save the position title first");
      return;
    }

    try {
      setGeneratingAIQuestions(true);

      // Show initial loading message
      toast.loading("🤖 AI is analyzing your position and generating questions...", {
        id: "ai-generating",
      });

      const response = await fetch(`/api/positions/${params.id}/generate-questions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionCount: 5,
          difficulty: "mid",
          categories: ["technical", "behavioral", "problem-solving"],
          replaceExisting: false, // Add to existing questions
        }),
      });

      if (response.ok) {
        const { data, message } = await response.json();

        // Add the new questions to the existing questions
        setQuestions(prev => [...prev, ...data.questions]);

        // Dismiss loading toast and show success
        toast.dismiss("ai-generating");

        if (data.isUsingFallback) {
          toast.success(
            `✨ Generated ${data.count} professional questions! Our expert templates were used while AI service was busy.`,
            { duration: 5000 }
          );
        } else {
          toast.success(`🎯 ${message}`, { duration: 4000 });
        }
      } else {
        const errorData = await response.json();
        toast.dismiss("ai-generating");
        toast.error(errorData.error || "Failed to generate questions");
      }
    } catch (error) {
      console.error("Error generating AI questions:", error);
      toast.dismiss("ai-generating");
      toast.error("Error connecting to AI service");
    } finally {
      setGeneratingAIQuestions(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-2 border-gray-300 border-t-gray-900 rounded-full"></div>
      </div>
    );
  }

  if (!position) {
    return <div>Position not found</div>;
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => router.back()} className="p-2">
            ←
          </Button>
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">{position.title}</h1>
            <p className="text-gray-600">Hiring</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" size="sm" onClick={() => setShowPreview(true)}>
            <Eye className="w-4 h-4 mr-2" />
            Preview
          </Button>
          <Button variant="outline" size="sm" onClick={handleCopyShareLink}>
            <Copy className="w-4 h-4 mr-2" />
            Copy Share Link
          </Button>
          <Button onClick={handleSavePosition} disabled={saving} className="bg-black hover:bg-gray-800 text-white">
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="edit" className="w-full">
        <TabsList className="grid w-fit grid-cols-2">
          <TabsTrigger value="edit">Edit</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="edit" className="mt-6">
          <div className="space-y-6">
            {/* Position Details Section */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-medium">Position Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="position-title">Position Title</Label>
                  <Input
                    id="position-title"
                    value={positionTitle}
                    onChange={e => setPositionTitle(e.target.value)}
                    className="w-full"
                    placeholder="Enter position title"
                  />
                </div>
                <div>
                  <Label htmlFor="position-description">Position Description</Label>
                  <Textarea
                    id="position-description"
                    value={positionDescription}
                    onChange={e => setPositionDescription(e.target.value)}
                    className="w-full"
                    placeholder="Enter position description (optional)"
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Questions Section */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-medium">Interview Questions</CardTitle>
                  <Button
                    onClick={handleGenerateAIQuestions}
                    disabled={generatingAIQuestions || !positionTitle.trim()}
                    variant="outline"
                    size="sm"
                    className="bg-gradient-to-r from-blue-500 to-purple-600 text-white border-none hover:from-blue-600 hover:to-purple-700"
                  >
                    {generatingAIQuestions ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>AI is thinking...</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <span>✨</span>
                        <span>Generate AI Questions</span>
                      </div>
                    )}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Introduction */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">Introduction</h3>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleRestoreDefaultMessages}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        🔄 Restore Defaults
                      </Button>
                      <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                        Optional
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <Avatar className="w-16 h-20">
                      <AvatarImage src="/placeholder-woman.jpg" />
                      <AvatarFallback className="bg-gray-200">👩</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <Label htmlFor="introduction">Introduction Script</Label>
                      <Textarea
                        id="introduction"
                        className="mt-2"
                        placeholder="A welcoming introduction message will be automatically generated based on your position title..."
                        rows={3}
                        value={introText}
                        onChange={e => setIntroText(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                {/* Existing Questions */}
                {questions.map((question, index) => (
                  <div key={question.id} className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-medium">{question.title || `Question ${index + 1}`}</h3>
                        {question.source === "AI_GENERATED" && (
                          <Badge
                            variant="secondary"
                            className="bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 border-blue-200"
                          >
                            ✨ AI
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            navigator.clipboard.writeText(question.text);
                            toast.success("Question copied to clipboard!");
                          }}
                        >
                          <Copy className="w-4 h-4" />
                          Copy
                        </Button>
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                          ✓
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-start space-x-4">
                      <Avatar className="w-16 h-20">
                        <AvatarImage src="/placeholder-man.jpg" />
                        <AvatarFallback className="bg-gray-200">👨</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-3">
                        <div>
                          <Label>Question Text</Label>
                          <Textarea className="mt-2" value={question.text} readOnly rows={3} />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Add New Question Form */}
                <div className="space-y-4 border-t pt-6">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">Add New Question</h3>
                    <Badge variant="outline" className="bg-blue-50 text-blue-800">
                      New
                    </Badge>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="w-16 h-20 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                      <Plus className="w-6 h-6 text-gray-400" />
                    </div>
                    <div className="flex-1 space-y-3">
                      <div>
                        <Label htmlFor="question-title">Question Title</Label>
                        <Input
                          id="question-title"
                          className="mt-2"
                          placeholder="Enter question title"
                          value={newQuestion.title}
                          onChange={e => setNewQuestion(prev => ({ ...prev, title: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="question-content">Full Question</Label>
                        <Textarea
                          id="question-content"
                          className="mt-2"
                          placeholder="Enter your question here..."
                          rows={4}
                          value={newQuestion.text}
                          onChange={e => setNewQuestion(prev => ({ ...prev, text: e.target.value }))}
                        />
                      </div>
                      <Button
                        onClick={handleAddQuestion}
                        disabled={addingQuestion || !newQuestion.title.trim() || !newQuestion.text.trim()}
                        className="bg-black hover:bg-gray-800 text-white"
                      >
                        {addingQuestion ? "Adding..." : "Add Question"}
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Farewell Message */}
                <div className="space-y-4 border-t pt-6">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">Farewell Message</h3>
                    <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                      Optional
                    </Badge>
                  </div>
                  <div className="flex items-start space-x-4">
                    <Avatar className="w-16 h-20">
                      <AvatarImage src="/placeholder-woman.jpg" />
                      <AvatarFallback className="bg-gray-200">👩</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <Label htmlFor="farewell">Farewell Message Script</Label>
                      <Textarea
                        id="farewell"
                        className="mt-2"
                        placeholder="A professional farewell message will be automatically generated based on your position title..."
                        rows={3}
                        value={farewellText}
                        onChange={e => setFarewellText(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="mt-6">
          <PositionAnalytics positionId={params.id as string} />
        </TabsContent>
      </Tabs>

      {/* Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">Interview Preview - {position.title}</DialogTitle>
            <DialogDescription>This is how candidates will experience the interview process</DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Interview Introduction */}
            <div className="space-y-4">
              <div className="flex items-center space-x-4 p-4 bg-blue-50 rounded-lg">
                <Avatar className="w-16 h-16">
                  <AvatarImage src="/placeholder-woman.jpg" />
                  <AvatarFallback className="bg-blue-500 text-white">AI</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">Welcome to your interview!</h3>
                  <p className="text-gray-600 mt-1">
                    Hi! I&apos;m your AI interviewer. I&apos;ll be asking you a few questions about the {position.title}{" "}
                    position. Please take your time to answer each question thoughtfully.
                  </p>
                </div>
              </div>
            </div>

            {/* Questions Preview */}
            {questions.length > 0 ? (
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-gray-900">Interview Questions ({questions.length})</h3>
                {questions.map((question, index) => (
                  <div key={question.id} className="space-y-4">
                    <div className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src="/placeholder-man.jpg" />
                        <AvatarFallback className="bg-gray-500 text-white">AI</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="inline-flex items-center justify-center w-6 h-6 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                            {index + 1}
                          </span>
                          <span className="text-sm font-medium text-gray-900">Question {index + 1}</span>
                        </div>
                        <p className="text-gray-800">{question.text}</p>
                      </div>
                    </div>

                    {/* Mock Answer Area */}
                    <div className="ml-16 p-4 border-2 border-dashed border-gray-200 rounded-lg">
                      <p className="text-sm text-gray-500 mb-2">Candidate&apos;s answer will appear here:</p>
                      <div className="bg-white border rounded-lg p-3 min-h-[100px] flex flex-col justify-center">
                        <div className="space-y-2 text-gray-400">
                          <div className="text-sm">[Text response area]</div>
                          <div className="text-xs">Candidates can type their response or record video/audio</div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <Plus className="h-6 w-6 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No questions added yet</h3>
                <p className="text-gray-600">Add some interview questions to see the preview</p>
              </div>
            )}

            {/* Interview Completion */}
            <div className="space-y-4 border-t pt-6">
              <div className="flex items-center space-x-4 p-4 bg-green-50 rounded-lg">
                <Avatar className="w-16 h-16">
                  <AvatarImage src="/placeholder-woman.jpg" />
                  <AvatarFallback className="bg-green-500 text-white">AI</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">Thank you for completing the interview!</h3>
                  <p className="text-gray-600 mt-1">
                    Your responses have been recorded and will be reviewed by our team. We&apos;ll get back to you
                    within 2-3 business days with the next steps.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center pt-4 border-t">
            <div className="text-sm text-gray-500">
              Share link:{" "}
              <code className="bg-gray-100 px-2 py-1 rounded text-xs">
                {window.location.origin}/public/{position.id}
              </code>
            </div>
            <Button onClick={() => setShowPreview(false)} className="bg-black hover:bg-gray-800 text-white">
              Close Preview
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
