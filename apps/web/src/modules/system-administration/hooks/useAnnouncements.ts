import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import systemSettingsApi from "../api/system-settings.api";
import { SystemAnnouncement } from "../types";

export function useAnnouncements(options: { activeOnly?: boolean } = {}) {
  const queryClient = useQueryClient();
  const activeOnly = !!options.activeOnly;

  const { data: announcements = [], isLoading, error } = useQuery<SystemAnnouncement[], Error>({
    queryKey: ["announcements", { activeOnly }],
    queryFn: () =>
      activeOnly
        ? systemSettingsApi.listActiveAnnouncements()
        : systemSettingsApi.listAnnouncements(),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => systemSettingsApi.createAnnouncement(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["announcements"] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      systemSettingsApi.updateAnnouncement(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["announcements"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => systemSettingsApi.deleteAnnouncement(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["announcements"] });
    },
  });

  return {
    announcements,
    isLoading,
    error,
    createAnnouncement: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    updateAnnouncement: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    deleteAnnouncement: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
  };
}
export default useAnnouncements;
