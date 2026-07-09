import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import systemSettingsApi from "../api/system-settings.api";
import { FeatureFlag } from "../types";

export function useFeatureFlags() {
  const queryClient = useQueryClient();

  const { data: flags = [], isLoading, error } = useQuery<FeatureFlag[], Error>({
    queryKey: ["featureFlags"],
    queryFn: () => systemSettingsApi.listFeatureFlags(),
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, enabled }: { id: string; enabled: boolean }) =>
      systemSettingsApi.updateFeatureFlag(id, enabled),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["featureFlags"] });
    },
  });

  return {
    flags,
    isLoading,
    error,
    toggleFlag: (id: string, enabled: boolean) =>
      toggleMutation.mutateAsync({ id, enabled }),
    isToggling: toggleMutation.isPending,
  };
}
