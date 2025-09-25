"use client";
import { useState, useEffect, use } from "react";

interface Question {
  id: string;
  title: string;
  prompt: string;
  voiceType: string;
  order: number;
}

export default function InterviewPage({ params }: { params: Promise<{ publicId: string; appId: string }> }) {
  const { publicId, appId } = use(params);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedFiles, setRecordedFiles] = useState<{ [key: string]: File }>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      const response = await fetch(`/api/applications/${appId}/questions`);
      if (response.ok) {
        const data = await response.json();
        setQuestions(data.questions);
      }
    } catch (error) {
      console.error("Error fetching questions:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (file: File, questionId: string) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("questionId", questionId);
    formData.append("applicationId", appId);

    try {
      const response = await fetch("/api/answers", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        setRecordedFiles(prev => ({ ...prev, [questionId]: file }));
      }
    } catch (error) {
      console.error("Error uploading answer:", error);
    }
  };

  const currentQuestion = questions[currentQuestionIndex];

  if (loading) {
    return <div className="text-center mt-12">Loading interview questions...</div>;
  }

  if (!currentQuestion) {
    return (
      <div className="max-w-2xl mx-auto mt-12 text-center">
        <h1 className="text-2xl font-semibold mb-4">Interview Complete!</h1>
        <p>Thank you for completing the interview. We will be in touch soon.</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto mt-12">
      <div className="mb-6">
        <p className="text-sm text-slate-600 mb-2">
          Question {currentQuestionIndex + 1} of {questions.length}
        </p>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-slate-800 h-2 rounded-full transition-all"
            style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
          />
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold mb-4">{currentQuestion.title}</h1>
          <p className="text-slate-700 mb-6">{currentQuestion.prompt}</p>
        </div>

        <div className="border rounded p-4">
          <h3 className="font-medium mb-3">Record Your Answer</h3>

          {currentQuestion.voiceType === "video" && (
            <div className="space-y-4">
              <p className="text-sm text-slate-600">Please record a video response:</p>
              <input
                type="file"
                accept="video/*"
                onChange={e => {
                  const file = e.target.files?.[0];
                  if (file) {
                    handleFileUpload(file, currentQuestion.id);
                  }
                }}
                className="w-full border rounded p-2"
              />
            </div>
          )}

          {recordedFiles[currentQuestion.id] && (
            <p className="text-green-600 text-sm mt-2">✓ Answer recorded: {recordedFiles[currentQuestion.id].name}</p>
          )}
        </div>

        <div className="flex justify-between">
          <button
            onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
            disabled={currentQuestionIndex === 0}
            className="px-4 py-2 border rounded disabled:opacity-50"
          >
            Previous
          </button>

          <button
            onClick={() => setCurrentQuestionIndex(currentQuestionIndex + 1)}
            className="px-4 py-2 bg-slate-800 text-white rounded"
          >
            {currentQuestionIndex === questions.length - 1 ? "Complete Interview" : "Next Question"}
          </button>
        </div>
      </div>
    </div>
  );
}
