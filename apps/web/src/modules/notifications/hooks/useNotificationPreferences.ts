import { useState, useEffect, useCallback } from "react";
import { notificationsApi } from "../api/notifications.api";
import { NotificationPreferencesData } from "../types/notifications.types";

export function useNotificationPreferences() {
  const [preferences, setPreferences] = useState<NotificationPreferencesData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPreferences = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await notificationsApi.getPreferences();
      setPreferences(data);
    } catch (err: any) {
      setError(err?.message || "Failed to load preferences");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const savePreferences = async (updatedData: Partial<NotificationPreferencesData>) => {
    setIsSaving(true);
    setError(null);
    try {
      const data = await notificationsApi.updatePreferences(updatedData);
      setPreferences(data);
      return data;
    } catch (err: any) {
      setError(err?.message || "Failed to save preferences");
      throw err;
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    fetchPreferences();
  }, [fetchPreferences]);

  return {
    preferences,
    isLoading,
    isSaving,
    error,
    refetch: fetchPreferences,
    savePreferences,
  };
}

export default useNotificationPreferences;
