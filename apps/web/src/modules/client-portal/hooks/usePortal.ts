import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PortalApiClient } from "../api/portal.api";
import { PortalProfile, PortalMatter, PortalDocument, PortalInvoice } from "../types/portal.types";
import { toast } from "sonner";

export const usePortalProfile = () => {
  return useQuery<PortalProfile, Error>({
    queryKey: ["portal", "profile"],
    queryFn: () => PortalApiClient.getProfile(),
  });
};

export const usePortalUpdateProfile = () => {
  const queryClient = useQueryClient();
  return useMutation<PortalProfile, Error, any>({
    mutationFn: (body) => PortalApiClient.updateProfile(body),
    onSuccess: (updatedProfile) => {
      queryClient.setQueryData(["portal", "profile"], updatedProfile);
      toast.success("Profile updated successfully!");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update profile.");
    },
  });
};

export const usePortalMatters = (search?: string) => {
  return useQuery<PortalMatter[], Error>({
    queryKey: ["portal", "matters", search],
    queryFn: () => PortalApiClient.listMatters(search),
  });
};

export const usePortalMatterDetails = (id: string) => {
  return useQuery<PortalMatter, Error>({
    queryKey: ["portal", "matters", "details", id],
    queryFn: () => PortalApiClient.getMatterDetails(id),
    enabled: !!id,
  });
};

export const usePortalDocuments = (search?: string) => {
  return useQuery<PortalDocument[], Error>({
    queryKey: ["portal", "documents", search],
    queryFn: () => PortalApiClient.listDocuments(search),
  });
};

export const usePortalInvoices = (search?: string) => {
  return useQuery<PortalInvoice[], Error>({
    queryKey: ["portal", "invoices", search],
    queryFn: () => PortalApiClient.listInvoices(search),
  });
};
