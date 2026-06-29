export interface MatterTeamMember {
  id: string;
  matterId: string;
  userId: string;
  userName?: string;
  userEmail?: string;
  role: string;
  assignedBy: string;
  assignedAt: string;
}

export interface MatterNote {
  id: string;
  matterId: string;
  userId: string;
  userName?: string;
  note: string;
  createdAt: string;
  updatedAt: string;
}

export interface MatterAttachment {
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

export interface PracticeArea {
  id: string;
  firmId: string;
  name: string;
}

export interface Matter {
  id: string;
  firmId: string;
  clientId: string;
  clientName?: string;
  matterNumber: string;
  title: string;
  description?: string;
  practiceAreaId: string;
  practiceAreaName?: string;
  matterType: "LITIGATION" | "TRANSACTIONAL" | "CONSULTATION" | "ADVISORY" | "REGULATORY" | "OTHER";
  status: "OPEN" | "ON_HOLD" | "CLOSED" | "ARCHIVED";
  priority: "LOW" | "NORMAL" | "HIGH" | "URGENT";
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
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  teamMembers?: MatterTeamMember[];
  notes?: MatterNote[];
  attachments?: MatterAttachment[];
}

export interface PaginatedMatters {
  data: Matter[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface CreateMatterRequest {
  clientId: string;
  title: string;
  practiceAreaId: string;
  matterType: "LITIGATION" | "TRANSACTIONAL" | "CONSULTATION" | "ADVISORY" | "REGULATORY" | "OTHER";
  responsibleAttorneyId: string;
  description?: string;
  priority?: "LOW" | "NORMAL" | "HIGH" | "URGENT";
  clientReference?: string;
  courtFileNumber?: string;
  statuteOfLimitations?: string;
  estimatedValue?: number;
  conflictCheckId?: string;
  leadId?: string;
}

export interface UpdateMatterRequest {
  title?: string;
  description?: string;
  priority?: "LOW" | "NORMAL" | "HIGH" | "URGENT";
  practiceAreaId?: string;
  matterType?: "LITIGATION" | "TRANSACTIONAL" | "CONSULTATION" | "ADVISORY" | "REGULATORY" | "OTHER";
  clientReference?: string;
  courtFileNumber?: string;
  statuteOfLimitations?: string;
  estimatedValue?: number;
}
