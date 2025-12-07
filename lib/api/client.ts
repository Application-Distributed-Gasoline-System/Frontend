// Centralized HTTP client with automatic token refresh and retry logic
import { getToken, getRefreshToken, setToken, setRefreshToken, clearAuth } from '@/lib/auth/storage';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export interface ApiError {
  message: string;
  statusCode?: number;
  originalError?: unknown;
}

export interface BackendError {
  message: string;
  statusCode?: number;
  error?: string;
  statusText?: string;
  [key: string]: unknown;
}

export interface RetryConfig {
  maxRetries?: number;
  retryDelay?: number;
  retryableStatuses?: number[];
  shouldRetry?: (error: Error, attempt: number) => boolean;
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

// Flag to prevent multiple simultaneous refresh attempts
let isRefreshing = false;
let refreshPromise: Promise<string> | null = null;

// Default retry configuration
const DEFAULT_RETRY_CONFIG: Required<RetryConfig> = {
  maxRetries: 3,
  retryDelay: 1000,
  retryableStatuses: [408, 429, 500, 502, 503, 504],
  shouldRetry: () => true,
};

/**
 * Delay execution for a specified amount of time
 */
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Check if an error is retryable
 */
function isRetryableError(error: unknown, statusCode?: number, config?: RetryConfig): boolean {
  const retryConfig = { ...DEFAULT_RETRY_CONFIG, ...config };

  // Network errors (no response)
  if (!statusCode || statusCode === 0) {
    return true;
  }

  // Check if status code is in retryable list
  return retryConfig.retryableStatuses.includes(statusCode);
}

/**
 * Calculate exponential backoff delay with jitter
 */
function getRetryDelay(attempt: number, baseDelay: number): number {
  const exponentialDelay = baseDelay * Math.pow(2, attempt);
  const jitter = Math.random() * 0.3 * exponentialDelay;
  return exponentialDelay + jitter;
}

/**
 * Extract clean error message from gRPC error format
 * Example: "9 FAILED_PRECONDITION: Driver already has a route" → "Driver already has a route"
 */
function extractGrpcErrorMessage(message: string): string {
  // gRPC pattern: number + space + ERROR_NAME + ": " + message
  const grpcPattern = /^\d+\s+\w+:\s*(.+)$/;
  const match = message.match(grpcPattern);

  if (match && match[1]) {
    return match[1];
  }

  // If not gRPC pattern, try to extract after last colon if it makes sense
  if (message.includes(':')) {
    const parts = message.split(':');
    // Take the last non-empty part after trimming
    for (let i = parts.length - 1; i >= 0; i--) {
      const trimmed = parts[i].trim();
      if (trimmed.length > 5) { // Avoid very short messages
        return trimmed;
      }
    }
  }

  return message;
}

/**
 * Refresh the access token using the stored refresh token
 */
async function refreshAccessToken(): Promise<string> {
  if (isRefreshing && refreshPromise) {
    return refreshPromise;
  }

  isRefreshing = true;
  const currentRefreshToken = getRefreshToken();

  if (!currentRefreshToken) {
    isRefreshing = false;
    throw new Error('No refresh token available');
  }

  refreshPromise = (async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken: currentRefreshToken }),
      });

      if (!response.ok) {
        throw new Error('Token refresh failed');
      }

      const data: RefreshTokenResponse = await response.json();

      setToken(data.accessToken);
      setRefreshToken(data.refreshToken);

      return data.accessToken;
    } catch (error) {
      clearAuth();
      throw error;
    } finally {
      isRefreshing = false;
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

/**
 * Enhanced fetch function with automatic token refresh and retry logic
 */
async function apiRequest(
  url: string,
  options: RequestInit & { skipAuth?: boolean; retryConfig?: RetryConfig } = {}
): Promise<Response> {
  const { skipAuth = false, retryConfig, ...fetchOptions } = options;
  const config = { ...DEFAULT_RETRY_CONFIG, ...retryConfig };

  const headers = new Headers(fetchOptions.headers);
  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  if (!skipAuth) {
    const token = getToken();
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
  }

  let lastError: Error | null = null;
  let lastResponse: Response | null = null;

  for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
    try {
      if (attempt > 0) {
        const retryDelay = getRetryDelay(attempt - 1, config.retryDelay);
        await delay(retryDelay);
      }

      let response = await fetch(url, {
        ...fetchOptions,
        headers,
      });

      lastResponse = response;

      // Handle 401 Unauthorized with token refresh
      if (response.status === 401 && !skipAuth) {
        try {
          const newToken = await refreshAccessToken();
          const retryHeaders = new Headers(headers);
          retryHeaders.set('Authorization', `Bearer ${newToken}`);

          response = await fetch(url, {
            ...fetchOptions,
            headers: retryHeaders,
          });

          lastResponse = response;
        } catch (refreshError) {
          console.error('Token refresh failed:', refreshError);

          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('auth:token-refresh-failed'));
          }

          return response;
        }
      }

      // Return successful responses or non-retryable client errors
      if (response.ok ||
        (response.status >= 400 && response.status < 500 &&
          response.status !== 408 && response.status !== 429)) {
        return response;
      }

      // Check if we should retry this error
      if (!isRetryableError(null, response.status, retryConfig)) {
        return response;
      }

      if (config.shouldRetry && !config.shouldRetry(new Error(`HTTP ${response.status}`), attempt)) {
        return response;
      }

      if (attempt < config.maxRetries) {
        console.warn(`Request failed with status ${response.status}, retrying... (attempt ${attempt + 1}/${config.maxRetries})`);
        continue;
      }

      return response;

    } catch (error) {
      lastError = error as Error;

      if (!isRetryableError(error, 0, retryConfig)) {
        throw error;
      }

      if (config.shouldRetry && !config.shouldRetry(lastError, attempt)) {
        throw error;
      }

      if (attempt < config.maxRetries) {
        console.warn(`Request failed with network error, retrying... (attempt ${attempt + 1}/${config.maxRetries})`, error);
        continue;
      }

      throw error;
    }
  }

  if (lastResponse) {
    return lastResponse;
  }
  throw lastError || new Error('Request failed after all retries');
}

/**
 * HTTP client methods with retry support
 */
export const apiClient = {
  async get(url: string, options: RequestInit & { skipAuth?: boolean; retryConfig?: RetryConfig } = {}) {
    return apiRequest(url, { ...options, method: 'GET' });
  },

  async post(url: string, data?: unknown, options: RequestInit & { skipAuth?: boolean; retryConfig?: RetryConfig } = {}) {
    return apiRequest(url, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  },

  async put(url: string, data?: unknown, options: RequestInit & { skipAuth?: boolean; retryConfig?: RetryConfig } = {}) {
    return apiRequest(url, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  },

  async patch(url: string, data?: unknown, options: RequestInit & { skipAuth?: boolean; retryConfig?: RetryConfig } = {}) {
    return apiRequest(url, {
      ...options,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  },

  async delete(url: string, options: RequestInit & { skipAuth?: boolean; retryConfig?: RetryConfig } = {}) {
    return apiRequest(url, { ...options, method: 'DELETE' });
  },
};

/**
 * Helper function to handle API errors consistently
 */
export function handleApiError(response: Response, defaultMessage: string): never {
  throw {
    message: extractGrpcErrorMessage(defaultMessage),
    statusCode: response.status,
  } as ApiError;
}

/**
 * Helper function to make API calls with proper error handling
 */
export async function makeApiCall<T>(
  apiCall: () => Promise<Response>,
  defaultErrorMessage: string
): Promise<T> {
  try {
    const response = await apiCall();

    if (!response.ok) {
      let errorData: BackendError;

      try {
        errorData = await response.json();
      } catch {
        errorData = {
          message: defaultErrorMessage,
          statusText: response.statusText
        };
      }

      // Extract and clean the error message
      const rawMessage = errorData.message || errorData.error || response.statusText || defaultErrorMessage;
      const cleanMessage = extractGrpcErrorMessage(rawMessage);

      throw {
        message: cleanMessage,
        statusCode: response.status,
        originalError: errorData
      } as ApiError;
    }

    return await response.json();
  } catch (error) {
    // If it's already an ApiError (with statusCode), re-throw it
    if ((error as ApiError).statusCode !== undefined) {
      throw error;
    }

    // For other errors, extract clean message
    const errorMessageText = error instanceof Error ? error.message : String(error);
    const cleanMessage = extractGrpcErrorMessage(errorMessageText) || defaultErrorMessage;

    throw {
      message: cleanMessage,
      statusCode: 0,
      originalError: error
    } as ApiError;
  }
}

// Export the base URL for convenience
export { API_BASE_URL };