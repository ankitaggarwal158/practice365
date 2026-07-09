import { Document, Types } from "mongoose";

export interface FirmSettingsDocument extends Document {
  _id: Types.ObjectId;
  firmId: Types.ObjectId;
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
  createdAt: Date;
  updatedAt: Date;
}

export interface UpdateFirmSettingsRequest {
  firmLogo?: string;
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
