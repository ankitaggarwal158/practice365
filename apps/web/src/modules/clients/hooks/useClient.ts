import { useState, useEffect, useCallback } from "react";
import { clientApi } from "../api/client.api";
import { Client } from "../types/client.types";
import { ApiClientError } from "@/services/http-client";

export function useClient(id: string | undefined) {
  const [client, setClient] = useState<Client | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchClient = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await clientApi.getClient(id);
      setClient(data);
    } catch (err) {
      if (err instanceof ApiClientError) {
        setError(err.message);
      } else {
        setError("Failed to fetch client details.");
      }
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchClient();
  }, [fetchClient]);

  return {
    client,
    isLoading,
    error,
    refetch: fetchClient,
  };
}
