"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { loginUser, logoutUser, type AuthResponse } from "@/lib/api/auth";
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

      if (storedToken && storedUser) {
        // Verify token is still valid
        // const isValid = await verifyToken(storedToken);

        // if (isValid) {
        setTokenState(storedToken);
        setRefreshTokenState(refreshToken);
        setUserState(storedUser);
        // } else {
        //   clearAuth();
        // }
      }

      setIsLoading(false);
    };

    initAuth();
  }, []);

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
      router.push("/dashboard");
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

  const logout = async () => {
    try {
      setIsLoading(true);

      if (refreshToken) {
        await logoutUser(refreshToken);
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
