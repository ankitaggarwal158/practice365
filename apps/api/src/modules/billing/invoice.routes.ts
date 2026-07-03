import { Router } from "express";
import { invoiceController } from "./invoice.controller.js";
import { authenticate as requireAuth } from "../auth/middleware/auth.middleware.js";
import { requirePermission } from "../roles/middleware/authorization.middleware.js";
import { validateRequest } from "../../shared/validate.js";
import {
  CreateInvoiceSchema,
  UpdateInvoiceSchema,
  RecordPaymentSchema,
  SearchInvoicesSchema,
} from "./invoice.validation.js";

const router = Router();

// Apply auth middleware globally to this module
router.use(requireAuth);

router.get(
  "/",
  requirePermission("INVOICES_VIEW"),
  validateRequest(SearchInvoicesSchema),
  invoiceController.search
);

router.post(
  "/",
  requirePermission("INVOICES_CREATE"),
  validateRequest(CreateInvoiceSchema),
  invoiceController.createDraft
);

router.get(
  "/:id",
  requirePermission("INVOICES_VIEW"),
  invoiceController.getInvoiceById
);

router.patch(
  "/:id",
  requirePermission("INVOICES_MANAGE"),
  validateRequest(UpdateInvoiceSchema),
  invoiceController.updateDraft
);

router.delete(
  "/:id",
  requirePermission("INVOICES_MANAGE"),
  invoiceController.deleteDraft
);

router.post(
  "/:id/issue",
  requirePermission("INVOICES_MANAGE"),
  invoiceController.issueInvoice
);

router.post(
  "/:id/cancel",
  requirePermission("INVOICES_MANAGE"),
  invoiceController.cancelInvoice
);

router.post(
  "/:id/payment",
  requirePermission("INVOICES_PAY"),
  validateRequest(RecordPaymentSchema),
  invoiceController.recordPayment
);

router.get(
  "/:id/payments",
  requirePermission("INVOICES_VIEW"),
  invoiceController.getInvoicePayments
);

router.get(
  "/:id/pdf",
  requirePermission("INVOICES_VIEW"),
  invoiceController.downloadPDF
);

export const invoiceRouter = router;
