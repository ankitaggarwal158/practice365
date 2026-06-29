import { useState } from "react";
import { matterApi } from "../api/matter.api";
import { CreateMatterRequest } from "../types/matter.types";
import { ApiClientError } from "@/services/http-client";

export function useCreateMatter() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const create = async (data: CreateMatterRequest) => {
    setIsLoading(true);
    setError(null);
    try {
      const created = await matterApi.createMatter(data);
      return created;
    } catch (err) {
      if (err instanceof ApiClientError) {
        setError(err.message);
      } else {
        setError("Failed to create new matter.");
      }
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    create,
    isLoading,
    error,
  };
}
