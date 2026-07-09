export interface FirmSettings {
  id: string;
  firmId: string;
  firmLogo: string;
  primaryColor: string;
  secondaryColor: string;
  timezone: string;
  currency: string;
  dateFormat: string;
  timeFormat: "12_HOUR" | "24_HOUR";
  matterNumberPrefix: string;
  matterNextNumber: number;
  clientNumberPrefix: string;
  clientNextNumber: number;
  invoiceNumberPrefix: string;
  invoiceNextNumber: number;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateFirmSettingsRequest {
  timezone?: string;
  currency?: string;
  dateFormat?: string;
  timeFormat?: "12_HOUR" | "24_HOUR";
  matterNumberPrefix?: string;
  matterNextNumber?: number;
  clientNumberPrefix?: string;
  clientNextNumber?: number;
  invoiceNumberPrefix?: string;
  invoiceNextNumber?: number;
  primaryColor?: string;
  secondaryColor?: string;
}

export interface FirmProfile {
  id: string;
  name: string;
  legalName: string;
  displayName: string;
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

export interface UpdateFirmProfileRequest {
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
