export interface ClientNote {
  id: string;
  clientId: string;
  userId: string;
  userName?: string;
  note: string;
  createdAt: string;
  updatedAt: string;
}

export interface ClientAttachment {
  id: string;
  clientId: string;
  documentId: string;
  fileName: string;
  uploadedBy: string;
  uploadedByName?: string;
  createdAt: string;
}

export interface ClientAddress {
  street1?: string;
  street2?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
}

export interface Client {
  id: string;
  firmId: string;
  clientNumber: string;
  clientType: "INDIVIDUAL" | "ORGANIZATION";
  status: "ACTIVE" | "INACTIVE" | "ARCHIVED";
  firstName?: string;
  lastName?: string;
  companyName?: string;
  email?: string;
  phone?: string;
  website?: string;
  address?: ClientAddress;
  customFields?: Record<string, any>;
  leadId?: string;
  mergedIntoClientId?: string;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
  notes?: ClientNote[];
  attachments?: ClientAttachment[];
}

export interface PaginatedClients {
  data: Client[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface CreateClientRequest {
  clientType: "INDIVIDUAL" | "ORGANIZATION";
  firstName?: string;
  lastName?: string;
  companyName?: string;
  email?: string;
  phone?: string;
  website?: string;
  address?: ClientAddress;
  customFields?: Record<string, any>;
  leadId?: string;
}

export interface UpdateClientRequest {
  firstName?: string;
  lastName?: string;
  companyName?: string;
  email?: string;
  phone?: string;
  website?: string;
  address?: ClientAddress;
  status?: "ACTIVE" | "INACTIVE" | "ARCHIVED";
  customFields?: Record<string, any>;
}

export interface MergeClientRequest {
  targetClientId: string;
}

export interface DuplicateCheckRequest {
  firstName?: string;
  lastName?: string;
  companyName?: string;
  email?: string;
}

export interface DuplicateCheckResponse {
  clientId: string;
  clientNumber: string;
  clientName: string;
  matchedField: string;
}
