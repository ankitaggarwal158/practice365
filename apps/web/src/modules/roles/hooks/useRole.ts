import { useState, useEffect, useCallback } from "react";
import { roleApi } from "../api/role.api";
import { RoleResponseData } from "../types/role.types";
import { ApiClientError } from "@/services/http-client";

export function useRole(id: string | undefined) {
  const [role, setRole] = useState<RoleResponseData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRole = useCallback(async () => {
    if (!id) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const data = await roleApi.getRole(id);
      setRole(data);
    } catch (err) {
      if (err instanceof ApiClientError) {
        setError(err.message);
      } else {
        setError("Failed to fetch role details.");
      }
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchRole();
  }, [fetchRole]);

  return {
    role,
    isLoading,
    error,
    refetch: fetchRole,
  };
}

export default useRole;
