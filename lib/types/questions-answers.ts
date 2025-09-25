import { QuestionType, ApplicationResult } from "@prisma/client";

// Type for evaluation status
export type EvaluationStatus = "PENDING" | "IN_REVIEW" | "PASSED" | "FAILED";

// Base types from Prisma schema
export interface Question {
  id: string;
  positionId: string;
  text: string;
  type: QuestionType;
  options: string | null;
  weight: number;
  correctOption?: string | null;
  order: number;
  createdAt: Date;
  voiceType?: string | null;
  aiVideoUrl?: string | null;
  uploadedMeta?: string | null;
}

export interface Answer {
  id: string;
  applicationId: string;
  questionId: string;
  response: string;
  score?: number | null;
  recordedMeta?: string | null;
  recordedUrl?: string | null;
  startedAt?: Date | null;
  endedAt?: Date | null;
  result?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// API Request/Response types

// Question Management (Manager-side)
export interface CreateQuestionRequest {
  text: string;
  type: "TEXT" | "MULTIPLE_CHOICE";
  options?: string[];
}

export interface UpdateQuestionRequest {
  text?: string;
  type?: "TEXT" | "MULTIPLE_CHOICE";
  options?: string[];
}

export interface QuestionWithDetails extends Omit<Question, "options"> {
  options: string[] | null;
  position?: {
    title: string;
  };
  answerCount?: number;
}

export interface CreateQuestionResponse {
  success: boolean;
  data: QuestionWithDetails;
  message: string;
  error?: string;
}

export interface UpdateQuestionResponse {
  success: boolean;
  data: QuestionWithDetails;
  message: string;
  error?: string;
}

export interface DeleteQuestionResponse {
  success: boolean;
  message: string;
  data: {
    deletedQuestionId: string;
    deletedAnswersCount: number;
  };
  error?: string;
}

export interface ListQuestionsResponse {
  success: boolean;
  data: {
    questions: QuestionWithDetails[];
    position: {
      id: string;
      title: string;
    };
  };
  error?: string;
}

// Answer Management (Applicant-side)
export interface SubmitAnswerRequest {
  questionId: string;
  response: string;
}

export interface UpdateAnswerRequest {
  response: string;
}

export interface QuestionWithAnswer extends Omit<Question, "options"> {
  options: string[] | null;
  answer: {
    id: string;
    response: string;
    startedAt: Date | null;
    endedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
  } | null;
}

export interface AnswerWithDetails extends Answer {
  question: {
    id: string;
    text: string;
    type: QuestionType;
    options: string[] | null;
    order: number;
  };
  application?: {
    id: string;
    name: string;
    email: string;
    status: string;
    position: {
      id: string;
      title: string;
    };
  };
}

export interface ApplicationQuestionsResponse {
  success: boolean;
  data: {
    application: {
      id: string;
      name: string;
      email: string;
      status: string;
      position: {
        id: string;
        title: string;
        description: string;
      };
    };
    questions: QuestionWithAnswer[];
    totalQuestions: number;
    answeredQuestions: number;
    progress: number;
  };
  error?: string;
}

export interface SubmitAnswerResponse {
  success: boolean;
  data: AnswerWithDetails;
  message: string;
  error?: string;
}

export interface UpdateAnswerResponse {
  success: boolean;
  data: AnswerWithDetails;
  message: string;
  error?: string;
}

export interface DeleteAnswerResponse {
  success: boolean;
  message: string;
  data: {
    deletedAnswerId: string;
  };
  error?: string;
}

export interface ListAnswersResponse {
  success: boolean;
  data: {
    application: {
      id: string;
      name: string;
      email: string;
      status: string;
      position: {
        id: string;
        title: string;
      };
    };
    answers: AnswerWithDetails[];
    totalAnswers: number;
  };
  error?: string;
}

// Utility types
export interface QuestionOption {
  label: string;
  value: string;
}

export interface QuestionValidation {
  isValid: boolean;
  errors: string[];
}

export interface AnswerValidation {
  isValid: boolean;
  errors: string[];
  isCorrectChoice?: boolean; // For multiple choice validation
}

// Error response type
export interface ApiErrorResponse {
  error: string;
  success?: false;
  details?: string;
}

// Generic API response wrapper
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
