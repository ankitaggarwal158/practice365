import { useState, useEffect, useCallback } from "react";
import { firmApi } from "../api/firm.api";
import { FirmResponseData } from "../types/firm.types";
import { ApiClientError } from "@/services/http-client";

export function useFirm() {
  const [firm, setFirm] = useState<FirmResponseData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFirm = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await firmApi.getFirm();
      setFirm(data);
    } catch (err) {
      if (err instanceof ApiClientError) {
        setError(err.message);
      } else {
        setError("Failed to fetch firm profile details.");
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFirm();
  }, [fetchFirm]);

  return {
    firm,
    isLoading,
    error,
    refetch: fetchFirm,
  };
}

export default useFirm;
