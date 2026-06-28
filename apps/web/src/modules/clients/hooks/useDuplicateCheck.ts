import { useState } from "react";
import { clientApi } from "../api/client.api";
import { DuplicateCheckResponse } from "../types/client.types";
import { ApiClientError } from "@/services/http-client";

export function useDuplicateCheck() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [matches, setMatches] = useState<DuplicateCheckResponse[]>([]);

  const checkDuplicates = async (params: { firstName?: string; lastName?: string; companyName?: string; email?: string }) => {
    setIsLoading(true);
    setError(null);
    try {
      const results = await clientApi.findDuplicates(params);
      setMatches(results);
      return results;
    } catch (err) {
      if (err instanceof ApiClientError) {
        setError(err.message);
      } else {
        setError("Failed to run duplicates check.");
      }
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    checkDuplicates,
    matches,
    isLoading,
    error,
  };
}
