import { Document, Types } from "mongoose";
import { RequestStatus, SigningMode, SignerStatus, EventType } from "./signature-request.constants.js";

export interface SignatureRequestDocument extends Document {
  _id: Types.ObjectId;
  firmId: Types.ObjectId;
  matterId: Types.ObjectId | null;
  documentId: Types.ObjectId;
  signedDocumentId: Types.ObjectId | null;
  requestTitle: string;
  signingMode: SigningMode;
  status: RequestStatus;
  expiresAt: Date | null;
  completedAt: Date | null;
  cancelledAt: Date | null;
  cancelledBy: Types.ObjectId | null;
  deleted: boolean;
  deletedAt: Date | null;
  deletedBy: Types.ObjectId | null;
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface SignatureRequestSignerDocument extends Document {
  _id: Types.ObjectId;
  requestId: Types.ObjectId;
  fullName: string;
  email: string;
  signingOrder: number;
  status: SignerStatus;
  token: string;
  viewedAt: Date | null;
  signedAt: Date | null;
  declinedAt: Date | null;
  signatureIp: string | null;
  signatureUserAgent: string | null;
  signatureData: string | null; // Drawn svg, points, or text representation
}

export interface SignatureEventDocument extends Document {
  _id: Types.ObjectId;
  requestId: Types.ObjectId;
  signerId: Types.ObjectId | null;
  eventType: EventType;
  metadata: Record<string, any>;
  createdAt: Date;
}

export interface CreateSignatureRequestPayload {
  documentId: string;
  matterId?: string;
  requestTitle: string;
  signingMode: SigningMode;
  expiresAt?: string;
  signers: Array<{
    fullName: string;
    email: string;
    signingOrder?: number;
  }>;
}

export interface SubmitSignaturePayload {
  signature: string;
  acceptedTerms: boolean;
}
