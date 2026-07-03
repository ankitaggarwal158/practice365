import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { timeEntryService, TimeEntryFilters } from "../services/time-entry.service";
import { TimeEntryFormData } from "../types/time-entry.types";
import { toast } from "sonner";

export const timeEntryKeys = {
  all: ["time-entries"] as const,
  lists: () => [...timeEntryKeys.all, "list"] as const,
  list: (filters: TimeEntryFilters) => [...timeEntryKeys.lists(), filters] as const,
  activeTimer: () => [...timeEntryKeys.all, "active-timer"] as const,
};

export function useTimeEntries(filters: TimeEntryFilters) {
  return useQuery({
    queryKey: timeEntryKeys.list(filters),
    queryFn: () => timeEntryService.searchEntries(filters),
  });
}

export function useTimeEntry(id: string) {
  return useQuery({
    queryKey: [...timeEntryKeys.all, "detail", id],
    queryFn: () => timeEntryService.getEntryById(id),
    enabled: !!id,
  });
}

export function useCreateTimeEntry() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: TimeEntryFormData) => timeEntryService.createEntry(data),
    onSuccess: () => {
      toast.success("Time entry created successfully");
      queryClient.invalidateQueries({ queryKey: timeEntryKeys.lists() });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to create time entry");
    }
  });
}

export function useUpdateTimeEntry() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<TimeEntryFormData> }) => timeEntryService.updateEntry(id, data),
    onSuccess: () => {
      toast.success("Time entry updated successfully");
      queryClient.invalidateQueries({ queryKey: timeEntryKeys.lists() });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to update time entry");
    }
  });
}

export function useDeleteTimeEntry() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => timeEntryService.deleteEntry(id),
    onSuccess: () => {
      toast.success("Time entry deleted successfully");
      queryClient.invalidateQueries({ queryKey: timeEntryKeys.lists() });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to delete time entry");
    }
  });
}

export function useActiveTimer() {
  return useQuery({
    queryKey: timeEntryKeys.activeTimer(),
    queryFn: () => timeEntryService.getActiveTimer(),
  });
}

export function useTimerActions() {
  const queryClient = useQueryClient();

  const onSuccessAction = () => {
    queryClient.invalidateQueries({ queryKey: timeEntryKeys.activeTimer() });
    queryClient.invalidateQueries({ queryKey: timeEntryKeys.lists() });
  };

  const startTimer = useMutation({
    mutationFn: timeEntryService.startTimer,
    onSuccess: onSuccessAction,
    onError: (error: any) => toast.error(error?.response?.data?.message || "Failed to start timer")
  });

  const pauseTimer = useMutation({
    mutationFn: timeEntryService.pauseTimer,
    onSuccess: onSuccessAction,
    onError: (error: any) => toast.error(error?.response?.data?.message || "Failed to pause timer")
  });

  const resumeTimer = useMutation({
    mutationFn: timeEntryService.resumeTimer,
    onSuccess: onSuccessAction,
    onError: (error: any) => toast.error(error?.response?.data?.message || "Failed to resume timer")
  });

  const stopTimer = useMutation({
    mutationFn: timeEntryService.stopTimer,
    onSuccess: onSuccessAction,
    onError: (error: any) => toast.error(error?.response?.data?.message || "Failed to stop timer")
  });

  return {
    startTimer,
    pauseTimer,
    resumeTimer,
    stopTimer
  };
}
