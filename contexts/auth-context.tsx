"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import {
  loginUser,
  logoutUser,
  refreshAccessToken,
  type AuthResponse,
} from "@/lib/api/auth";
import {
  getToken,
  setToken,
  getUser,
  setUser,
  clearAuth,
  setRefreshToken,
  type StoredUser,
  getRefreshToken,
} from "@/lib/auth/storage";

interface AuthContextType {
  user: StoredUser | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<boolean>;
  error: string | null;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<StoredUser | null>(null);
  const [token, setTokenState] = useState<string | null>(null);
  const [refreshToken, setRefreshTokenState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Initialize auth state from storage
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = getToken();
      const refreshToken = getRefreshToken();
      const storedUser = getUser();

      if (storedToken && storedUser && refreshToken) {
        setTokenState(storedToken);
        setRefreshTokenState(refreshToken);
        setUserState(storedUser);
      }

      setIsLoading(false);
    };

    initAuth();
  }, []);

  // Listen for token refresh failures from the API client
  useEffect(() => {
    const handleTokenRefreshFailed = () => {
      clearAuth();
      setTokenState(null);
      setRefreshTokenState(null);
      setUserState(null);
      router.push("/login");
    };

    window.addEventListener(
      "auth:token-refresh-failed",
      handleTokenRefreshFailed
    );

    return () => {
      window.removeEventListener(
        "auth:token-refresh-failed",
        handleTokenRefreshFailed
      );
    };
  }, [router]);

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const response: AuthResponse = await loginUser({ email, password });

      // Store auth data
      setToken(response.accessToken);
      setRefreshToken(response.refreshToken);
      setUser(response.user);

      // Update state
      setTokenState(response.accessToken);
      setRefreshTokenState(response.refreshToken);
      setUserState(response.user);

      // Redirect to dashboard
      if (response.user.role === "DRIVER") {
        router.push("/dashboard/routes");
      } else {
        router.push("/dashboard");
      }
    } catch (err: unknown) {
      let errorMessage = "Login failed. Please try again.";
      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (typeof err === "string") {
        errorMessage = err;
      }
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const refreshTokenMethod = async (): Promise<boolean> => {
    try {
      const currentRefreshToken = getRefreshToken();
      const currentToken = getToken();
      if (!currentRefreshToken) {
        throw new Error("No refresh token available");
      }

      if (!currentToken) {
        throw new Error("No token available");
      }

      const response: AuthResponse = await refreshAccessToken(
        currentRefreshToken,
        currentToken
      );

      // Update tokens and user data in storage
      setToken(response.accessToken);
      setRefreshToken(response.refreshToken);
      setUser(response.user);

      // Update state
      setTokenState(response.accessToken);
      setRefreshTokenState(response.refreshToken);
      setUserState(response.user);

      return true;
    } catch (err) {
      console.error("Token refresh failed:", err);
      // Clear auth state
      clearAuth();
      setTokenState(null);
      setRefreshTokenState(null);
      setUserState(null);
      return false;
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);

      if (refreshToken && token) {
        await logoutUser(refreshToken, token);
      }
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      // Clear auth state regardless of API call result
      clearAuth();
      setTokenState(null);
      setRefreshTokenState(null);
      setUserState(null);
      setIsLoading(false);

      // Redirect to login
      router.push("/login");
    }
  };

  const clearError = () => {
    setError(null);
  };

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    isAuthenticated: !!user && !!token,
    login,
    logout,
    refreshToken: refreshTokenMethod,
    error,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
