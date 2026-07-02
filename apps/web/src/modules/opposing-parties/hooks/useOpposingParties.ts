import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import * as api from "../api/opposing-party.api";
import {
  CreateOpposingPartyRequest,
  UpdateOpposingPartyRequest,
} from "../types/opposing-party.types";

export const opposingPartyKeys = {
  all: ["opposing-parties"] as const,
  list: (params: any) => ["opposing-parties", "list", params] as const,
  detail: (id: string) => ["opposing-parties", id] as const,
  matterAssocs: (matterId: string) => ["opposing-parties", "matter", matterId] as const,
};

export function useOpposingParties(params: {
  page?: number;
  limit?: number;
  partyType?: string;
  isActive?: boolean;
  search?: string;
}) {
  return useQuery({
    queryKey: opposingPartyKeys.list(params),
    queryFn: () => api.listOpposingParties(params),
  });
}

export function useOpposingParty(id: string) {
  return useQuery({
    queryKey: opposingPartyKeys.detail(id),
    queryFn: () => api.getOpposingParty(id),
    enabled: !!id,
  });
}

export function useCreateOpposingParty() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateOpposingPartyRequest) => api.createOpposingParty(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: opposingPartyKeys.all });
      toast.success("Opposing party created successfully");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to create opposing party");
    },
  });
}

export function useUpdateOpposingParty() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateOpposingPartyRequest }) =>
      api.updateOpposingParty(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: opposingPartyKeys.all });
      queryClient.setQueryData(opposingPartyKeys.detail(data.id), data);
      toast.success("Opposing party updated successfully");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to update opposing party");
    },
  });
}

export function useDeleteOpposingParty() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => api.deleteOpposingParty(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: opposingPartyKeys.all });
      toast.success("Opposing party deleted successfully");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to delete opposing party");
    },
  });
}

export function useArchiveOpposingParty() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      api.archiveOpposingParty(id, isActive),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: opposingPartyKeys.all });
      queryClient.setQueryData(opposingPartyKeys.detail(data.id), data);
      toast.success(data.isActive ? "Opposing party activated" : "Opposing party archived");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to archive opposing party");
    },
  });
}

export function useMatterOpposingParties(matterId: string) {
  return useQuery({
    queryKey: opposingPartyKeys.matterAssocs(matterId),
    queryFn: () => api.getMatterAssociations(matterId),
    enabled: !!matterId,
  });
}

export function useLinkOpposingParties(matterId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (opposingPartyIds: string[]) => api.linkOpposingParties(matterId, opposingPartyIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: opposingPartyKeys.matterAssocs(matterId) });
      toast.success("Opposing party linked to matter");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to link opposing party");
    },
  });
}

export function useUnlinkOpposingParty(matterId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (partyId: string) => api.unlinkOpposingParty(matterId, partyId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: opposingPartyKeys.matterAssocs(matterId) });
      toast.success("Opposing party unlinked from matter");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to unlink opposing party");
    },
  });
}
