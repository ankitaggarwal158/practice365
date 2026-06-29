import { useState } from "react";
import { matterApi } from "../api/matter.api";
import { ApiClientError } from "@/services/http-client";

export function useReopenMatter() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reopen = async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await matterApi.reopenMatter(id);
      return result;
    } catch (err) {
      if (err instanceof ApiClientError) {
        setError(err.message);
      } else {
        setError("Failed to reopen matter.");
      }
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    reopen,
    isLoading,
    error,
  };
}
