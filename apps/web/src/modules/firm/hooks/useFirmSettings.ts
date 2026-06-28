import { useState, useEffect, useCallback } from "react";
import { firmApi } from "../api/firm.api";
import { FirmSettingsResponseData } from "../types/firm.types";
import { ApiClientError } from "@/services/http-client";

export function useFirmSettings() {
  const [settings, setSettings] = useState<FirmSettingsResponseData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSettings = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await firmApi.getFirmSettings();
      setSettings(data);
    } catch (err) {
      if (err instanceof ApiClientError) {
        setError(err.message);
      } else {
        setError("Failed to fetch regional settings.");
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  return {
    settings,
    isLoading,
    error,
    refetch: fetchSettings,
  };
}

export default useFirmSettings;
