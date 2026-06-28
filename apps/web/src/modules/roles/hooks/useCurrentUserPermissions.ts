import { useState, useEffect, useCallback } from "react";
import { roleApi } from "../api/role.api";

export function useCurrentUserPermissions() {
  const [permissions, setPermissions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUserPermissions = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await roleApi.getUserRolesAndPermissions("me");
      setPermissions(data.permissions || []);
    } catch (err: any) {
      setError(err.message || "Failed to load current user permissions.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUserPermissions();
  }, [fetchUserPermissions]);

  const hasPermission = useCallback(
    (permissionCode: string) => {
      return permissions.includes(permissionCode);
    },
    [permissions]
  );

  return {
    permissions,
    hasPermission,
    isLoading,
    error,
    refetch: fetchUserPermissions,
  };
}

export default useCurrentUserPermissions;
