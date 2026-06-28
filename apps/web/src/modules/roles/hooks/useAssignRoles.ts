import { useState } from "react";
import { roleApi } from "../api/role.api";
import { AssignRolesRequest } from "../types/role.types";
import { ApiClientError } from "@/services/http-client";

export function useAssignRoles() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const assignRoles = async (userId: string, data: AssignRolesRequest) => {
    setIsLoading(true);
    setError(null);
    try {
      await roleApi.assignUserRoles(userId, data);
    } catch (err) {
      if (err instanceof ApiClientError) {
        setError(err.message);
        throw err;
      } else {
        setError("Failed to assign roles.");
        throw new Error("Failed to assign roles.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return {
    assignRoles,
    isLoading,
    error,
  };
}

export default useAssignRoles;
