import { AppError } from "../../shared/app-error.js";
import { FIRM_ERROR_MESSAGES } from "./firm.constants.js";
import * as firmRepository from "./firm.repository.js";
import { FirmDocument, FirmSettingsResponseData, UpdateFirmSettingsRequest } from "./firm.types.js";

export function formatSettings(firm: FirmDocument): FirmSettingsResponseData {
  return {
    timezone: firm.timezone,
    currency: firm.currency,
    locale: firm.locale,
    dateFormat: firm.dateFormat,
    timeFormat: firm.timeFormat,
    defaultBillingRate: firm.defaultBillingRate,
    invoicePrefix: firm.invoicePrefix || "",
    matterPrefix: firm.matterPrefix || "",
  };
}

export async function getFirmSettings(id: string): Promise<FirmSettingsResponseData> {
  const firm = await firmRepository.findOrCreate(id);
  return formatSettings(firm);
}

export async function updateFirmSettings(id: string, data: UpdateFirmSettingsRequest): Promise<FirmSettingsResponseData> {
  const updated = await firmRepository.update(id, data);
  if (!updated) {
    throw AppError.notFound(FIRM_ERROR_MESSAGES.FIRM_NOT_FOUND);
  }

  // Compliance Audit logging
  console.log(`[AUDIT] Firm Regional/Billing Settings Updated: ID=${id}`);

  return formatSettings(updated);
}
