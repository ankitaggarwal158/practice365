import * as auditLogRepository from "./audit-log.repository.js";
import { AuditLogDocument, ListAuditLogsFilter } from "./audit-log.types.js";
import { AppError } from "../../shared/app-error.js";

export async function listAuditLogs(
  firmId: string,
  filter: ListAuditLogsFilter
): Promise<auditLogRepository.PaginatedDocs<AuditLogDocument>> {
  return auditLogRepository.findAll(firmId, filter);
}

export async function getAuditLog(
  id: string,
  firmId: string
): Promise<AuditLogDocument> {
  const log = await auditLogRepository.findById(id, firmId);
  if (!log) {
    throw AppError.notFound("Audit log record not found.");
  }
  return log;
}

export async function getEntityTimeline(
  firmId: string,
  entityId: string,
  filter: Omit<ListAuditLogsFilter, "entityId">
): Promise<auditLogRepository.PaginatedDocs<AuditLogDocument>> {
  return auditLogRepository.findEntityTimeline(firmId, entityId, filter);
}

export async function getUserActivity(
  firmId: string,
  userId: string,
  filter: Omit<ListAuditLogsFilter, "userId">
): Promise<auditLogRepository.PaginatedDocs<AuditLogDocument>> {
  return auditLogRepository.findUserActivity(firmId, userId, filter);
}
