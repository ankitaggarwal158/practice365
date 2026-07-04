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
  previousState: any;
  currentState: any;
  ipAddress: string | null;
  userAgent: string | null;
  metadata: any;
  createdAt: string;
}

export interface ListAuditLogsFilter {
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

export interface PaginatedResult<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}
