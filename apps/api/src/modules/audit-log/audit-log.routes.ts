import { Router } from "express";
import { asyncHandler } from "../../shared/async-handler.js";
import { requirePermission } from "../roles/index.js";
import {
  validateQuery,
  listAuditLogsQuerySchema,
  entityTimelineQuerySchema,
  userActivityQuerySchema,
} from "./audit-log.validation.js";
import * as auditLogController from "./audit-log.controller.js";

const router = Router();

router.get(
  "/audit-logs",
  requirePermission("AUDIT_VIEW"),
  validateQuery(listAuditLogsQuerySchema),
  asyncHandler(auditLogController.listAuditLogs)
);

router.get(
  "/audit-logs/export",
  requirePermission("AUDIT_EXPORT"),
  validateQuery(listAuditLogsQuerySchema),
  asyncHandler(auditLogController.exportAuditLogs)
);

router.get(
  "/audit-logs/:id",
  requirePermission("AUDIT_VIEW"),
  asyncHandler(auditLogController.getAuditLog)
);

router.get(
  "/audit-logs/user/:id",
  requirePermission("AUDIT_VIEW"),
  validateQuery(userActivityQuerySchema),
  asyncHandler(auditLogController.getUserActivity)
);

router.get(
  "/audit-logs/entity/:id",
  validateQuery(entityTimelineQuerySchema),
  asyncHandler(auditLogController.getEntityTimeline)
);

export { router as auditLogRouter };
