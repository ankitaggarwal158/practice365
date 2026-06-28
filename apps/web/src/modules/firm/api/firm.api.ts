import { httpClient } from "@/services/http-client";
import type {
  FirmResponseData,
  FirmSettingsResponseData,
  UpdateFirmRequest,
  UpdateFirmSettingsRequest,
  UpdateFirmBrandingRequest,
} from "../types/firm.types";

export const firmApi = {
  getFirm: () =>
    httpClient.get<FirmResponseData>("/firm"),

  updateFirm: (data: UpdateFirmRequest) =>
    httpClient.patch<FirmResponseData>("/firm", data),

  getFirmSettings: () =>
    httpClient.get<FirmSettingsResponseData>("/firm/settings"),

  updateFirmSettings: (data: UpdateFirmSettingsRequest) =>
    httpClient.patch<FirmSettingsResponseData>("/firm/settings", data),

  updateBranding: (data: UpdateFirmBrandingRequest) =>
    httpClient.patch<FirmResponseData>("/firm/branding", data),
};

export default firmApi;
