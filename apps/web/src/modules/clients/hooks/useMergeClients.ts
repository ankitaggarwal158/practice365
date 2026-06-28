import { useState } from "react";
import { clientApi } from "../api/client.api";
import { ApiClientError } from "@/services/http-client";

export function useMergeClients() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const merge = async (sourceClientId: string, targetClientId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const mergedClient = await clientApi.mergeClients(sourceClientId, targetClientId);
      return mergedClient;
    } catch (err) {
      if (err instanceof ApiClientError) {
        setError(err.message);
      } else {
        setError("Failed to merge client profiles.");
      }
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    merge,
    isLoading,
    error,
  };
}
