import { useState, useEffect, useCallback } from "react";
import { dashboardApi } from "../api/dashboard.api";
import { DashboardSummary } from "../types/dashboard.types";
import { ApiClientError } from "@/services/http-client";

export function useDashboard() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSummary = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await dashboardApi.getDashboardSummary();
      setSummary(data);
    } catch (err) {
      if (err instanceof ApiClientError) {
        setError(err.message);
      } else {
        setError("Failed to fetch dashboard summary.");
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  return {
    summary,
    isLoading,
    error,
    refetch: fetchSummary,
  };
}
export default useDashboard;
