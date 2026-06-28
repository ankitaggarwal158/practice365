import { useState } from "react";
import { roleApi } from "../api/role.api";
import { UpdateRoleRequest } from "../types/role.types";
import { ApiClientError } from "@/services/http-client";

export function useUpdateRole() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateRole = async (id: string, data: UpdateRoleRequest) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await roleApi.updateRole(id, data);
      return response;
    } catch (err) {
      if (err instanceof ApiClientError) {
        setError(err.message);
        throw err;
      } else {
        setError("Failed to update role.");
        throw new Error("Failed to update role.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return {
    updateRole,
    isLoading,
    error,
  };
}

export default useUpdateRole;
