import { useState } from "react";
import { conflictCheckApi } from "../api/conflict-check.api";
import { ApiClientError } from "@/services/http-client";

export function useRunConflictCheck() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = async (leadId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const check = await conflictCheckApi.runConflictCheck(leadId);
      return check;
    } catch (err) {
      if (err instanceof ApiClientError) {
        setError(err.message);
      } else {
        setError("Failed to run conflict check search.");
      }
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    run,
    isLoading,
    error,
  };
}
