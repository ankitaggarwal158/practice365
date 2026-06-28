import { useState } from "react";
import { intakeApi } from "../api/intake.api";
import { CreateIntakeRequest } from "../types/intake.types";
import { ApiClientError } from "@/services/http-client";

export function useCreateIntake() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const create = async (data: CreateIntakeRequest) => {
    setIsLoading(true);
    setError(null);
    try {
      const created = await intakeApi.createIntake(data);
      return created;
    } catch (err) {
      if (err instanceof ApiClientError) {
        setError(err.message);
      } else {
        setError("Failed to create new intake.");
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
