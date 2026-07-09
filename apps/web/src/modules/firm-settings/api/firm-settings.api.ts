import { httpClient } from "@/services/http-client";
import { FirmSettings, UpdateFirmSettingsRequest, FirmProfile, UpdateFirmProfileRequest } from "../types";

export const firmSettingsApi = {
  getSettings: () =>
    httpClient.get<FirmSettings>("/firm-settings"),

  updateSettings: (data: UpdateFirmSettingsRequest) =>
    httpClient.patch<FirmSettings>("/firm-settings", data),

  getFirmProfile: () =>
    httpClient.get<FirmProfile>("/firm"),

  updateFirmProfile: (data: UpdateFirmProfileRequest) =>
    httpClient.patch<FirmProfile>("/firm", data),

  uploadLogo: async (file: File): Promise<FirmSettings> => {
    const formData = new FormData();
    formData.append("logo", file);

    return httpClient.post<FirmSettings>("/firm-settings/logo", formData);
  },
};

export default firmSettingsApi;
