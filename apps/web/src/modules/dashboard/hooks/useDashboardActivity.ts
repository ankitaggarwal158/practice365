import { useState, useEffect, useCallback } from "react";
import { dashboardApi } from "../api/dashboard.api";
import { ActivityItem } from "../types/dashboard.types";
import { ApiClientError } from "@/services/http-client";

export function useDashboardActivity() {
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchActivity = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await dashboardApi.getDashboardActivity();
      setActivity(data || []);
    } catch (err) {
      if (err instanceof ApiClientError) {
        setError(err.message);
      } else {
        setError("Failed to fetch recent activity feed.");
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchActivity();
  }, [fetchActivity]);

  return {
    activity,
    isLoading,
    error,
    refetch: fetchActivity,
  };
}
export default useDashboardActivity;
