import { Types, Document } from "mongoose";

export interface FirmDocument extends Document {
  _id: Types.ObjectId;
  name: string;
  legalName: string;
  displayName: string;
  logoUrl?: string;
  primaryColor?: string;
  website?: string;
  email?: string;
  phone?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  
  // Regional Settings
  timezone: string;
  currency: string;
  locale: string;
  dateFormat: string;
  timeFormat: "12" | "24";

  // Billing & Numbering Defaults
  defaultBillingRate: number;
  invoicePrefix?: string;
  matterPrefix?: string;

  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ─── API Response Data Types ─────────────────────────────────

export interface FirmResponseData {
  id: string;
  name: string;
  legalName: string;
  displayName: string;
  logoUrl?: string;
  primaryColor?: string;
  website?: string;
  email?: string;
  phone?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  timezone: string;
  currency: string;
  locale: string;
  dateFormat: string;
  timeFormat: "12" | "24";
  defaultBillingRate: number;
  invoicePrefix?: string;
  matterPrefix?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface FirmSettingsResponseData {
  timezone: string;
  currency: string;
  locale: string;
  dateFormat: string;
  timeFormat: "12" | "24";
  defaultBillingRate: number;
  invoicePrefix?: string;
  matterPrefix?: string;
}

// ─── Request Interfaces ──────────────────────────────────────

export interface UpdateFirmRequest {
  name?: string;
  legalName?: string;
  displayName?: string;
  website?: string;
  email?: string;
  phone?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
}

export interface UpdateFirmSettingsRequest {
  timezone?: string;
  currency?: string;
  locale?: string;
  dateFormat?: string;
  timeFormat?: "12" | "24";
  defaultBillingRate?: number;
  invoicePrefix?: string;
  matterPrefix?: string;
}

export interface UpdateFirmBrandingRequest {
  logoUrl?: string;
  primaryColor?: string;
}
