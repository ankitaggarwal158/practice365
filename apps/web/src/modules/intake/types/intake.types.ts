export interface IntakeNote {
  id: string;
  intakeId: string;
  userId: string;
  userName?: string;
  note: string;
  createdAt: string;
  updatedAt: string;
}

export interface IntakeAttachment {
  id: string;
  intakeId: string;
  documentId: string;
  uploadedBy: string;
  uploadedByName?: string;
  createdAt: string;
}

export interface Intake {
  id: string;
  firmId: string;
  intakeNumber: string;
  source: "WEBSITE" | "PHONE" | "EMAIL" | "WALK_IN" | "REFERRAL" | "ADVERTISEMENT" | "MANUAL";
  status: "NEW" | "IN_REVIEW" | "AWAITING_RESPONSE" | "QUALIFIED" | "REJECTED" | "CONVERTED";
  firstName: string;
  lastName: string;
  companyName: string;
  email: string;
  phone: string;
  preferredContactMethod: "PHONE" | "EMAIL" | "SMS";
  practiceArea: string;
  subject: string;
  description: string;
  assignedTo?: string;
  assignedToName?: string;
  convertedLeadId?: string;
  convertedAt?: string;
  rejectedReason?: string;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
  notes?: IntakeNote[];
  attachments?: IntakeAttachment[];
}

export interface PaginatedIntakes {
  data: Intake[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface CreateIntakeRequest {
  firstName: string;
  lastName: string;
  companyName?: string;
  email?: string;
  phone?: string;
  preferredContactMethod?: "PHONE" | "EMAIL" | "SMS";
  practiceArea?: string;
  subject: string;
  description?: string;
  source: "WEBSITE" | "PHONE" | "EMAIL" | "WALK_IN" | "REFERRAL" | "ADVERTISEMENT" | "MANUAL";
}

export interface UpdateIntakeRequest {
  firstName?: string;
  lastName?: string;
  companyName?: string;
  email?: string;
  phone?: string;
  preferredContactMethod?: "PHONE" | "EMAIL" | "SMS";
  practiceArea?: string;
  subject?: string;
  description?: string;
  source?: "WEBSITE" | "PHONE" | "EMAIL" | "WALK_IN" | "REFERRAL" | "ADVERTISEMENT" | "MANUAL";
}
