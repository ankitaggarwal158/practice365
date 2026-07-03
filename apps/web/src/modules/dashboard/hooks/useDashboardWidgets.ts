import { useState, useEffect, useCallback } from "react";
import { dashboardApi } from "../api/dashboard.api";
import { DashboardWidgetsData } from "../types/dashboard.types";
import { ApiClientError } from "@/services/http-client";

export function useDashboardWidgets() {
  const [widgetsData, setWidgetsData] = useState<DashboardWidgetsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWidgets = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await dashboardApi.getDashboardWidgets();
      setWidgetsData(data);
    } catch (err) {
      if (err instanceof ApiClientError) {
        setError(err.message);
      } else {
        setError("Failed to fetch dashboard widget data.");
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWidgets();
  }, [fetchWidgets]);

  return {
    widgetsData,
    isLoading,
    error,
    refetch: fetchWidgets,
  };
}
export default useDashboardWidgets;
