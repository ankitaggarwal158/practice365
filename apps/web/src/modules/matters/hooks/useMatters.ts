import { useState, useEffect, useCallback } from "react";
import { matterApi, ListMattersParams } from "../api/matter.api";
import { Matter } from "../types/matter.types";
import { ApiClientError } from "@/services/http-client";

export function useMatters(params: ListMattersParams) {
  const [matters, setMatters] = useState<Matter[]>([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 25, total: 0, pages: 1 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMatters = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await matterApi.listMatters(params);
      setMatters(response.data);
      setPagination(response.pagination);
    } catch (err) {
      if (err instanceof ApiClientError) {
        setError(err.message);
      } else {
        setError("Failed to fetch matters list.");
      }
    } finally {
      setIsLoading(false);
    }
  }, [
    params.page,
    params.limit,
    params.status,
    params.priority,
    params.practiceAreaId,
    params.clientId,
    params.responsibleAttorneyId,
    params.query,
  ]);

  useEffect(() => {
    fetchMatters();
  }, [fetchMatters]);

  return {
    matters,
    pagination,
    isLoading,
    error,
    refetch: fetchMatters,
  };
}
