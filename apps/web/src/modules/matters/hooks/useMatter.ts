import { useState, useEffect, useCallback } from "react";
import { matterApi } from "../api/matter.api";
import { Matter } from "../types/matter.types";
import { ApiClientError } from "@/services/http-client";

export function useMatter(id: string | undefined) {
  const [matter, setMatter] = useState<Matter | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMatter = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await matterApi.getMatter(id);
      setMatter(data);
    } catch (err) {
      if (err instanceof ApiClientError) {
        setError(err.message);
      } else {
        setError("Failed to fetch matter details.");
      }
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchMatter();
  }, [fetchMatter]);

  return {
    matter,
    isLoading,
    error,
    refetch: fetchMatter,
  };
}
