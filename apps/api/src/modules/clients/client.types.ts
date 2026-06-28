import { Document, Types } from "mongoose";

export interface Address {
  street?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
}

export interface ClientDocument extends Document {
  _id: Types.ObjectId;
  firmId: Types.ObjectId;
  leadId?: Types.ObjectId;
  clientNumber: string;
  clientType: "INDIVIDUAL" | "ORGANIZATION";
  status: "ACTIVE" | "INACTIVE" | "ARCHIVED";
  firstName?: string;
  lastName?: string;
  companyName?: string;
  email?: string;
  phone?: string;
  website?: string;
  address?: Address;
  customFields?: Record<string, any>;
  mergedIntoClientId?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface ClientNoteDocument extends Document {
  _id: Types.ObjectId;
  clientId: Types.ObjectId;
  authorId: Types.ObjectId;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ClientAttachmentDocument extends Document {
  _id: Types.ObjectId;
  clientId: Types.ObjectId;
  fileName: string;
  fileSize: number; // in bytes
  mimeType: string;
  key: string; // Object storage path
  uploadedBy: Types.ObjectId;
  uploadedAt: Date;
}

export interface ClientResponseData {
  id: string;
  firmId: string;
  leadId?: string;
  clientNumber: string;
  clientType: "INDIVIDUAL" | "ORGANIZATION";
  status: "ACTIVE" | "INACTIVE" | "ARCHIVED";
  firstName?: string;
  lastName?: string;
  companyName?: string;
  email?: string;
  phone?: string;
  website?: string;
  address?: Address;
  customFields?: Record<string, any>;
  mergedIntoClientId?: string;
  createdAt: string;
  updatedAt: string;
  notes?: ClientNoteResponseData[];
  attachments?: ClientAttachmentResponseData[];
}

export interface ClientNoteResponseData {
  id: string;
  clientId: string;
  authorId: string;
  authorName?: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface ClientAttachmentResponseData {
  id: string;
  clientId: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  key: string;
  uploadedBy: string;
  uploadedByName?: string;
  uploadedAt: string;
}
