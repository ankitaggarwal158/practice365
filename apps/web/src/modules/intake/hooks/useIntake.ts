import { useState, useEffect, useCallback } from "react";
import { intakeApi } from "../api/intake.api";
import { Intake } from "../types/intake.types";
import { ApiClientError } from "@/services/http-client";

export function useIntake(id: string | undefined) {
  const [intake, setIntake] = useState<Intake | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchIntake = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await intakeApi.getIntake(id);
      setIntake(data);
    } catch (err) {
      if (err instanceof ApiClientError) {
        setError(err.message);
      } else {
        setError("Failed to fetch intake details.");
      }
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchIntake();
  }, [fetchIntake]);

  return {
    intake,
    isLoading,
    error,
    refetch: fetchIntake,
  };
}
