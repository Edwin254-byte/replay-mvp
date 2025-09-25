import { toast } from "sonner";

// Consistent toast notifications for common actions
export const showToast = {
  // Success messages
  success: (message: string) => toast.success(message),

  // Error messages
  error: (message: string) => toast.error(message),

  // Loading states
  loading: (message: string) => toast.loading(message),

  // Info messages
  info: (message: string) => toast.info(message),

  // Warning messages
  warning: (message: string) => toast.warning(message),

  // Common authentication messages
  auth: {
    loginSuccess: () => toast.success("Login successful! Redirecting..."),
    loginError: (message?: string) => toast.error(message || "Login failed. Please try again."),
    logoutSuccess: () => toast.success("Signed out successfully"),
    logoutError: () => toast.error("Error signing out. Please try again."),
    unauthorized: () => toast.error("You are not authorized to perform this action"),
    sessionExpired: () => toast.error("Your session has expired. Please log in again."),
  },

  // Common CRUD operations
  crud: {
    createSuccess: (item: string) => toast.success(`${item} created successfully!`),
    createError: (item: string) => toast.error(`Failed to create ${item}. Please try again.`),
    updateSuccess: (item: string) => toast.success(`${item} updated successfully!`),
    updateError: (item: string) => toast.error(`Failed to update ${item}. Please try again.`),
    deleteSuccess: (item: string) => toast.success(`${item} deleted successfully!`),
    deleteError: (item: string) => toast.error(`Failed to delete ${item}. Please try again.`),
  },

  // Network and validation errors
  network: {
    error: () => toast.error("Network error. Please check your connection and try again."),
    timeout: () => toast.error("Request timed out. Please try again."),
    serverError: () => toast.error("Server error. Please try again later."),
  },

  validation: {
    required: (field: string) => toast.error(`${field} is required`),
    invalid: (field: string) => toast.error(`Please enter a valid ${field}`),
    tooShort: (field: string, min: number) => toast.error(`${field} must be at least ${min} characters`),
    tooLong: (field: string, max: number) => toast.error(`${field} cannot exceed ${max} characters`),
  },

  // Evaluation-specific toasts
  evaluation: {
    scoreSuccess: () => toast.success("Answer scored successfully"),
    scoreError: (error?: string) => toast.error(error || "Failed to score answer"),
    finalizeSuccess: (message?: string) => toast.success(message || "Application evaluation finalized"),
    finalizeError: (error?: string) => toast.error(error || "Failed to finalize evaluation"),
    loadingEvaluation: () => toast.loading("Loading evaluation data..."),
    workflowComplete: () => toast.success("Evaluation workflow completed successfully"),
    workflowError: (error?: string) => toast.error(error || "Evaluation workflow failed"),
  },
};
