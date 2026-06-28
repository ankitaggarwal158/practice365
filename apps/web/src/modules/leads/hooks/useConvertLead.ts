import { useState } from "react";
import { leadApi } from "../api/lead.api";
import { ApiClientError } from "@/services/http-client";

export function useConvertLead() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const convert = async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const updated = await leadApi.convertLead(id);
      return updated;
    } catch (err) {
      if (err instanceof ApiClientError) {
        setError(err.message);
      } else {
        setError("Failed to convert lead to client.");
      }
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    convert,
    isLoading,
    error,
  };
}
