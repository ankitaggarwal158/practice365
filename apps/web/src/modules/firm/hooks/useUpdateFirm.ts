import { useState } from "react";
import { firmApi } from "../api/firm.api";
import { UpdateFirmRequest, UpdateFirmBrandingRequest } from "../types/firm.types";
import { ApiClientError } from "@/services/http-client";

export function useUpdateFirm() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateFirm = async (data: UpdateFirmRequest) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await firmApi.updateFirm(data);
      return response;
    } catch (err) {
      if (err instanceof ApiClientError) {
        setError(err.message);
        throw err;
      } else {
        setError("Failed to update firm details.");
        throw new Error("Failed to update firm details.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const updateBranding = async (data: UpdateFirmBrandingRequest) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await firmApi.updateBranding(data);
      return response;
    } catch (err) {
      if (err instanceof ApiClientError) {
        setError(err.message);
        throw err;
      } else {
        setError("Failed to update firm branding.");
        throw new Error("Failed to update firm branding.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return {
    updateFirm,
    updateBranding,
    isLoading,
    error,
  };
}

export default useUpdateFirm;
