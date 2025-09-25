// Type for evaluation status
export type EvaluationStatus = "PENDING" | "IN_REVIEW" | "PASSED" | "FAILED";

// Type for recorded metadata
export interface RecordedMetadata {
  filename?: string;
  mimetype?: string;
  size?: number;
  duration?: number | null;
  [key: string]: unknown;
}

// Evaluation Request Types
export interface ScoreAnswerRequest {
  score: number;
}

// Evaluation Response Types
export interface ScoreAnswerResponse {
  success: boolean;
  message: string;
  data: {
    id: string;
    score: number;
    question: {
      id: string;
      text: string;
      type: string;
      weight: number;
    };
    application: {
      id: string;
      name: string;
      email: string;
      evaluationStatus: EvaluationStatus;
    };
  };
  error?: string;
}

export interface FinalizeApplicationResponse {
  success: boolean;
  message: string;
  data: {
    application: {
      id: string;
      name: string;
      email: string;
      totalScore: number;
      evaluationStatus: EvaluationStatus;
      overallResult: string;
      position: {
        id: string;
        title: string;
      };
    };
    scoring: {
      totalScore: number;
      maxPossibleScore: number;
      scorePercentage: number;
      threshold: number;
      passed: boolean;
    };
    answers: Array<{
      id: string;
      response: string;
      score: number;
      weightedScore: number;
      question: {
        id: string;
        text: string;
        weight: number;
      };
    }>;
  };
  error?: string;
}

export interface ApplicationEvaluationResponse {
  success: boolean;
  data: {
    application: {
      id: string;
      name: string;
      email: string;
      resumeUrl: string | null;
      status: string;
      totalScore: number | null;
      evaluationStatus: EvaluationStatus;
      overallResult: string;
      startedAt: Date;
      completedAt: Date | null;
      position: {
        id: string;
        title: string;
      };
    };
    evaluation: {
      totalScore: number;
      maxPossibleScore: number;
      scorePercentage: number | null;
      threshold: number;
      isPassed: boolean;
      isFailed: boolean;
      isComplete: boolean;
      progress: {
        totalAnswers: number;
        scoredAnswers: number;
        unscoredAnswers: number;
        completionPercentage: number;
      };
    };
    answers: Array<{
      id: string;
      response: string;
      score: number | null;
      weightedScore: number | null;
      recordedMeta: RecordedMetadata | null;
      recordedUrl: string | null;
      startedAt: Date | null;
      endedAt: Date | null;
      createdAt: Date;
      updatedAt: Date;
      question: {
        id: string;
        text: string;
        type: string;
        weight: number;
        options: string[] | null;
        order: number;
      };
    }>;
  };
  error?: string;
}

// Extended types for questions with weight
export interface QuestionWithWeight {
  id: string;
  positionId: string;
  text: string;
  type: "TEXT" | "MULTIPLE_CHOICE";
  options: string[] | null;
  weight: number;
  correctOption?: string | null;
  order: number;
  voiceType?: string | null;
  aiVideoUrl?: string | null;
  uploadedMeta?: string | null;
  createdAt: Date;
}

// Extended types for answers with scores
export interface AnswerWithScore {
  id: string;
  applicationId: string;
  questionId: string;
  response: string;
  score: number | null;
  recordedMeta?: string | null;
  recordedUrl?: string | null;
  startedAt?: Date | null;
  endedAt?: Date | null;
  result?: string | null;
  createdAt: Date;
  updatedAt: Date;
  question: QuestionWithWeight;
}

// Extended application type with evaluation fields
export interface ApplicationWithEvaluation {
  id: string;
  positionId: string;
  name: string;
  email: string;
  resumeUrl?: string | null;
  startedAt: Date;
  completedAt?: Date | null;
  status: string;
  overallResult: "PENDING" | "PASSED" | "FAILED";
  totalScore: number | null;
  evaluationStatus: EvaluationStatus;
  answers: AnswerWithScore[];
  position: {
    id: string;
    title: string;
  };
}
