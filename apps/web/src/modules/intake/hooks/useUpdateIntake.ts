import { useState } from "react";
import { intakeApi } from "../api/intake.api";
import { UpdateIntakeRequest } from "../types/intake.types";
import { ApiClientError } from "@/services/http-client";

export function useUpdateIntake(id: string) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const update = async (data: UpdateIntakeRequest) => {
    setIsLoading(true);
    setError(null);
    try {
      const updated = await intakeApi.updateIntake(id, data);
      return updated;
    } catch (err) {
      if (err instanceof ApiClientError) {
        setError(err.message);
      } else {
        setError("Failed to update intake details.");
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
