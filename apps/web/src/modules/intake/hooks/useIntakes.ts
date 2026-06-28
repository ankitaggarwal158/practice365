import { useState, useEffect, useCallback } from "react";
import { intakeApi, ListIntakesParams } from "../api/intake.api";
import { Intake } from "../types/intake.types";
import { ApiClientError } from "@/services/http-client";

export function useIntakes(params: ListIntakesParams) {
  const [intakes, setIntakes] = useState<Intake[]>([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 25, total: 0, pages: 1 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchIntakes = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await intakeApi.listIntakes(params);
      setIntakes(response.data);
      setPagination(response.pagination);
    } catch (err) {
      if (err instanceof ApiClientError) {
        setError(err.message);
      } else {
        setError("Failed to fetch intakes list.");
      }
    } finally {
      setIsLoading(false);
    }
  }, [params.page, params.limit, params.status, params.source, params.assignedTo, params.q]);

  useEffect(() => {
    fetchIntakes();
  }, [fetchIntakes]);

  return {
    intakes,
    pagination,
    isLoading,
    error,
    refetch: fetchIntakes,
  };
}
