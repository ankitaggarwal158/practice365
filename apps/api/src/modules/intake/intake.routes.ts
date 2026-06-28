import { Router } from "express";
import { asyncHandler } from "../../shared/async-handler.js";
import { authenticate } from "../auth/middleware/auth.middleware.js";
import { requirePermission } from "../roles/index.js";
import {
  validate,
  createIntakeSchema,
  updateIntakeSchema,
  updateStatusSchema,
  assignIntakeSchema,
  addNoteSchema,
  uploadAttachmentSchema,
} from "./intake.validation.js";
import * as intakeController from "./intake.controller.js";

const router = Router();

// Apply authentication middleware to all routes
router.use(authenticate);

router.get(
  "/intakes",
  requirePermission("INTAKES_VIEW"),
  asyncHandler(intakeController.listIntakes)
);

router.get(
  "/intakes/:id",
  requirePermission("INTAKES_VIEW"),
  asyncHandler(intakeController.getIntake)
);

router.post(
  "/intakes",
  requirePermission("INTAKES_CREATE"),
  validate(createIntakeSchema),
  asyncHandler(intakeController.createIntake)
);

router.patch(
  "/intakes/:id",
  requirePermission("INTAKES_UPDATE"),
  validate(updateIntakeSchema),
  asyncHandler(intakeController.updateIntake)
);

router.patch(
  "/intakes/:id/status",
  requirePermission("INTAKES_UPDATE"),
  validate(updateStatusSchema),
  asyncHandler(intakeController.updateStatus)
);

router.patch(
  "/intakes/:id/assign",
  requirePermission("INTAKES_ASSIGN"),
  validate(assignIntakeSchema),
  asyncHandler(intakeController.assignIntake)
);

router.post(
  "/intakes/:id/notes",
  requirePermission("INTAKES_UPDATE"),
  validate(addNoteSchema),
  asyncHandler(intakeController.addNote)
);

router.post(
  "/intakes/:id/attachments",
  requirePermission("INTAKES_UPDATE"),
  validate(uploadAttachmentSchema),
  asyncHandler(intakeController.addAttachment)
);

router.post(
  "/intakes/:id/convert",
  requirePermission("INTAKES_CONVERT"),
  asyncHandler(intakeController.convertToLead)
);

export { router as intakeRouter };
export default router;
