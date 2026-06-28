import { useState } from "react";
import { clientApi } from "../api/client.api";
import { CreateClientRequest } from "../types/client.types";
import { ApiClientError } from "@/services/http-client";

export function useCreateClient() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const create = async (data: CreateClientRequest) => {
    setIsLoading(true);
    setError(null);
    try {
      const created = await clientApi.createClient(data);
      return created;
    } catch (err) {
      if (err instanceof ApiClientError) {
        setError(err.message);
      } else {
        setError("Failed to create new client.");
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
