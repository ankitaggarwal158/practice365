import { useState, useEffect, useCallback } from "react";
import { conflictCheckApi } from "../api/conflict-check.api";
import { ConflictCheck } from "../types/conflict-check.types";
import { ApiClientError } from "@/services/http-client";

export function useConflictChecks(params?: { page?: number; limit?: number }) {
  const [checks, setChecks] = useState<ConflictCheck[]>([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 25, total: 0, pages: 1 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchChecks = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await conflictCheckApi.listConflictChecks(params);
      setChecks(response.data);
      setPagination(response.pagination);
    } catch (err) {
      if (err instanceof ApiClientError) {
        setError(err.message);
      } else {
        setError("Failed to retrieve conflict checks list.");
      }
    } finally {
      setIsLoading(false);
    }
  }, [params?.page, params?.limit]);

  useEffect(() => {
    fetchChecks();
  }, [fetchChecks]);

  return {
    checks,
    pagination,
    isLoading,
    error,
    refetch: fetchChecks,
  };
}
