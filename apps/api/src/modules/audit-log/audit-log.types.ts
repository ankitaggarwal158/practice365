import { Document, Types } from "mongoose";

export interface AuditLogDocument extends Document {
  _id: Types.ObjectId;
  firmId: Types.ObjectId;
  userId: Types.ObjectId | null;
  module: string;
  entityType?: string;
  entityId?: Types.ObjectId;
  action: string;
  previousState?: any;
  currentState?: any;
  ipAddress?: string;
  userAgent?: string;
  metadata?: any;
  createdAt: Date;
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

export interface RecordAuditEventInput {
  firmId: string;
  userId: string | null;
  module: string;
  entityType?: string;
  entityId?: string;
  action: string;
  previousState?: any;
  currentState?: any;
  ipAddress?: string;
  userAgent?: string;
  metadata?: any;
}
