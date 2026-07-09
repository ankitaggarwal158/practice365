import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import systemSettingsApi from "../api/system-settings.api";
import { SystemSettings } from "../types";

export function useSystemSettings() {
  const queryClient = useQueryClient();

  const { data: settings, isLoading, error } = useQuery<SystemSettings, Error>({
    queryKey: ["systemSettings"],
    queryFn: () => systemSettingsApi.getSystemSettings(),
  });

  const { data: health, isLoading: isHealthLoading } = useQuery({
    queryKey: ["systemHealth"],
    queryFn: () => systemSettingsApi.getSystemHealth(),
    refetchInterval: 30000, // Poll health status every 30 seconds
  });

  const updateMutation = useMutation({
    mutationFn: (data: Partial<SystemSettings>) => systemSettingsApi.updateSystemSettings(data),
    onSuccess: (updated) => {
      queryClient.setQueryData(["systemSettings"], updated);
      queryClient.invalidateQueries({ queryKey: ["systemSettings"] });
    },
  });

  return {
    settings,
    health,
    isLoading: isLoading || isHealthLoading,
    error,
    updateSettings: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
  };
}
