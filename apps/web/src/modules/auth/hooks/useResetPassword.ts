import { useState, useCallback } from "react";
import { authApi } from "../api/auth.api";
import { ApiClientError } from "@/services/http-client";

interface UseResetPasswordReturn {
  resetPassword: (token: string, password: string) => Promise<void>;
  isLoading: boolean;
  isSuccess: boolean;
  error: string | null;
  reset: () => void;
}

/**
 * Hook for the password reset flow.
 */
export function useResetPassword(): UseResetPasswordReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resetPassword = useCallback(
    async (token: string, password: string) => {
      setIsLoading(true);
      setError(null);
      setIsSuccess(false);
      try {
        await authApi.resetPassword({ token, password });
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
    },
    []
  );

  const reset = useCallback(() => {
    setIsSuccess(false);
    setError(null);
  }, []);

  return { resetPassword, isLoading, isSuccess, error, reset };
}
