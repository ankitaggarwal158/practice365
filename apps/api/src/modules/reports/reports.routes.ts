import { Router } from "express";
import { asyncHandler } from "../../shared/async-handler.js";
import { authenticate as requireAuth } from "../auth/middleware/auth.middleware.js";
import { requirePermission } from "../roles/index.js";
import { hasPermission } from "../roles/service/permission.service.js";
import { AppError } from "../../shared/app-error.js";
import {
  validateQuery,
  matterReportQuerySchema,
  clientReportQuerySchema,
  timeReportQuerySchema,
  invoiceReportQuerySchema,
  revenueReportQuerySchema,
  userActivityReportQuerySchema,
  exportReportQuerySchema,
} from "./reports.validation.js";
import * as controller from "./reports.controller.js";

const router = Router();

// Require authentication for all report endpoints
router.use(requireAuth);

router.get(
  "/reports/matters",
  requirePermission("MATTERS_VIEW"),
  validateQuery(matterReportQuerySchema),
  asyncHandler(controller.getMattersReport)
);

router.get(
  "/reports/clients",
  requirePermission("CLIENTS_VIEW"),
  validateQuery(clientReportQuerySchema),
  asyncHandler(controller.getClientsReport)
);

router.get(
  "/reports/time",
  requirePermission("TIME_ENTRIES_VIEW"),
  validateQuery(timeReportQuerySchema),
  asyncHandler(controller.getTimeReport)
);

router.get(
  "/reports/invoices",
  requirePermission("INVOICES_VIEW"),
  validateQuery(invoiceReportQuerySchema),
  asyncHandler(controller.getInvoicesReport)
);

router.get(
  "/reports/revenue",
  requirePermission("INVOICES_VIEW"),
  validateQuery(revenueReportQuerySchema),
  asyncHandler(controller.getRevenueReport)
);

router.get(
  "/reports/user-activity",
  requirePermission("AUDIT_VIEW"),
  validateQuery(userActivityReportQuerySchema),
  asyncHandler(controller.getUserActivityReport)
);

// Dynamic permission checker for export
const authorizeExport = async (req: any, _res: any, next: any) => {
  try {
    const type = req.query.type;
    let requiredPermission = "";
    switch (type) {
      case "matters":
        requiredPermission = "MATTERS_VIEW";
        break;
      case "clients":
        requiredPermission = "CLIENTS_VIEW";
        break;
      case "time":
        requiredPermission = "TIME_ENTRIES_VIEW";
        break;
      case "invoices":
      case "revenue":
        requiredPermission = "INVOICES_VIEW";
        break;
      case "user-activity":
        requiredPermission = "AUDIT_VIEW";
        break;
      default:
        throw AppError.badRequest("Invalid report type specified.");
    }
    const allowed = await hasPermission(req.user.userId, requiredPermission);
    if (!allowed) {
      throw AppError.forbidden(`Access denied. Requires permission: ${requiredPermission}`);
    }
    next();
  } catch (error) {
    next(error);
  }
};

router.get(
  "/reports/export",
  validateQuery(exportReportQuerySchema),
  authorizeExport,
  asyncHandler(controller.exportReport)
);

export { router as reportsRouter };
export default router;
