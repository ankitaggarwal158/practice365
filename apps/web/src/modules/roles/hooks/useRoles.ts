import { useState, useEffect, useCallback } from "react";
import { roleApi } from "../api/role.api";
import { RoleResponseData } from "../types/role.types";
import { ApiClientError } from "@/services/http-client";

export function useRoles() {
  const [roles, setRoles] = useState<RoleResponseData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRoles = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await roleApi.listRoles();
      setRoles(data);
    } catch (err) {
      if (err instanceof ApiClientError) {
        setError(err.message);
      } else {
        setError("Failed to fetch roles.");
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  const deleteRole = async (id: string) => {
    try {
      await roleApi.deleteRole(id);
      await fetchRoles();
    } catch (err) {
      if (err instanceof ApiClientError) {
        throw new Error(err.message);
      } else {
        throw new Error("Failed to delete role.");
      }
    }
  };

  return {
    roles,
    isLoading,
    error,
    refetch: fetchRoles,
    deleteRole,
  };
}
export default useRoles;
