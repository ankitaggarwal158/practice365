import { Client } from "../../clients/types/client.types";
import { Matter } from "../../matters/types/matter.types";
import { Invoice } from "../../billing/types/invoice.types";

export interface PortalUser {
  id: string;
  email: string;
  clientId: string;
  firmId: string;
}

export interface PortalAuthResponse {
  success: boolean;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: PortalUser;
}

export interface PortalRefreshResponse {
  success: boolean;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export type PortalProfile = Client;
export type PortalMatter = Matter;

export interface PortalDocument {
  _id: string;
  firmId: string;
  matterId?: {
    _id: string;
    title: string;
  };
  clientId?: {
    _id: string;
    firstName?: string;
    lastName?: string;
    companyName?: string;
  };
  documentName: string;
  originalFileName: string;
  description: string;
  category: string;
  tags: string[];
  mimeType: string;
  fileExtension: string;
  fileSize: number;
  createdAt: string;
  updatedAt: string;
}

export type PortalInvoice = Invoice;
