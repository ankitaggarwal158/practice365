import { useState } from "react";
import { matterApi } from "../api/matter.api";
import { UpdateMatterRequest } from "../types/matter.types";
import { ApiClientError } from "@/services/http-client";

export function useUpdateMatter() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const update = async (id: string, data: UpdateMatterRequest) => {
    setIsLoading(true);
    setError(null);
    try {
      const updated = await matterApi.updateMatter(id, data);
      return updated;
    } catch (err) {
      if (err instanceof ApiClientError) {
        setError(err.message);
      } else {
        setError("Failed to update matter.");
      }
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const updated = await matterApi.updateMatterStatus(id, status);
      return updated;
    } catch (err) {
      if (err instanceof ApiClientError) {
        setError(err.message);
      } else {
        setError("Failed to update status.");
      }
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const changeResponsibleAttorney = async (id: string, responsibleAttorneyId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const updated = await matterApi.changeResponsibleAttorney(id, responsibleAttorneyId);
      return updated;
    } catch (err) {
      if (err instanceof ApiClientError) {
        setError(err.message);
      } else {
        setError("Failed to change responsible attorney.");
      }
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    update,
    updateStatus,
    changeResponsibleAttorney,
    isLoading,
    error,
  };
}
