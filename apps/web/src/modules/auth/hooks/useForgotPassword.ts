import { useState, useCallback } from "react";
import { authApi } from "../api/auth.api";
import { ApiClientError } from "@/services/http-client";

interface UseForgotPasswordReturn {
  forgotPassword: (email: string) => Promise<void>;
  isLoading: boolean;
  isSuccess: boolean;
  error: string | null;
  reset: () => void;
}

/**
 * Hook for the forgot password flow.
 * Always shows success to avoid revealing account existence (AUTH-006).
 */
export function useForgotPassword(): UseForgotPasswordReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const forgotPassword = useCallback(async (email: string) => {
    setIsLoading(true);
    setError(null);
    setIsSuccess(false);
    try {
      await authApi.forgotPassword({ email });
      setIsSuccess(true);
    } catch (err) {
      if (err instanceof ApiClientError) {
        setError(err.message);
      } else {
        setError("An unexpected error occurred.");
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setIsSuccess(false);
    setError(null);
  }, []);

  return { forgotPassword, isLoading, isSuccess, error, reset };
}
