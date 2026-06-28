import { useState, useEffect, useCallback } from "react";
import { userApi } from "../api/user.api";
import { UserResponseData } from "../types/user.types";
import { ApiClientError } from "@/services/http-client";

export function useUser(id: string | undefined) {
  const [user, setUser] = useState<UserResponseData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUser = useCallback(async () => {
    if (!id) {
      setUser(null);
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    setError(null);
    try {
      const data = await userApi.getUser(id);
      setUser(data);
    } catch (err) {
      if (err instanceof ApiClientError) {
        setError(err.message);
      } else {
        setError("Failed to fetch user details.");
      }
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  return {
    user,
    isLoading,
    error,
    refetch: fetchUser,
  };
}
export default useUser;
