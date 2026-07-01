import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import * as api from "../api/practice-area.api";
import { CreatePracticeAreaRequest, UpdatePracticeAreaRequest, ReorderPracticeAreasRequest } from "../types/practice-area.types";

export const practiceAreaKeys = {
  all: ["practice-areas"] as const,
  active: ["practice-areas", "active"] as const,
  detail: (id: string) => ["practice-areas", id] as const,
};

export function usePracticeAreas() {
  return useQuery({
    queryKey: practiceAreaKeys.all,
    queryFn: api.getPracticeAreas,
  });
}

export function useActivePracticeAreas() {
  return useQuery({
    queryKey: practiceAreaKeys.active,
    queryFn: api.getActivePracticeAreas,
  });
}

export function usePracticeArea(id: string) {
  return useQuery({
    queryKey: practiceAreaKeys.detail(id),
    queryFn: () => api.getPracticeArea(id),
    enabled: !!id,
  });
}

export function useCreatePracticeArea() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePracticeAreaRequest) => api.createPracticeArea(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: practiceAreaKeys.all });
      queryClient.invalidateQueries({ queryKey: practiceAreaKeys.active });
      toast.success("Practice area created successfully");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to create practice area");
    },
  });
}

export function useUpdatePracticeArea() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePracticeAreaRequest }) =>
      api.updatePracticeArea(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: practiceAreaKeys.all });
      queryClient.invalidateQueries({ queryKey: practiceAreaKeys.active });
      queryClient.setQueryData(practiceAreaKeys.detail(data.id), data);
      toast.success("Practice area updated successfully");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to update practice area");
    },
  });
}

export function useUpdatePracticeAreaStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      api.updatePracticeAreaStatus(id, isActive),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: practiceAreaKeys.all });
      queryClient.invalidateQueries({ queryKey: practiceAreaKeys.active });
      queryClient.setQueryData(practiceAreaKeys.detail(data.id), data);
      toast.success(data.isActive ? "Practice area activated" : "Practice area deactivated");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to update practice area status");
    },
  });
}

export function useReorderPracticeAreas() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ReorderPracticeAreasRequest) => api.reorderPracticeAreas(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: practiceAreaKeys.all });
      queryClient.invalidateQueries({ queryKey: practiceAreaKeys.active });
      toast.success("Practice areas reordered successfully");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to reorder practice areas");
    },
  });
}

export function useDeletePracticeArea() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => api.deletePracticeArea(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: practiceAreaKeys.all });
      queryClient.invalidateQueries({ queryKey: practiceAreaKeys.active });
      toast.success("Practice area deleted successfully");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to delete practice area");
    },
  });
}
