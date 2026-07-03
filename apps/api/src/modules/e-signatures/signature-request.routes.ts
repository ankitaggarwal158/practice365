import { Router } from "express";
import { asyncHandler } from "../../shared/async-handler.js";
import { authenticate as requireAuth } from "../auth/middleware/auth.middleware.js";
import { requirePermission } from "../roles/index.js";
import {
  validate,
  createSignatureRequestSchema,
  submitSignatureSchema,
} from "./signature-request.validation.js";
import * as signatureController from "./signature-request.controller.js";

const router = Router();

// ─── Authenticated/Firm Endpoints ──────────────────────────────
router.get(
  "/signature-requests",
  requireAuth,
  requirePermission("SIGNATURE_VIEW"),
  asyncHandler(signatureController.listRequests)
);

router.get(
  "/signature-requests/:id",
  requireAuth,
  requirePermission("SIGNATURE_VIEW"),
  asyncHandler(signatureController.getRequest)
);

router.post(
  "/signature-requests",
  requireAuth,
  requirePermission("SIGNATURE_MANAGE"),
  validate(createSignatureRequestSchema),
  asyncHandler(signatureController.createRequest)
);

router.post(
  "/signature-requests/:id/send",
  requireAuth,
  requirePermission("SIGNATURE_MANAGE"),
  asyncHandler(signatureController.sendRequest)
);

router.post(
  "/signature-requests/:id/cancel",
  requireAuth,
  requirePermission("SIGNATURE_MANAGE"),
  asyncHandler(signatureController.cancelRequest)
);

router.post(
  "/signature-requests/:id/remind",
  requireAuth,
  requirePermission("SIGNATURE_MANAGE"),
  asyncHandler(signatureController.sendReminders)
);

router.delete(
  "/signature-requests/:id",
  requireAuth,
  requirePermission("SIGNATURE_MANAGE"),
  asyncHandler(signatureController.softDeleteRequest)
);

router.get(
  "/signature-requests/:id/download",
  requireAuth,
  requirePermission("SIGNATURE_VIEW"),
  asyncHandler(signatureController.downloadSignedDocument)
);

// ─── Public/Guest Endpoints ─────────────────────────────────────
router.get(
  "/sign/:token",
  asyncHandler(signatureController.loadSigningSession)
);

router.post(
  "/sign/:token",
  validate(submitSignatureSchema),
  asyncHandler(signatureController.submitSignature)
);

export { router as signatureRequestRouter };
export default router;
