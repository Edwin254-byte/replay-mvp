"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuestions, useApplicationQuestions, useAnswers } from "@/lib/hooks/useQuestionsAnswers";
import { QuestionWithAnswer } from "@/lib/types/questions-answers";

export default function QATestPage() {
  const [selectedPositionId, setSelectedPositionId] = useState<string>("");
  const [selectedApplicationId, setSelectedApplicationId] = useState<string>("");
  const [newQuestionText, setNewQuestionText] = useState<string>("");
  const [newQuestionType, setNewQuestionType] = useState<"TEXT" | "MULTIPLE_CHOICE">("TEXT");
  const [newQuestionOptions, setNewQuestionOptions] = useState<string[]>(["", ""]);

  // Manager-side: Question management
  const {
    questions,
    loading: questionsLoading,
    error: questionsError,
    createQuestion,
    updateQuestion,
    deleteQuestion,
    refetch: refetchQuestions,
  } = useQuestions(selectedPositionId);

  // Applicant-side: Application questions
  const {
    data: applicationData,
    loading: appQuestionsLoading,
    error: appQuestionsError,
    refetch: refetchAppQuestions,
  } = useApplicationQuestions(selectedApplicationId);

  // Applicant-side: Answer management
  const {
    answers,
    loading: answersLoading,
    error: answersError,
    submitAnswer,
    updateAnswer,
    deleteAnswer,
    refetch: refetchAnswers,
  } = useAnswers(selectedApplicationId);

  const handleCreateQuestion = async () => {
    if (!newQuestionText.trim()) return;

    try {
      const questionData = {
        text: newQuestionText.trim(),
        type: newQuestionType,
        ...(newQuestionType === "MULTIPLE_CHOICE" && {
          options: newQuestionOptions.filter(opt => opt.trim().length > 0),
        }),
      };

      await createQuestion(questionData);
      setNewQuestionText("");
      setNewQuestionOptions(["", ""]);
    } catch (error) {
      console.error("Failed to create question:", error);
    }
  };

  const handleDeleteQuestion = async (questionId: string) => {
    if (window.confirm("Are you sure you want to delete this question? All associated answers will also be deleted.")) {
      try {
        await deleteQuestion(questionId);
      } catch (error) {
        console.error("Failed to delete question:", error);
      }
    }
  };

  const handleSubmitAnswer = async (questionId: string, response: string) => {
    if (!response.trim()) return;

    try {
      await submitAnswer({ questionId, response: response.trim() });
    } catch (error) {
      console.error("Failed to submit answer:", error);
    }
  };

  const addOption = () => {
    setNewQuestionOptions([...newQuestionOptions, ""]);
  };

  const removeOption = (index: number) => {
    if (newQuestionOptions.length > 2) {
      setNewQuestionOptions(newQuestionOptions.filter((_, i) => i !== index));
    }
  };

  const updateOption = (index: number, value: string) => {
    const updated = [...newQuestionOptions];
    updated[index] = value;
    setNewQuestionOptions(updated);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Question & Answer System Test</h1>
        <p className="text-gray-600">
          Test interface for the complete Q&A system. Managers can create/edit questions, applicants can answer them.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Manager Section - Question Management */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Manager Section - Question Management</CardTitle>
              <CardDescription>Create and manage questions for positions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Position ID (for testing)</label>
                <Input
                  value={selectedPositionId}
                  onChange={e => setSelectedPositionId(e.target.value)}
                  placeholder="Enter position ID to manage questions"
                />
              </div>

              {selectedPositionId && (
                <div className="border-t pt-4 space-y-4">
                  <h3 className="font-semibold">Create New Question</h3>

                  <div>
                    <label className="block text-sm font-medium mb-2">Question Text</label>
                    <Textarea
                      value={newQuestionText}
                      onChange={e => setNewQuestionText(e.target.value)}
                      placeholder="Enter your question..."
                      rows={3}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Question Type</label>
                    <Select
                      value={newQuestionType}
                      onValueChange={(value: "TEXT" | "MULTIPLE_CHOICE") => setNewQuestionType(value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="TEXT">Text Response</SelectItem>
                        <SelectItem value="MULTIPLE_CHOICE">Multiple Choice</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {newQuestionType === "MULTIPLE_CHOICE" && (
                    <div>
                      <label className="block text-sm font-medium mb-2">Options</label>
                      <div className="space-y-2">
                        {newQuestionOptions.map((option, index) => (
                          <div key={index} className="flex gap-2">
                            <Input
                              value={option}
                              onChange={e => updateOption(index, e.target.value)}
                              placeholder={`Option ${index + 1}`}
                            />
                            {newQuestionOptions.length > 2 && (
                              <Button variant="outline" size="sm" onClick={() => removeOption(index)}>
                                Remove
                              </Button>
                            )}
                          </div>
                        ))}
                        <Button variant="outline" size="sm" onClick={addOption}>
                          Add Option
                        </Button>
                      </div>
                    </div>
                  )}

                  <Button
                    onClick={handleCreateQuestion}
                    disabled={questionsLoading || !newQuestionText.trim()}
                    className="w-full"
                  >
                    {questionsLoading ? "Creating..." : "Create Question"}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Existing Questions */}
          {selectedPositionId && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Existing Questions
                  <Button variant="outline" size="sm" onClick={refetchQuestions}>
                    Refresh
                  </Button>
                </CardTitle>
                <CardDescription>Questions for this position</CardDescription>
              </CardHeader>
              <CardContent>
                {questionsError && <p className="text-red-500 text-sm mb-4">{questionsError}</p>}

                {questionsLoading ? (
                  <p className="text-gray-500">Loading questions...</p>
                ) : questions.length === 0 ? (
                  <p className="text-gray-500">No questions found for this position.</p>
                ) : (
                  <div className="space-y-3">
                    {questions.map(question => (
                      <div key={question.id} className="border rounded p-3 space-y-2">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <p className="font-medium">{question.text}</p>
                            <div className="flex gap-2 mt-1">
                              <Badge variant="outline">{question.type}</Badge>
                              <Badge variant="secondary">Order: {question.order}</Badge>
                              {question.answerCount !== undefined && (
                                <Badge variant="default">{question.answerCount} answers</Badge>
                              )}
                            </div>
                            {question.options && (
                              <div className="mt-2">
                                <p className="text-xs font-medium text-gray-600">Options:</p>
                                <ul className="text-sm text-gray-600 ml-4">
                                  {question.options.map((option, idx) => (
                                    <li key={idx}>• {option}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                          <Button variant="destructive" size="sm" onClick={() => handleDeleteQuestion(question.id)}>
                            Delete
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Applicant Section - Answer Questions */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Applicant Section - Answer Questions</CardTitle>
              <CardDescription>View and answer questions for applications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Application ID (for testing)</label>
                <Input
                  value={selectedApplicationId}
                  onChange={e => setSelectedApplicationId(e.target.value)}
                  placeholder="Enter application ID to answer questions"
                />
              </div>

              {selectedApplicationId && (
                <Button variant="outline" onClick={refetchAppQuestions}>
                  Load Application Questions
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Application Questions */}
          {selectedApplicationId && applicationData && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Application Questions
                  <Badge variant="default">{applicationData.progress}% Complete</Badge>
                </CardTitle>
                <CardDescription>
                  {applicationData.application.position.title} - {applicationData.answeredQuestions}/
                  {applicationData.totalQuestions} answered
                </CardDescription>
              </CardHeader>
              <CardContent>
                {appQuestionsError && <p className="text-red-500 text-sm mb-4">{appQuestionsError}</p>}

                {appQuestionsLoading ? (
                  <p className="text-gray-500">Loading questions...</p>
                ) : (
                  <div className="space-y-4">
                    {applicationData.questions.map(question => (
                      <QuestionCard key={question.id} question={question} onSubmitAnswer={handleSubmitAnswer} />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Submitted Answers */}
          {selectedApplicationId && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Submitted Answers
                  <Button variant="outline" size="sm" onClick={refetchAnswers}>
                    Refresh
                  </Button>
                </CardTitle>
                <CardDescription>All answers for this application</CardDescription>
              </CardHeader>
              <CardContent>
                {answersError && <p className="text-red-500 text-sm mb-4">{answersError}</p>}

                {answersLoading ? (
                  <p className="text-gray-500">Loading answers...</p>
                ) : answers.length === 0 ? (
                  <p className="text-gray-500">No answers submitted yet.</p>
                ) : (
                  <div className="space-y-3">
                    {answers.map(answer => (
                      <div key={answer.id} className="border rounded p-3">
                        <p className="font-medium text-sm mb-1">{answer.question.text}</p>
                        <p className="text-gray-800">{answer.response}</p>
                        <div className="flex gap-2 mt-2">
                          <Badge variant="outline">{answer.question.type}</Badge>
                          <Badge variant="secondary">{new Date(answer.updatedAt).toLocaleDateString()}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

// Helper component for rendering individual questions
function QuestionCard({
  question,
  onSubmitAnswer,
}: {
  question: QuestionWithAnswer;
  onSubmitAnswer: (questionId: string, response: string) => void;
}) {
  const [response, setResponse] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleSubmit = async () => {
    if (!response.trim()) return;

    setIsSubmitting(true);
    try {
      await onSubmitAnswer(question.id, response);
      setResponse("");
    } catch (error) {
      console.error("Failed to submit answer:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="border rounded p-4 space-y-3">
      <div>
        <p className="font-medium">{question.text}</p>
        <Badge variant="outline" className="mt-1">
          {question.type}
        </Badge>
      </div>

      {question.answer ? (
        <div className="bg-green-50 border border-green-200 rounded p-3">
          <p className="text-sm text-green-800 font-medium">Already answered:</p>
          <p className="text-green-700">{question.answer.response}</p>
          <p className="text-xs text-green-600 mt-1">
            Submitted on {new Date(question.answer.updatedAt).toLocaleString()}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {question.type === "MULTIPLE_CHOICE" && question.options ? (
            <Select value={response} onValueChange={setResponse}>
              <SelectTrigger>
                <SelectValue placeholder="Select an option..." />
              </SelectTrigger>
              <SelectContent>
                {question.options.map((option: string, idx: number) => (
                  <SelectItem key={idx} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <Textarea
              value={response}
              onChange={e => setResponse(e.target.value)}
              placeholder="Type your answer here..."
              rows={3}
            />
          )}

          <Button onClick={handleSubmit} disabled={isSubmitting || !response.trim()} size="sm">
            {isSubmitting ? "Submitting..." : "Submit Answer"}
          </Button>
        </div>
      )}
    </div>
  );
}
