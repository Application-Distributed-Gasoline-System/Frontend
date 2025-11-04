// Centralized HTTP client with automatic token refresh and retry logic
import { getToken, getRefreshToken, setToken, setRefreshToken, clearAuth } from '@/lib/auth/storage';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

export interface ApiError {
  message: string;
  statusCode?: number;
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
  retryDelay: 1000, // 1 second
  retryableStatuses: [408, 429, 500, 502, 503, 504], // Request Timeout, Too Many Requests, Server Errors
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
 * Calculate exponential backoff delay
 */
function getRetryDelay(attempt: number, baseDelay: number): number {
  // Exponential backoff: baseDelay * 2^attempt with jitter
  const exponentialDelay = baseDelay * Math.pow(2, attempt);
  const jitter = Math.random() * 0.3 * exponentialDelay; // Add up to 30% jitter
  return exponentialDelay + jitter;
}

/**
 * Refresh the access token using the stored refresh token
 */
async function refreshAccessToken(): Promise<string> {
  if (isRefreshing && refreshPromise) {
    // If already refreshing, return the existing promise
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
      
      // Store new tokens
      setToken(data.accessToken);
      setRefreshToken(data.refreshToken);
      
      return data.accessToken;
    } catch (error) {
      // If refresh fails, clear auth and throw error
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

  // Prepare headers using the Headers API so we can call .set safely
  const headers = new Headers(fetchOptions.headers);
  // Ensure Content-Type is set to application/json if not already present
  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  // Add auth token if not skipping auth
  if (!skipAuth) {
    const token = getToken();
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
  }

  let lastError: Error | null = null;
  let lastResponse: Response | null = null;

  // Retry loop
  for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
    try {
      // Add delay for retries (not on first attempt)
      if (attempt > 0) {
        const retryDelay = getRetryDelay(attempt - 1, config.retryDelay);
        await delay(retryDelay);
      }

      // Make the request
      let response = await fetch(url, {
        ...fetchOptions,
        headers,
      });

      lastResponse = response;

      // If we get a 401 and we're not skipping auth, try to refresh the token
      if (response.status === 401 && !skipAuth) {
        try {
          // Refresh the token
          const newToken = await refreshAccessToken();
          // Retry the request with the new token
          const retryHeaders = new Headers(headers);
          retryHeaders.set('Authorization', `Bearer ${newToken}`);
          response = await fetch(url, {
            ...fetchOptions,
            headers: retryHeaders,
          });

          lastResponse = response;
        } catch (refreshError) {
          // If refresh fails, redirect to login will be handled by auth context
          console.error('Token refresh failed:', refreshError);

          // Emit a custom event that the auth context can listen to
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('auth:token-refresh-failed'));
          }

          return response;
        }
      }

      // If the response is successful or it's a client error (4xx) that's not retryable, return it
      if (response.ok || (response.status >= 400 && response.status < 500 && response.status !== 408 && response.status !== 429)) {
        return response;
      }

      // Check if we should retry this error
      if (!isRetryableError(null, response.status, retryConfig)) {
        return response;
      }

      // Check custom retry logic
      if (config.shouldRetry && !config.shouldRetry(new Error(`HTTP ${response.status}`), attempt)) {
        return response;
      }

      // If this is not the last attempt, continue to retry
      if (attempt < config.maxRetries) {
        console.warn(`Request failed with status ${response.status}, retrying... (attempt ${attempt + 1}/${config.maxRetries})`);
        continue;
      }

      // Last attempt failed, return the response
      return response;

    } catch (error) {
      lastError = error as Error;

      // Check if we should retry this error
      if (!isRetryableError(error, 0, retryConfig)) {
        throw error;
      }

      // Check custom retry logic
      if (config.shouldRetry && !config.shouldRetry(lastError, attempt)) {
        throw error;
      }

      // If this is not the last attempt, continue to retry
      if (attempt < config.maxRetries) {
        console.warn(`Request failed with network error, retrying... (attempt ${attempt + 1}/${config.maxRetries})`, error);
        continue;
      }

      // Last attempt failed, throw the error
      throw error;
    }
  }

  // This should never be reached, but TypeScript needs a return statement
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
    message: defaultMessage,
    statusCode: response.status,
  } as ApiError;
}

/**
 * Helper function to make API calls with proper error handling
 */
export async function makeApiCall<T>(
  apiCall: () => Promise<Response>,
  errorMessage: string
): Promise<T> {
  try {
    const response = await apiCall();
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: errorMessage }));
      throw {
        message: errorData.message || errorMessage,
        statusCode: response.status,
      } as ApiError;
    }

    return await response.json();
  } catch (error) {
    if ((error as ApiError).statusCode) {
      throw error;
    }
    throw {
      message: 'Network error. Please check your connection.',
      statusCode: 0,
    } as ApiError;
  }
}

// Export the base URL for convenience
export { API_BASE_URL };