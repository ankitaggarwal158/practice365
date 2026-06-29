import { useState } from "react";
import { matterApi } from "../api/matter.api";
import { ApiClientError } from "@/services/http-client";

export function useMatterTeam() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateTeam = async (id: string, teamMembers: Array<{ userId: string; role: string }>) => {
    setIsLoading(true);
    setError(null);
    try {
      const updatedMembers = await matterApi.updateMatterTeam(id, teamMembers);
      return updatedMembers;
    } catch (err) {
      if (err instanceof ApiClientError) {
        setError(err.message);
      } else {
        setError("Failed to update matter team.");
      }
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    updateTeam,
    isLoading,
    error,
  };
}
