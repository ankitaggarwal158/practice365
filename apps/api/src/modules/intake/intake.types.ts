import { Types, Document } from "mongoose";

export interface IntakeDocument extends Document {
  _id: Types.ObjectId;
  firmId: Types.ObjectId;
  intakeNumber: string;
  source: "WEBSITE" | "PHONE" | "EMAIL" | "WALK_IN" | "REFERRAL" | "ADVERTISEMENT" | "MANUAL";
  status: "NEW" | "IN_REVIEW" | "AWAITING_RESPONSE" | "QUALIFIED" | "REJECTED" | "CONVERTED";
  firstName: string;
  lastName: string;
  companyName?: string;
  email?: string;
  phone?: string;
  preferredContactMethod?: "PHONE" | "EMAIL" | "SMS";
  practiceArea?: string;
  subject: string;
  description?: string;
  assignedTo?: Types.ObjectId;
  convertedLeadId?: Types.ObjectId;
  convertedAt?: Date;
  rejectedReason?: string;
  opposingPartyNames?: string[];
  createdBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface IntakeNoteDocument extends Document {
  _id: Types.ObjectId;
  intakeId: Types.ObjectId;
  userId: Types.ObjectId;
  note: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IntakeAttachmentDocument extends Document {
  _id: Types.ObjectId;
  intakeId: Types.ObjectId;
  documentId: Types.ObjectId;
  uploadedBy: Types.ObjectId;
  createdAt: Date;
}

// ─── Response Interfaces ─────────────────────────────────────

export interface IntakeNoteResponseData {
  id: string;
  intakeId: string;
  userId: string;
  userName?: string;
  note: string;
  createdAt: string;
  updatedAt: string;
}

export interface IntakeAttachmentResponseData {
  id: string;
  intakeId: string;
  documentId: string;
  uploadedBy: string;
  uploadedByName?: string;
  createdAt: string;
}

export interface IntakeResponseData {
  id: string;
  firmId: string;
  intakeNumber: string;
  source: string;
  status: string;
  firstName: string;
  lastName: string;
  companyName: string;
  email: string;
  phone: string;
  preferredContactMethod: string;
  practiceArea: string;
  subject: string;
  description: string;
  assignedTo?: string;
  assignedToName?: string;
  convertedLeadId?: string;
  convertedAt?: string;
  rejectedReason?: string;
  opposingPartyNames?: string[];
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
  notes?: IntakeNoteResponseData[];
  attachments?: IntakeAttachmentResponseData[];
}
