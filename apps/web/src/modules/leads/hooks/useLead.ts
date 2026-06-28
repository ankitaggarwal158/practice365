import { useState, useEffect, useCallback } from "react";
import { leadApi } from "../api/lead.api";
import { Lead } from "../types/lead.types";
import { ApiClientError } from "@/services/http-client";

export function useLead(id: string | undefined) {
  const [lead, setLead] = useState<Lead | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLead = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await leadApi.getLead(id);
      setLead(data);
    } catch (err) {
      if (err instanceof ApiClientError) {
        setError(err.message);
      } else {
        setError("Failed to fetch lead details.");
      }
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchLead();
  }, [fetchLead]);

  return {
    lead,
    isLoading,
    error,
    refetch: fetchLead,
  };
}
