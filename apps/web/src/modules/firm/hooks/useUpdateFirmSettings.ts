import { useState } from "react";
import { firmApi } from "../api/firm.api";
import { UpdateFirmSettingsRequest } from "../types/firm.types";
import { ApiClientError } from "@/services/http-client";

export function useUpdateFirmSettings() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateFirmSettings = async (data: UpdateFirmSettingsRequest) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await firmApi.updateFirmSettings(data);
      return response;
    } catch (err) {
      if (err instanceof ApiClientError) {
        setError(err.message);
        throw err;
      } else {
        setError("Failed to update regional settings.");
        throw new Error("Failed to update regional settings.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return {
    updateFirmSettings,
    isLoading,
    error,
  };
}

export default useUpdateFirmSettings;
