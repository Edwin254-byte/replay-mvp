import { useState } from "react";
import {
  ScoreAnswerRequest,
  ScoreAnswerResponse,
  FinalizeApplicationResponse,
  ApplicationEvaluationResponse,
} from "@/lib/types/evaluations";

// Hook for scoring individual answers
export function useScoreAnswer() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const scoreAnswer = async (answerId: string, score: number): Promise<ScoreAnswerResponse> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/evaluations/answer/${answerId}/score`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ score } as ScoreAnswerRequest),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to score answer");
      }

      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to score answer";
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    scoreAnswer,
    loading,
    error,
  };
}

// Hook for finalizing application evaluation
export function useFinalizeApplication() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const finalizeApplication = async (applicationId: string): Promise<FinalizeApplicationResponse> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/evaluations/application/${applicationId}/finalize`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to finalize application evaluation");
      }

      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to finalize application evaluation";
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    finalizeApplication,
    loading,
    error,
  };
}

// Hook for fetching application evaluation details
export function useApplicationEvaluation(applicationId?: string) {
  const [data, setData] = useState<ApplicationEvaluationResponse["data"] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchEvaluation = async (id?: string): Promise<ApplicationEvaluationResponse> => {
    const targetId = id || applicationId;
    if (!targetId) {
      throw new Error("Application ID is required");
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/evaluations/application/${targetId}`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to fetch application evaluation");
      }

      setData(result.data);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch application evaluation";
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const refetch = () => fetchEvaluation();

  return {
    data,
    loading,
    error,
    fetchEvaluation,
    refetch,
  };
}

// Combined hook for complete evaluation workflow
export function useEvaluationWorkflow() {
  const scoreAnswer = useScoreAnswer();
  const finalizeApplication = useFinalizeApplication();
  const applicationEvaluation = useApplicationEvaluation();

  const [workflowLoading, setWorkflowLoading] = useState(false);
  const [workflowError, setWorkflowError] = useState<string | null>(null);

  // Score multiple answers at once
  const scoreMultipleAnswers = async (scores: Array<{ answerId: string; score: number }>) => {
    setWorkflowLoading(true);
    setWorkflowError(null);

    try {
      const results = [];
      for (const { answerId, score } of scores) {
        const result = await scoreAnswer.scoreAnswer(answerId, score);
        results.push(result);
      }
      return results;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to score multiple answers";
      setWorkflowError(errorMessage);
      throw err;
    } finally {
      setWorkflowLoading(false);
    }
  };

  // Complete evaluation workflow: score answers then finalize
  const completeEvaluation = async (applicationId: string, scores: Array<{ answerId: string; score: number }>) => {
    setWorkflowLoading(true);
    setWorkflowError(null);

    try {
      // First, score all answers
      await scoreMultipleAnswers(scores);

      // Then finalize the application
      const finalizeResult = await finalizeApplication.finalizeApplication(applicationId);

      // Refresh evaluation data
      await applicationEvaluation.fetchEvaluation(applicationId);

      return finalizeResult;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to complete evaluation workflow";
      setWorkflowError(errorMessage);
      throw err;
    } finally {
      setWorkflowLoading(false);
    }
  };

  return {
    // Individual hooks
    scoreAnswer,
    finalizeApplication,
    applicationEvaluation,

    // Workflow methods
    scoreMultipleAnswers,
    completeEvaluation,

    // Workflow state
    workflowLoading: workflowLoading || scoreAnswer.loading || finalizeApplication.loading,
    workflowError: workflowError || scoreAnswer.error || finalizeApplication.error,
  };
}
