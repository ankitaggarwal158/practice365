import { useState } from "react";
import { leadApi } from "../api/lead.api";
import { UpdateLeadRequest } from "../types/lead.types";
import { ApiClientError } from "@/services/http-client";

export function useUpdateLead(id: string) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const update = async (data: UpdateLeadRequest) => {
    setIsLoading(true);
    setError(null);
    try {
      const updated = await leadApi.updateLead(id, data);
      return updated;
    } catch (err) {
      if (err instanceof ApiClientError) {
        setError(err.message);
      } else {
        setError("Failed to update lead details.");
      }
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    update,
    isLoading,
    error,
  };
}
