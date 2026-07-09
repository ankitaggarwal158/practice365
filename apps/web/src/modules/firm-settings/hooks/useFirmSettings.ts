import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { firmSettingsApi } from "../api/firm-settings.api";
import { UpdateFirmSettingsRequest, UpdateFirmProfileRequest } from "../types";

export const settingsKeys = {
  all: ["firmSettings"] as const,
  profile: ["firmProfile"] as const,
};

export function useFirmSettings() {
  return useQuery({
    queryKey: settingsKeys.all,
    queryFn: () => firmSettingsApi.getSettings(),
  });
}

export function useUpdateFirmSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateFirmSettingsRequest) => firmSettingsApi.updateSettings(data),
    onSuccess: (data) => {
      queryClient.setQueryData(settingsKeys.all, data);
      toast.success("Firm configuration updated successfully");
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to update firm configuration");
    },
  });
}

export function useFirmProfile() {
  return useQuery({
    queryKey: settingsKeys.profile,
    queryFn: () => firmSettingsApi.getFirmProfile(),
  });
}

export function useUpdateFirmProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateFirmProfileRequest) => firmSettingsApi.updateFirmProfile(data),
    onSuccess: (data) => {
      queryClient.setQueryData(settingsKeys.profile, data);
      toast.success("Firm profile updated successfully");
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to update firm profile");
    },
  });
}

export function useUploadLogo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File) => firmSettingsApi.uploadLogo(file),
    onSuccess: (data) => {
      queryClient.setQueryData(settingsKeys.all, data);
      toast.success("Branding logo uploaded successfully");
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to upload logo image");
    },
  });
}
