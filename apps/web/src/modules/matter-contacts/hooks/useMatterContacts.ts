import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import * as api from "../api/matter-contact.api";
import {
  CreateMatterContactRequest,
  UpdateMatterContactRequest,
  ContactRole,
} from "../types/matter-contact.types";

export const matterContactKeys = {
  all: ["matter-contacts"] as const,
  list: (params: any) => ["matter-contacts", "list", params] as const,
  detail: (id: string) => ["matter-contacts", id] as const,
  matterLinks: (matterId: string) => ["matter-contacts", "matter", matterId] as const,
};

export function useMatterContacts(params: {
  page?: number;
  limit?: number;
  contactType?: string;
  isActive?: boolean;
  search?: string;
}) {
  return useQuery({
    queryKey: matterContactKeys.list(params),
    queryFn: () => api.listMatterContacts(params),
  });
}

export function useMatterContact(id: string) {
  return useQuery({
    queryKey: matterContactKeys.detail(id),
    queryFn: () => api.getMatterContact(id),
    enabled: !!id,
  });
}

export function useCreateMatterContact() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateMatterContactRequest) => api.createMatterContact(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: matterContactKeys.all });
      toast.success("Matter contact created successfully");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to create matter contact");
    },
  });
}

export function useUpdateMatterContact() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateMatterContactRequest }) =>
      api.updateMatterContact(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: matterContactKeys.all });
      queryClient.setQueryData(matterContactKeys.detail(data.id), data);
      toast.success("Matter contact updated successfully");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to update matter contact");
    },
  });
}

export function useDeleteMatterContact() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => api.deleteMatterContact(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: matterContactKeys.all });
      toast.success("Matter contact deleted successfully");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to delete matter contact");
    },
  });
}

export function useArchiveMatterContact() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      api.archiveMatterContact(id, isActive),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: matterContactKeys.all });
      queryClient.setQueryData(matterContactKeys.detail(data.id), data);
      toast.success(data.isActive ? "Matter contact activated" : "Matter contact archived");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to archive matter contact");
    },
  });
}

export function useMatterContactLinks(matterId: string) {
  return useQuery({
    queryKey: matterContactKeys.matterLinks(matterId),
    queryFn: () => api.getMatterContactLinks(matterId),
    enabled: !!matterId,
  });
}

export function useUpdateMatterContactLinks(matterId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (contacts: Array<{ contactId: string; role: ContactRole }>) =>
      api.updateMatterContactLinks(matterId, contacts),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: matterContactKeys.matterLinks(matterId) });
      toast.success("Matter contacts list updated");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to update matter contacts");
    },
  });
}
