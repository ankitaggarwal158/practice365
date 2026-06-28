import { useState } from "react";
import { leadApi } from "../api/lead.api";
import { CreateLeadRequest } from "../types/lead.types";
import { ApiClientError } from "@/services/http-client";

export function useCreateLead() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const create = async (data: CreateLeadRequest) => {
    setIsLoading(true);
    setError(null);
    try {
      const created = await leadApi.createLead(data);
      return created;
    } catch (err) {
      if (err instanceof ApiClientError) {
        setError(err.message);
      } else {
        setError("Failed to create new lead.");
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
