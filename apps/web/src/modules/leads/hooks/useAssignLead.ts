import { useState } from "react";
import { leadApi } from "../api/lead.api";
import { ApiClientError } from "@/services/http-client";

export function useAssignLead() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const assign = async (id: string, ownerId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const updated = await leadApi.assignLead(id, ownerId);
      return updated;
    } catch (err) {
      if (err instanceof ApiClientError) {
        setError(err.message);
      } else {
        setError("Failed to assign lead owner.");
      }
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    assign,
    isLoading,
    error,
  };
}
