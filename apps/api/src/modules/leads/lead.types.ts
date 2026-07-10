import { Types, Document } from "mongoose";

export interface LeadDocument extends Document {
  _id: Types.ObjectId;
  firmId: Types.ObjectId;
  leadNumber: string;
  intakeId?: Types.ObjectId;
  ownerId: Types.ObjectId; // Every lead must have an owner
  status:
    | "NEW"
    | "CONTACTED"
    | "CONSULTATION_SCHEDULED"
    | "CONSULTATION_COMPLETED"
    | "ENGAGEMENT_SENT"
    | "QUALIFIED"
    | "LOST"
    | "CONVERTED";
  source: "INTAKE" | "MANUAL";
  firstName: string;
  lastName: string;
  companyName?: string;
  email?: string;
  phone?: string;
  preferredContactMethod?: "PHONE" | "EMAIL" | "SMS";
  practiceArea?: string;
  subject: string;
  description?: string;
  consultationDate?: Date;
  engagementSentAt?: Date;
  convertedClientId?: Types.ObjectId;
  convertedAt?: Date;
  lostReason?: string;
  customFields?: Record<string, any>;
  opposingPartyNames?: string[];
  createdBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface LeadNoteDocument extends Document {
  _id: Types.ObjectId;
  leadId: Types.ObjectId;
  userId: Types.ObjectId;
  note: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface LeadActivityDocument extends Document {
  _id: Types.ObjectId;
  leadId: Types.ObjectId;
  userId: Types.ObjectId;
  activityType:
    | "CREATED"
    | "UPDATED"
    | "ASSIGNED"
    | "CONTACTED"
    | "CONSULTATION_SCHEDULED"
    | "CONSULTATION_COMPLETED"
    | "ENGAGEMENT_SENT"
    | "STATUS_CHANGED"
    | "LOST"
    | "CONVERTED";
  description: string;
  metadata?: any;
  createdAt: Date;
}

export interface LeadAttachmentDocument extends Document {
  _id: Types.ObjectId;
  leadId: Types.ObjectId;
  documentId: Types.ObjectId;
  uploadedBy: Types.ObjectId;
  createdAt: Date;
}

// ─── Response Interfaces ─────────────────────────────────────

export interface LeadNoteResponseData {
  id: string;
  leadId: string;
  userId: string;
  userName?: string;
  note: string;
  createdAt: string;
  updatedAt: string;
}

export interface LeadActivityResponseData {
  id: string;
  leadId: string;
  userId: string;
  userName?: string;
  activityType: string;
  description: string;
  metadata?: any;
  createdAt: string;
}

export interface LeadAttachmentResponseData {
  id: string;
  leadId: string;
  documentId: string;
  uploadedBy: string;
  uploadedByName?: string;
  createdAt: string;
}

export interface LeadResponseData {
  id: string;
  firmId: string;
  leadNumber: string;
  intakeId?: string;
  ownerId: string;
  ownerName?: string;
  status: string;
  source: string;
  firstName: string;
  lastName: string;
  companyName: string;
  email: string;
  phone: string;
  preferredContactMethod: string;
  practiceArea: string;
  subject: string;
  description: string;
  consultationDate?: string;
  engagementSentAt?: string;
  convertedClientId?: string;
  convertedAt?: string;
  lostReason?: string;
  customFields?: Record<string, any>;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
  notes?: LeadNoteResponseData[];
  activities?: LeadActivityResponseData[];
  attachments?: LeadAttachmentResponseData[];
}
