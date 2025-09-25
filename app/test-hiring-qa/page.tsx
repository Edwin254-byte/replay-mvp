"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";

// Types
interface HiringQuestion {
  id: string;
  text: string;
  type: "TEXT" | "MULTIPLE_CHOICE";
  createdAt: string;
  position: {
    title: string;
  };
  _count: {
    answers: number;
  };
}

interface HiringAnswer {
  id: string;
  response: string;
  createdAt: string;
  question: {
    text: string;
    type: "TEXT" | "MULTIPLE_CHOICE";
  };
}

interface BasicJobApplication {
  id: string;
  name: string;
  email: string;
  status: "PENDING" | "SHORTLISTED" | "REJECTED";
  positionId: string;
  createdAt: string;
}

interface JobApplication {
  id: string;
  name: string;
  email: string;
  status: "PENDING" | "SHORTLISTED" | "REJECTED";
  position: {
    title: string;
    description: string;
  };
  hiringAnswers: HiringAnswer[];
  allQuestions: {
    id: string;
    text: string;
    type: "TEXT" | "MULTIPLE_CHOICE";
  }[];
}

export default function TestHiringQAPage() {
  const [questions, setQuestions] = useState<HiringQuestion[]>([]);
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [selectedApplication, setSelectedApplication] = useState<JobApplication | null>(null);
  const [newQuestion, setNewQuestion] = useState<{ text: string; type: "TEXT" | "MULTIPLE_CHOICE" }>({
    text: "",
    type: "TEXT",
  });
  const [newAnswer, setNewAnswer] = useState({ response: "", questionId: "" });
  const [loading, setLoading] = useState(false);

  // Sample position ID for testing
  const samplePositionId = "sample-position-id";

  // Load questions
  const loadQuestions = async () => {
    try {
      const response = await fetch(`/api/hiring-questions?positionId=${samplePositionId}`);
      if (response.ok) {
        const data = await response.json();
        setQuestions(data);
      }
    } catch (error) {
      console.error("Error loading questions:", error);
    }
  };

  // Load applications
  const loadApplications = async () => {
    try {
      const response = await fetch("/api/job-applications");
      if (response.ok) {
        const data: BasicJobApplication[] = await response.json();

        // Load detailed data for each application
        const detailedApplications = await Promise.all(
          data.map(async (app: BasicJobApplication) => {
            try {
              const detailResponse = await fetch(`/api/job-applications/${app.id}`);
              if (detailResponse.ok) {
                return (await detailResponse.json()) as JobApplication;
              }
              return app as unknown as JobApplication;
            } catch (detailError) {
              console.error(`Error loading details for application ${app.id}:`, detailError);
              return app as unknown as JobApplication;
            }
          })
        );

        setApplications(detailedApplications);
      }
    } catch (loadError) {
      console.error("Error loading applications:", loadError);
    }
  };

  useEffect(() => {
    loadQuestions();
    loadApplications();
  }, []);

  // Create question
  const handleCreateQuestion = async () => {
    if (!newQuestion.text.trim()) {
      toast.error("Question text is required");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/hiring-questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: newQuestion.text,
          type: newQuestion.type,
          positionId: samplePositionId,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Question created successfully!");
        setNewQuestion({ text: "", type: "TEXT" });
        loadQuestions();
      } else {
        toast.error(data.error || "Failed to create question");
      }
    } catch (createError) {
      console.error("Create question error:", createError);
      toast.error("An error occurred while creating the question");
    } finally {
      setLoading(false);
    }
  };

  // Submit answer
  const handleSubmitAnswer = async () => {
    if (!newAnswer.response.trim() || !newAnswer.questionId || !selectedApplication) {
      toast.error("All fields are required");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/hiring-answers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          response: newAnswer.response,
          questionId: newAnswer.questionId,
          applicationId: selectedApplication.id,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Answer submitted successfully!");
        setNewAnswer({ response: "", questionId: "" });
        loadApplications();

        // Refresh selected application
        const updatedResponse = await fetch(`/api/job-applications/${selectedApplication.id}`);
        if (updatedResponse.ok) {
          const updatedApplication = await updatedResponse.json();
          setSelectedApplication(updatedApplication);
        }
      } else {
        toast.error(data.error || "Failed to submit answer");
      }
    } catch (submitError) {
      console.error("Submit answer error:", submitError);
      toast.error("An error occurred while submitting the answer");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Hiring Q&A Test</h1>
      </div>

      {/* Questions Section */}
      <Card>
        <CardHeader>
          <CardTitle>Hiring Questions</CardTitle>
          <CardDescription>Manage questions for job positions</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Create Question Form */}
          <div className="flex gap-2">
            <Input
              placeholder="Question text..."
              value={newQuestion.text}
              onChange={e => setNewQuestion({ ...newQuestion, text: e.target.value })}
              className="flex-1"
            />
            <select
              value={newQuestion.type}
              onChange={e => setNewQuestion({ ...newQuestion, type: e.target.value as "TEXT" | "MULTIPLE_CHOICE" })}
              className="px-3 py-2 border rounded-md"
            >
              <option value="TEXT">Text</option>
              <option value="MULTIPLE_CHOICE">Multiple Choice</option>
            </select>
            <Button onClick={handleCreateQuestion} disabled={loading}>
              Add Question
            </Button>
          </div>

          {/* Questions List */}
          <div className="space-y-2">
            {questions.map(question => (
              <div key={question.id} className="p-4 border rounded-lg">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-semibold">{question.text}</h3>
                    <p className="text-sm text-gray-600">
                      Type: {question.type} • {question._count.answers} answers
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Applications Section */}
      <Card>
        <CardHeader>
          <CardTitle>Job Applications</CardTitle>
          <CardDescription>View applications and their answers</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {applications.map(application => (
              <div key={application.id} className="p-4 border rounded-lg">
                <h3 className="font-semibold">{application.name}</h3>
                <p className="text-sm text-gray-600">{application.email}</p>
                <p className="text-sm">Status: {application.status}</p>
                <p className="text-sm">Answers: {application.hiringAnswers?.length || 0}</p>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2"
                      onClick={() => setSelectedApplication(application)}
                    >
                      View Details
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Application: {application.name}</DialogTitle>
                      <DialogDescription>
                        {application.position?.title} - {application.email}
                      </DialogDescription>
                    </DialogHeader>

                    {selectedApplication && (
                      <div className="space-y-4">
                        {/* Existing Answers */}
                        <div>
                          <h4 className="font-semibold mb-2">Submitted Answers</h4>
                          {selectedApplication.hiringAnswers && selectedApplication.hiringAnswers.length > 0 ? (
                            <div className="space-y-3">
                              {selectedApplication.hiringAnswers.map(answer => (
                                <div key={answer.id} className="p-3 border rounded">
                                  <p className="font-medium text-sm">{answer.question.text}</p>
                                  <p className="text-gray-700 mt-1">{answer.response}</p>
                                  <p className="text-xs text-gray-500 mt-1">
                                    {new Date(answer.createdAt).toLocaleString()}
                                  </p>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-gray-500">No answers submitted yet</p>
                          )}
                        </div>

                        {/* Answer Questions */}
                        <div>
                          <h4 className="font-semibold mb-2">Submit Answer</h4>
                          <div className="space-y-3">
                            <select
                              value={newAnswer.questionId}
                              onChange={e => setNewAnswer({ ...newAnswer, questionId: e.target.value })}
                              className="w-full px-3 py-2 border rounded-md"
                            >
                              <option value="">Select a question...</option>
                              {selectedApplication.allQuestions?.map(question => (
                                <option key={question.id} value={question.id}>
                                  {question.text}
                                </option>
                              ))}
                            </select>
                            <Textarea
                              placeholder="Enter your answer..."
                              value={newAnswer.response}
                              onChange={e => setNewAnswer({ ...newAnswer, response: e.target.value })}
                              rows={4}
                            />
                            <Button onClick={handleSubmitAnswer} disabled={loading}>
                              Submit Answer
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </DialogContent>
                </Dialog>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
