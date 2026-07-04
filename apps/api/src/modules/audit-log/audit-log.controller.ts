import { Request, Response } from "express";
import { Types } from "mongoose";
import * as auditLogService from "./audit-log.service.js";
import * as auditExportService from "./audit-export.service.js";
import { AuditLog } from "./schemas/audit-log.schema.js";
import { AuditLogDocument } from "./audit-log.types.js";
import { AppError } from "../../shared/app-error.js";
import * as userService from "../users/service/user.service.js";
import { getUserEffectivePermissions } from "../roles/service/permission.service.js";

async function getRequestingUserFirmId(req: Request): Promise<string> {
  if (!req.user) {
    throw AppError.unauthorized();
  }
  const user = await userService.getCurrentUser(req.user.userId);
  return user.firmId.toString();
}

export function formatAuditLog(log: AuditLogDocument) {
  return {
    id: log._id.toString(),
    firmId: log.firmId.toString(),
    userId: log.userId
      ? {
          id: (log.userId as any)._id?.toString() || log.userId.toString(),
          firstName: (log.userId as any).firstName || "",
          lastName: (log.userId as any).lastName || "",
          email: (log.userId as any).email || "",
          displayName: (log.userId as any).displayName || "",
        }
      : null,
    module: log.module,
    entityType: log.entityType || null,
    entityId: log.entityId ? log.entityId.toString() : null,
    action: log.action,
    previousState: log.previousState || null,
    currentState: log.currentState || null,
    ipAddress: log.ipAddress || null,
    userAgent: log.userAgent || null,
    metadata: log.metadata || null,
    createdAt: log.createdAt ? log.createdAt.toISOString() : new Date().toISOString(),
  };
}

export async function listAuditLogs(req: Request, res: Response): Promise<void> {
  const firmId = await getRequestingUserFirmId(req);
  const filter = req.query as any;

  const paginated = await auditLogService.listAuditLogs(firmId, filter);

  res.status(200).json({
    success: true,
    data: paginated.docs.map(formatAuditLog),
    pagination: {
      page: paginated.page,
      limit: paginated.limit,
      total: paginated.totalDocs,
      pages: paginated.totalPages,
    },
  });
}

export async function getAuditLog(req: Request, res: Response): Promise<void> {
  const firmId = await getRequestingUserFirmId(req);
  const logId = req.params.id as string;

  const log = await auditLogService.getAuditLog(logId, firmId);

  res.status(200).json({
    success: true,
    data: formatAuditLog(log),
  });
}

export async function getEntityTimeline(req: Request, res: Response): Promise<void> {
  const firmId = await getRequestingUserFirmId(req);
  const userId = req.user!.userId;
  const entityId = req.params.id as string;
  const filter = req.query as any;

  if (!Types.ObjectId.isValid(entityId)) {
    throw AppError.validation("Invalid entity ID format.");
  }

  // 1. Fetch a sample log for this entity to determine the entity type
  const sampleLog = await AuditLog.findOne({
    entityId: new Types.ObjectId(entityId),
    firmId: new Types.ObjectId(firmId),
  }).exec();

  if (!sampleLog) {
    res.status(200).json({
      success: true,
      data: [],
      pagination: { page: 1, limit: filter.limit || 25, total: 0, pages: 1 },
    });
    return;
  }

  // 2. Perform permission checks based on the entity type
  const typeToPermissionMap: Record<string, string> = {
    MATTER: "MATTERS_VIEW",
    CLIENT: "CLIENTS_VIEW",
    LEAD: "LEADS_VIEW",
    INTAKE: "INTAKES_VIEW",
    DOCUMENT: "DOCUMENTS_VIEW",
    INVOICE: "INVOICES_VIEW",
    NOTE: "NOTES_VIEW",
    CALENDAR_EVENT: "CALENDAR_VIEW",
    SIGNATURE: "SIGNATURE_VIEW",
  };

  const userPermissions = await getUserEffectivePermissions(userId);
  const requiredPermission = sampleLog.entityType
    ? typeToPermissionMap[sampleLog.entityType.toUpperCase()]
    : null;

  const hasAccess =
    userPermissions.includes("AUDIT_VIEW") ||
    (requiredPermission && userPermissions.includes(requiredPermission));

  if (!hasAccess) {
    throw AppError.forbidden(
      "Access denied. You do not have permission to view this entity's timeline."
    );
  }

  const paginated = await auditLogService.getEntityTimeline(firmId, entityId, filter);

  res.status(200).json({
    success: true,
    data: paginated.docs.map(formatAuditLog),
    pagination: {
      page: paginated.page,
      limit: paginated.limit,
      total: paginated.totalDocs,
      pages: paginated.totalPages,
    },
  });
}

export async function getUserActivity(req: Request, res: Response): Promise<void> {
  const firmId = await getRequestingUserFirmId(req);
  const targetUserId = req.params.id as string;
  const filter = req.query as any;

  if (!Types.ObjectId.isValid(targetUserId)) {
    throw AppError.validation("Invalid user ID format.");
  }

  const paginated = await auditLogService.getUserActivity(firmId, targetUserId, filter);

  res.status(200).json({
    success: true,
    data: paginated.docs.map(formatAuditLog),
    pagination: {
      page: paginated.page,
      limit: paginated.limit,
      total: paginated.totalDocs,
      pages: paginated.totalPages,
    },
  });
}

export async function exportAuditLogs(req: Request, res: Response): Promise<void> {
  const firmId = await getRequestingUserFirmId(req);
  const filter = req.query as any;

  const csvString = await auditExportService.exportToCsv(firmId, filter);

  res.setHeader("Content-Type", "text/csv");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="audit_log_${new Date().toISOString().split("T")[0]}.csv"`
  );
  res.status(200).send(csvString);
}
