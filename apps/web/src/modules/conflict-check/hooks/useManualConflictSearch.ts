import { useState } from "react";
import { conflictCheckApi } from "../api/conflict-check.api";
import { ManualSearchRequest } from "../types/conflict-check.types";
import { ApiClientError } from "@/services/http-client";

export function useManualConflictSearch() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = async (data: ManualSearchRequest) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await conflictCheckApi.manualSearch(data);
      return result;
    } catch (err) {
      if (err instanceof ApiClientError) {
        setError(err.message);
      } else {
        setError("Failed to run manual conflict search.");
      }
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    search,
    isLoading,
    error,
  };
}
