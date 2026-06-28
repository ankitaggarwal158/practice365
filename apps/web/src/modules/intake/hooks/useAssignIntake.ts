import { useState } from "react";
import { intakeApi } from "../api/intake.api";
import { ApiClientError } from "@/services/http-client";

export function useAssignIntake() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const assign = async (id: string, assignedTo: string | null) => {
    setIsLoading(true);
    setError(null);
    try {
      const updated = await intakeApi.assignIntake(id, assignedTo);
      return updated;
    } catch (err) {
      if (err instanceof ApiClientError) {
        setError(err.message);
      } else {
        setError("Failed to assign intake.");
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
