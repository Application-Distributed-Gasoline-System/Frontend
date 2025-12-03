import { toast } from "sonner";

/**
 * Extract error message from unknown error type
 * @param error - The error object (unknown type)
 * @param defaultMessage - Fallback message if error can't be parsed
 * @returns Formatted error message string
 */
export function getErrorMessage(error: unknown, defaultMessage: string): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === "string") {
    return error;
  }
  return defaultMessage;
}

/**
 * Handle API errors by displaying a toast notification
 * @param error - The error object (unknown type)
 * @param defaultMessage - Fallback message if error can't be parsed
 */
export function handleApiError(error: unknown, defaultMessage: string): void {
  const message = getErrorMessage(error, defaultMessage);
  toast.error(message);
}

/**
 * Handle API success by displaying a toast notification
 * @param message - Success message to display
 */
export function handleApiSuccess(message: string): void {
  toast.success(message);
}
