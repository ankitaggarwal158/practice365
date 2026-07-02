import { Document, Types } from "mongoose";

export interface MatterDocument extends Document {
  _id: Types.ObjectId;
  firmId: Types.ObjectId;
  clientId: Types.ObjectId;
  matterNumber: string;
  title: string;
  description?: string;
  practiceAreaId: Types.ObjectId;
  matterType: "LITIGATION" | "TRANSACTIONAL" | "CONSULTATION" | "ADVISORY" | "REGULATORY" | "OTHER";
  status: "OPEN" | "ON_HOLD" | "CLOSED" | "ARCHIVED";
  priority: "LOW" | "NORMAL" | "HIGH" | "URGENT";
  responsibleAttorneyId: Types.ObjectId;
  openedDate: Date;
  closedDate?: Date;
  archivedAt?: Date;
  archivedBy?: Types.ObjectId;
  conflictCheckId?: Types.ObjectId;
  leadId?: Types.ObjectId;
  clientReference?: string;
  courtFileNumber?: string;
  statuteOfLimitations?: Date;
  estimatedValue?: Types.Decimal128;
  billingMethod: "HOURLY" | "FLAT_FEE" | "CONTINGENCY";
  customHourlyRate?: number;
  flatFeeAmount?: number;
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface MatterTeamMemberDocument extends Document {
  _id: Types.ObjectId;
  matterId: Types.ObjectId;
  userId: Types.ObjectId;
  role: string;
  assignedBy: Types.ObjectId;
  assignedAt: Date;
  createdAt: Date;
}

export interface MatterNoteDocument extends Document {
  _id: Types.ObjectId;
  matterId: Types.ObjectId;
  userId: Types.ObjectId;
  note: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface MatterAttachmentDocument extends Document {
  _id: Types.ObjectId;
  matterId: Types.ObjectId;
  documentId: Types.ObjectId;
  uploadedBy: Types.ObjectId;
  createdAt: Date;
}

export interface DocumentDocument extends Document {
  _id: Types.ObjectId;
  firmId: Types.ObjectId;
  fileName: string;
  fileSize: number;
  mimeType: string;
  key: string;
  uploadedBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}



export interface MatterResponseData {
  id: string;
  firmId: string;
  clientId: string;
  clientName?: string;
  matterNumber: string;
  title: string;
  description?: string;
  practiceAreaId: string;
  practiceAreaName?: string;
  matterType: string;
  status: string;
  priority: string;
  responsibleAttorneyId: string;
  responsibleAttorneyName?: string;
  openedDate: string;
  closedDate?: string;
  archivedAt?: string;
  archivedBy?: string;
  conflictCheckId?: string;
  leadId?: string;
  clientReference?: string;
  courtFileNumber?: string;
  statuteOfLimitations?: string;
  estimatedValue?: number;
  billingMethod: string;
  customHourlyRate?: number;
  flatFeeAmount?: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  teamMembers?: MatterTeamMemberResponseData[];
  notes?: MatterNoteResponseData[];
  attachments?: MatterAttachmentResponseData[];
}

export interface MatterTeamMemberResponseData {
  id: string;
  matterId: string;
  userId: string;
  userName?: string;
  userEmail?: string;
  role: string;
  assignedBy: string;
  assignedAt: string;
}

export interface MatterNoteResponseData {
  id: string;
  matterId: string;
  userId: string;
  userName?: string;
  note: string;
  createdAt: string;
  updatedAt: string;
}

export interface MatterAttachmentResponseData {
  id: string;
  matterId: string;
  documentId: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  key: string;
  uploadedBy: string;
  uploadedByName?: string;
  createdAt: string;
}
