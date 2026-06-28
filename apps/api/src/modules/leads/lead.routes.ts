import { Router } from "express";
import { asyncHandler } from "../../shared/async-handler.js";
import { authenticate } from "../auth/middleware/auth.middleware.js";
import { requirePermission } from "../roles/index.js";
import {
  validate,
  createLeadSchema,
  updateLeadSchema,
  changeStatusSchema,
  assignLeadSchema,
  addNoteSchema,
  uploadAttachmentSchema,
} from "./lead.validation.js";
import * as leadController from "./lead.controller.js";

const router = Router();

// Apply auth to all routes
router.use(authenticate);

router.get(
  "/leads",
  requirePermission("LEADS_VIEW"),
  asyncHandler(leadController.listLeads)
);

router.get(
  "/leads/:id",
  requirePermission("LEADS_VIEW"),
  asyncHandler(leadController.getLead)
);

router.post(
  "/leads",
  requirePermission("LEADS_CREATE"),
  validate(createLeadSchema),
  asyncHandler(leadController.createLead)
);

router.patch(
  "/leads/:id",
  requirePermission("LEADS_UPDATE"),
  validate(updateLeadSchema),
  asyncHandler(leadController.updateLead)
);

router.patch(
  "/leads/:id/status",
  requirePermission("LEADS_UPDATE"),
  validate(changeStatusSchema),
  asyncHandler(leadController.updateStatus)
);

router.patch(
  "/leads/:id/assign",
  requirePermission("LEADS_ASSIGN"),
  validate(assignLeadSchema),
  asyncHandler(leadController.assignLead)
);

router.post(
  "/leads/:id/notes",
  requirePermission("LEADS_UPDATE"),
  validate(addNoteSchema),
  asyncHandler(leadController.addNote)
);

router.post(
  "/leads/:id/attachments",
  requirePermission("LEADS_UPDATE"),
  validate(uploadAttachmentSchema),
  asyncHandler(leadController.addAttachment)
);

router.post(
  "/leads/:id/convert",
  requirePermission("LEADS_CONVERT"),
  asyncHandler(leadController.convertLead)
);

export { router as leadRouter };
export default router;
