import { useState } from "react";
import { roleApi } from "../api/role.api";
import { AssignPermissionsRequest } from "../types/role.types";
import { ApiClientError } from "@/services/http-client";

export function useAssignPermissions() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const assignPermissions = async (roleId: string, data: AssignPermissionsRequest) => {
    setIsLoading(true);
    setError(null);
    try {
      await roleApi.assignRolePermissions(roleId, data);
    } catch (err) {
      if (err instanceof ApiClientError) {
        setError(err.message);
        throw err;
      } else {
        setError("Failed to assign permissions.");
        throw new Error("Failed to assign permissions.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return {
    assignPermissions,
    isLoading,
    error,
  };
}

export default useAssignPermissions;
