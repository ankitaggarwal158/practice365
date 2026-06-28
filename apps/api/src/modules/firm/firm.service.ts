import { AppError } from "../../shared/app-error.js";
import { FIRM_ERROR_MESSAGES } from "./firm.constants.js";
import * as firmRepository from "./firm.repository.js";
import { FirmDocument, FirmResponseData, UpdateFirmRequest, UpdateFirmBrandingRequest } from "./firm.types.js";

export function formatFirm(firm: FirmDocument): FirmResponseData {
  return {
    id: firm._id.toString(),
    name: firm.name,
    legalName: firm.legalName,
    displayName: firm.displayName,
    logoUrl: firm.logoUrl || "",
    primaryColor: firm.primaryColor || "#5520F0",
    website: firm.website || "",
    email: firm.email || "",
    phone: firm.phone || "",
    addressLine1: firm.addressLine1 || "",
    addressLine2: firm.addressLine2 || "",
    city: firm.city || "",
    state: firm.state || "",
    postalCode: firm.postalCode || "",
    country: firm.country || "",
    timezone: firm.timezone,
    currency: firm.currency,
    locale: firm.locale,
    dateFormat: firm.dateFormat,
    timeFormat: firm.timeFormat,
    defaultBillingRate: firm.defaultBillingRate,
    invoicePrefix: firm.invoicePrefix || "",
    matterPrefix: firm.matterPrefix || "",
    isActive: firm.isActive,
    createdAt: firm.createdAt.toISOString(),
    updatedAt: firm.updatedAt.toISOString(),
  };
}

export async function getFirmProfile(id: string): Promise<FirmResponseData> {
  const firm = await firmRepository.findOrCreate(id);
  return formatFirm(firm);
}

export async function updateFirmProfile(id: string, data: UpdateFirmRequest): Promise<FirmResponseData> {
  const updated = await firmRepository.update(id, data);
  if (!updated) {
    throw AppError.notFound(FIRM_ERROR_MESSAGES.FIRM_NOT_FOUND);
  }
  
  // Compliance Audit logging
  console.log(`[AUDIT] Firm Profile Updated: ID=${id}, Name=${updated.name}`);
  
  return formatFirm(updated);
}

export async function updateBranding(id: string, data: UpdateFirmBrandingRequest): Promise<FirmResponseData> {
  const updated = await firmRepository.update(id, data);
  if (!updated) {
    throw AppError.notFound(FIRM_ERROR_MESSAGES.FIRM_NOT_FOUND);
  }

  // Compliance Audit logging
  console.log(`[AUDIT] Firm Branding Updated: ID=${id}`);

  return formatFirm(updated);
}
