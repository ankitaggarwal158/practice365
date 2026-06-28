import { useState } from "react";
import { conflictCheckApi } from "../api/conflict-check.api";
import { ApiClientError } from "@/services/http-client";

export function useReviewConflict() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const review = async (id: string, decision: "CLEARED" | "WAIVED" | "REJECTED", reviewNotes?: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const updated = await conflictCheckApi.reviewConflict(id, decision, reviewNotes);
      return updated;
    } catch (err) {
      if (err instanceof ApiClientError) {
        setError(err.message);
      } else {
        setError("Failed to record attorney decision.");
      }
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    review,
    isLoading,
    error,
  };
}
