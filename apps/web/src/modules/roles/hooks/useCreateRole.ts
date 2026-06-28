import { useState } from "react";
import { roleApi } from "../api/role.api";
import { CreateRoleRequest } from "../types/role.types";
import { ApiClientError } from "@/services/http-client";

export function useCreateRole() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createRole = async (data: CreateRoleRequest) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await roleApi.createRole(data);
      return response;
    } catch (err) {
      if (err instanceof ApiClientError) {
        setError(err.message);
        throw err;
      } else {
        setError("Failed to create role.");
        throw new Error("Failed to create role.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return {
    createRole,
    isLoading,
    error,
  };
}

export default useCreateRole;
