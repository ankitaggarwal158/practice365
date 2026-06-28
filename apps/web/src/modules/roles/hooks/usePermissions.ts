import { useState, useEffect, useCallback } from "react";
import { roleApi } from "../api/role.api";
import { PermissionResponseData } from "../types/role.types";
import { ApiClientError } from "@/services/http-client";

export function usePermissions() {
  const [permissions, setPermissions] = useState<PermissionResponseData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPermissions = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await roleApi.listPermissions();
      setPermissions(data);
    } catch (err) {
      if (err instanceof ApiClientError) {
        setError(err.message);
      } else {
        setError("Failed to fetch permissions.");
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPermissions();
  }, [fetchPermissions]);

  return {
    permissions,
    isLoading,
    error,
    refetch: fetchPermissions,
  };
}

export default usePermissions;
