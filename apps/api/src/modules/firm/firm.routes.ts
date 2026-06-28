import { Router } from "express";
import { asyncHandler } from "../../shared/async-handler.js";
import { authenticate } from "../auth/middleware/auth.middleware.js";
import { requirePermission } from "../roles/index.js";
import {
  validate,
  updateFirmProfileSchema,
  updateSettingsSchema,
  updateBrandingSchema,
} from "./firm.validation.js";
import * as firmController from "./firm.controller.js";

const router = Router();

// Apply authenticate to all routes
router.use(authenticate);

router.get(
  "/firm",
  requirePermission("FIRM_VIEW"),
  asyncHandler(firmController.getFirm)
);

router.patch(
  "/firm",
  requirePermission("FIRM_UPDATE"),
  validate(updateFirmProfileSchema),
  asyncHandler(firmController.updateFirm)
);

router.patch(
  "/firm/branding",
  requirePermission("FIRM_UPDATE"),
  validate(updateBrandingSchema),
  asyncHandler(firmController.updateBranding)
);

router.get(
  "/firm/settings",
  requirePermission("FIRM_VIEW"),
  asyncHandler(firmController.getSettings)
);

router.patch(
  "/firm/settings",
  requirePermission("FIRM_UPDATE"),
  validate(updateSettingsSchema),
  asyncHandler(firmController.updateSettings)
);

export { router as firmRouter };
export default router;
