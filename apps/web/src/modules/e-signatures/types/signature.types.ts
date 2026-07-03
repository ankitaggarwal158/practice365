export interface SignatureRequest {
  id: string;
  firmId: string;
  matterId: string | null;
  documentId: string;
  signedDocumentId: string | null;
  requestTitle: string;
  signingMode: "PARALLEL" | "SEQUENTIAL";
  status: "DRAFT" | "SENT" | "VIEWED" | "PARTIALLY_SIGNED" | "COMPLETED" | "DECLINED" | "EXPIRED" | "CANCELLED";
  expiresAt: string | null;
  completedAt: string | null;
  cancelledAt: string | null;
  cancelledBy: string | null;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface Signer {
  id: string;
  requestId: string;
  fullName: string;
  email: string;
  signingOrder: number;
  status: "PENDING" | "VIEWED" | "SIGNED" | "DECLINED";
  viewedAt: string | null;
  signedAt: string | null;
  declinedAt: string | null;
  signatureIp: string | null;
  signatureUserAgent: string | null;
}

export interface SignatureEvent {
  id: string;
  requestId: string;
  signerId: string | null;
  eventType: "CREATED" | "SENT" | "EMAIL_DELIVERED" | "VIEWED" | "SIGNED" | "DECLINED" | "COMPLETED" | "CANCELLED" | "EXPIRED";
  metadata: {
    message?: string;
    ip?: string;
    userAgent?: string;
  };
  createdAt: string;
}

export interface SignatureRequestDetails {
  request: SignatureRequest;
  signers: Signer[];
  events: SignatureEvent[];
}

export interface CreateSignatureRequestPayload {
  documentId: string;
  matterId?: string;
  requestTitle: string;
  signingMode: "PARALLEL" | "SEQUENTIAL";
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

export interface SigningSession {
  request: SignatureRequest;
  signer: Signer;
  documentName: string;
  documentId: string;
}
