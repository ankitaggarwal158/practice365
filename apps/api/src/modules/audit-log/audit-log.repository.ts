import { Types } from "mongoose";
import { AuditLog } from "./schemas/audit-log.schema.js";
import { AuditLogDocument, ListAuditLogsFilter } from "./audit-log.types.js";

export interface PaginatedDocs<T> {
  docs: T[];
  totalDocs: number;
  limit: number;
  page: number;
  totalPages: number;
}

export async function create(payload: Partial<AuditLogDocument>): Promise<AuditLogDocument> {
  // Prevent any updates or modifications. Audit logs are append-only.
  const doc = await AuditLog.create(payload);
  return doc.populate("userId", "firstName lastName email displayName");
}

export async function findById(id: string, firmId: string): Promise<AuditLogDocument | null> {
  if (!Types.ObjectId.isValid(id) || !Types.ObjectId.isValid(firmId)) {
    return null;
  }
  return AuditLog.findOne({
    _id: new Types.ObjectId(id),
    firmId: new Types.ObjectId(firmId),
  })
    .populate("userId", "firstName lastName email displayName")
    .exec();
}

export async function findAll(
  firmId: string,
  filter: ListAuditLogsFilter
): Promise<PaginatedDocs<AuditLogDocument>> {
  const page = filter.page || 1;
  const limit = filter.limit || 25;
  const skip = (page - 1) * limit;

  const query: any = {
    firmId: new Types.ObjectId(firmId),
  };

  if (filter.userId && Types.ObjectId.isValid(filter.userId)) {
    query.userId = new Types.ObjectId(filter.userId);
  }

  if (filter.module) {
    query.module = filter.module;
  }

  if (filter.entityType) {
    query.entityType = filter.entityType;
  }

  if (filter.entityId && Types.ObjectId.isValid(filter.entityId)) {
    query.entityId = new Types.ObjectId(filter.entityId);
  }

  if (filter.action) {
    query.action = filter.action;
  }

  // Date filters
  if (filter.startDate || filter.endDate) {
    query.createdAt = {};
    if (filter.startDate) {
      query.createdAt.$gte = new Date(filter.startDate);
    }
    if (filter.endDate) {
      query.createdAt.$lte = new Date(filter.endDate);
    }
  }

  // Text search (search in module, action, entityType, ipAddress, userAgent, or metadata message)
  if (filter.search?.trim()) {
    const searchRegex = new RegExp(filter.search.trim(), "i");
    query.$or = [
      { module: searchRegex },
      { action: searchRegex },
      { entityType: searchRegex },
      { ipAddress: searchRegex },
      { userAgent: searchRegex },
      { "metadata.message": searchRegex },
    ];
  }

  const [docs, totalDocs] = await Promise.all([
    AuditLog.find(query)
      .populate("userId", "firstName lastName email displayName")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .exec(),
    AuditLog.countDocuments(query),
  ]);

  return {
    docs,
    totalDocs,
    limit,
    page,
    totalPages: Math.ceil(totalDocs / limit) || 1,
  };
}

export async function findEntityTimeline(
  firmId: string,
  entityId: string,
  filter: Omit<ListAuditLogsFilter, "entityId">
): Promise<PaginatedDocs<AuditLogDocument>> {
  return findAll(firmId, { ...filter, entityId });
}

export async function findUserActivity(
  firmId: string,
  userId: string,
  filter: Omit<ListAuditLogsFilter, "userId">
): Promise<PaginatedDocs<AuditLogDocument>> {
  return findAll(firmId, { ...filter, userId });
}
