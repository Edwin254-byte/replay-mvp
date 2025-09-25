"use client";

import { useState, useEffect, useCallback } from "react";
import {
  CreateQuestionRequest,
  UpdateQuestionRequest,
  SubmitAnswerRequest,
  UpdateAnswerRequest,
  QuestionWithDetails,
  ApplicationQuestionsResponse,
  ListQuestionsResponse,
  CreateQuestionResponse,
  UpdateQuestionResponse,
  DeleteQuestionResponse,
  SubmitAnswerResponse,
  UpdateAnswerResponse,
  DeleteAnswerResponse,
  ListAnswersResponse,
  AnswerWithDetails,
} from "@/lib/types/questions-answers";

// Hook for managing questions (Manager-side)
export const useQuestions = (positionId?: string) => {
  const [questions, setQuestions] = useState<QuestionWithDetails[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchQuestions = useCallback(async () => {
    if (!positionId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/positions/${positionId}/questions`);
      const result: ListQuestionsResponse = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Failed to fetch questions");
      }

      setQuestions(result.data.questions);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }, [positionId]);

  const createQuestion = useCallback(
    async (data: CreateQuestionRequest) => {
      if (!positionId) throw new Error("Position ID is required");

      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/positions/${positionId}/questions`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });

        const result: CreateQuestionResponse = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.error || "Failed to create question");
        }

        setQuestions(prev => [...prev, result.data]);
        return result.data;
      } catch (err) {
        const error = err instanceof Error ? err.message : "An error occurred";
        setError(error);
        throw new Error(error);
      } finally {
        setLoading(false);
      }
    },
    [positionId]
  );

  const updateQuestion = useCallback(async (questionId: string, data: UpdateQuestionRequest) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/questions/${questionId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result: UpdateQuestionResponse = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Failed to update question");
      }

      setQuestions(prev => prev.map(q => (q.id === questionId ? result.data : q)));
      return result.data;
    } catch (err) {
      const error = err instanceof Error ? err.message : "An error occurred";
      setError(error);
      throw new Error(error);
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteQuestion = useCallback(async (questionId: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/questions/${questionId}`, {
        method: "DELETE",
      });

      const result: DeleteQuestionResponse = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Failed to delete question");
      }

      setQuestions(prev => prev.filter(q => q.id !== questionId));
      return result;
    } catch (err) {
      const error = err instanceof Error ? err.message : "An error occurred";
      setError(error);
      throw new Error(error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  return {
    questions,
    loading,
    error,
    refetch: fetchQuestions,
    createQuestion,
    updateQuestion,
    deleteQuestion,
  };
};

// Hook for fetching application questions (Applicant-side)
export const useApplicationQuestions = (applicationId?: string) => {
  const [data, setData] = useState<ApplicationQuestionsResponse["data"] | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchQuestions = useCallback(async () => {
    if (!applicationId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/applications/${applicationId}/questions`);
      const result: ApplicationQuestionsResponse = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Failed to fetch application questions");
      }

      setData(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }, [applicationId]);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  return {
    data,
    loading,
    error,
    refetch: fetchQuestions,
  };
};

// Hook for managing answers (Applicant-side)
export const useAnswers = (applicationId?: string) => {
  const [answers, setAnswers] = useState<AnswerWithDetails[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAnswers = useCallback(async () => {
    if (!applicationId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/applications/${applicationId}/answers`);
      const result: ListAnswersResponse = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Failed to fetch answers");
      }

      setAnswers(result.data.answers);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }, [applicationId]);

  const submitAnswer = useCallback(
    async (data: SubmitAnswerRequest) => {
      if (!applicationId) throw new Error("Application ID is required");

      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/applications/${applicationId}/answers`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });

        const result: SubmitAnswerResponse = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.error || "Failed to submit answer");
        }

        setAnswers(prev => [...prev, result.data]);
        return result.data;
      } catch (err) {
        const error = err instanceof Error ? err.message : "An error occurred";
        setError(error);
        throw new Error(error);
      } finally {
        setLoading(false);
      }
    },
    [applicationId]
  );

  const updateAnswer = useCallback(async (answerId: string, data: UpdateAnswerRequest) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/answers/${answerId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result: UpdateAnswerResponse = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Failed to update answer");
      }

      setAnswers(prev => prev.map(a => (a.id === answerId ? result.data : a)));
      return result.data;
    } catch (err) {
      const error = err instanceof Error ? err.message : "An error occurred";
      setError(error);
      throw new Error(error);
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteAnswer = useCallback(async (answerId: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/answers/${answerId}`, {
        method: "DELETE",
      });

      const result: DeleteAnswerResponse = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Failed to delete answer");
      }

      setAnswers(prev => prev.filter(a => a.id !== answerId));
      return result;
    } catch (err) {
      const error = err instanceof Error ? err.message : "An error occurred";
      setError(error);
      throw new Error(error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnswers();
  }, [fetchAnswers]);

  return {
    answers,
    loading,
    error,
    refetch: fetchAnswers,
    submitAnswer,
    updateAnswer,
    deleteAnswer,
  };
};

// Utility hook for question validation
export const useQuestionValidation = () => {
  const validateQuestion = useCallback((text: string, type: string, options?: string[]) => {
    const errors: string[] = [];

    if (!text || text.trim().length === 0) {
      errors.push("Question text is required");
    }

    if (!["TEXT", "MULTIPLE_CHOICE"].includes(type)) {
      errors.push("Question type must be TEXT or MULTIPLE_CHOICE");
    }

    if (type === "MULTIPLE_CHOICE") {
      if (!options || !Array.isArray(options) || options.length < 2) {
        errors.push("Multiple choice questions require at least 2 options");
      } else if (!options.every(option => typeof option === "string" && option.trim().length > 0)) {
        errors.push("All options must be non-empty strings");
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }, []);

  const validateAnswer = useCallback((response: string, question?: { type: string; options: string[] | null }) => {
    const errors: string[] = [];

    if (!response || response.trim().length === 0) {
      errors.push("Response is required");
    }

    if (question?.type === "MULTIPLE_CHOICE" && question.options) {
      const isValidChoice = question.options.includes(response.trim());
      if (!isValidChoice) {
        errors.push("Response must be one of the provided options");
      }

      return {
        isValid: errors.length === 0,
        errors,
        isCorrectChoice: isValidChoice,
      };
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }, []);

  return {
    validateQuestion,
    validateAnswer,
  };
};
