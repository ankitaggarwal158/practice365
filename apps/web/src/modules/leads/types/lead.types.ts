export interface LeadNote {
  id: string;
  leadId: string;
  userId: string;
  userName?: string;
  note: string;
  createdAt: string;
  updatedAt: string;
}

export interface LeadActivity {
  id: string;
  leadId: string;
  userId: string;
  userName?: string;
  activityType: string;
  description: string;
  metadata?: any;
  createdAt: string;
}

export interface LeadAttachment {
  id: string;
  leadId: string;
  documentId: string;
  uploadedBy: string;
  uploadedByName?: string;
  createdAt: string;
}

export interface Lead {
  id: string;
  firmId: string;
  leadNumber: string;
  intakeId?: string;
  ownerId: string;
  ownerName?: string;
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
  companyName: string;
  email: string;
  phone: string;
  preferredContactMethod: "PHONE" | "EMAIL" | "SMS";
  practiceArea: string;
  subject: string;
  description: string;
  consultationDate?: string;
  engagementSentAt?: string;
  convertedClientId?: string;
  convertedAt?: string;
  lostReason?: string;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
  notes?: LeadNote[];
  activities?: LeadActivity[];
  attachments?: LeadAttachment[];
}

export interface PaginatedLeads {
  data: Lead[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface CreateLeadRequest {
  firstName: string;
  lastName: string;
  companyName?: string;
  email?: string;
  phone?: string;
  preferredContactMethod?: "PHONE" | "EMAIL" | "SMS";
  practiceArea?: string;
  subject: string;
  description?: string;
}

export interface UpdateLeadRequest {
  firstName?: string;
  lastName?: string;
  companyName?: string;
  email?: string;
  phone?: string;
  preferredContactMethod?: "PHONE" | "EMAIL" | "SMS";
  practiceArea?: string;
  subject?: string;
  description?: string;
}
