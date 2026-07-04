export interface AuditLogUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  displayName: string;
}

export interface AuditLog {
  id: string;
  firmId: string;
  userId: AuditLogUser | null;
  module: string;
  entityType: string | null;
  entityId: string | null;
  action: string;
  previousState: any | null;
  currentState: any | null;
  ipAddress: string | null;
  userAgent: string | null;
  metadata: any | null;
  createdAt: string;
}

export interface AuditLogFilters {
  userId?: string;
  module?: string;
  entityType?: string;
  entityId?: string;
  action?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
  page?: number;
  limit?: number;
}
