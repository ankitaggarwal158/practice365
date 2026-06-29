import { useState } from "react";
import { matterApi } from "../api/matter.api";
import { ApiClientError } from "@/services/http-client";

export function useArchiveMatter() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const archive = async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await matterApi.archiveMatter(id);
      return result;
    } catch (err) {
      if (err instanceof ApiClientError) {
        setError(err.message);
      } else {
        setError("Failed to archive matter.");
      }
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    archive,
    isLoading,
    error,
  };
}
