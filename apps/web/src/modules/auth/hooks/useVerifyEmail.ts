import { useState, useCallback } from "react";
import { authApi } from "../api/auth.api";
import { ApiClientError } from "@/services/http-client";

interface UseVerifyEmailReturn {
  verifyEmail: (token: string) => Promise<void>;
  isLoading: boolean;
  isSuccess: boolean;
  error: string | null;
}

/**
 * Hook for the email verification flow.
 */
export function useVerifyEmail(): UseVerifyEmailReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const verifyEmail = useCallback(async (token: string) => {
    setIsLoading(true);
    setError(null);
    setIsSuccess(false);
    try {
      await authApi.verifyEmail({ token });
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

  return { verifyEmail, isLoading, isSuccess, error };
}
