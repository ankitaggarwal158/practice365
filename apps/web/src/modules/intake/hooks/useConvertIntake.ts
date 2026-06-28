import { useState } from "react";
import { intakeApi } from "../api/intake.api";
import { ApiClientError } from "@/services/http-client";

export function useConvertIntake() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const convert = async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const updated = await intakeApi.convertToLead(id);
      return updated;
    } catch (err) {
      if (err instanceof ApiClientError) {
        setError(err.message);
      } else {
        setError("Failed to convert intake to lead.");
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
