import { useState, useEffect, useCallback } from "react";
import { userApi } from "../api/user.api";
import { UserResponseData, UpdateOwnProfileRequest, UpdatePreferencesRequest } from "../types/user.types";
import { ApiClientError } from "@/services/http-client";

export function useCurrentUser() {
  const [currentUser, setCurrentUser] = useState<UserResponseData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isUpdatingPreferences, setIsUpdatingPreferences] = useState(false);

  const fetchCurrentUser = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await userApi.getUser("me");
      setCurrentUser(data);
    } catch (err) {
      if (err instanceof ApiClientError) {
        setError(err.message);
      } else {
        setError("Failed to fetch current user profile.");
      }
      setCurrentUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCurrentUser();
  }, [fetchCurrentUser]);

  const updateProfile = useCallback(async (data: UpdateOwnProfileRequest) => {
    setIsUpdatingProfile(true);
    setError(null);
    try {
      const updatedUser = await userApi.updateCurrentUser(data);
      setCurrentUser(updatedUser);
      return updatedUser;
    } catch (err) {
      if (err instanceof ApiClientError) {
        throw err;
      }
      throw new Error("Failed to update profile.");
    } finally {
      setIsUpdatingProfile(false);
    }
  }, []);

  const updatePreferences = useCallback(async (data: UpdatePreferencesRequest) => {
    setIsUpdatingPreferences(true);
    setError(null);
    try {
      const updatedUser = await userApi.updatePreferences(data);
      setCurrentUser(updatedUser);
      return updatedUser;
    } catch (err) {
      if (err instanceof ApiClientError) {
        throw err;
      }
      throw new Error("Failed to update preferences.");
    } finally {
      setIsUpdatingPreferences(false);
    }
  }, []);

  return {
    currentUser,
    isLoading,
    error,
    isUpdatingProfile,
    isUpdatingPreferences,
    refetch: fetchCurrentUser,
    updateProfile,
    updatePreferences,
  };
}
export default useCurrentUser;
