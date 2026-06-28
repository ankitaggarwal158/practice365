import { useState, useEffect, useCallback } from "react";
import { conflictCheckApi } from "../api/conflict-check.api";
import { ConflictCheck } from "../types/conflict-check.types";
import { ApiClientError } from "@/services/http-client";

export function useConflictCheck(id: string | undefined) {
  const [check, setCheck] = useState<ConflictCheck | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCheck = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await conflictCheckApi.getConflictCheck(id);
      setCheck(data);
    } catch (err) {
      if (err instanceof ApiClientError) {
        setError(err.message);
      } else {
        setError("Failed to retrieve conflict check details.");
      }
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchCheck();
  }, [fetchCheck]);

  return {
    check,
    isLoading,
    error,
    refetch: fetchCheck,
  };
}
