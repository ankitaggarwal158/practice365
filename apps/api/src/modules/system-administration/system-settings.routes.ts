import { Router } from "express";
import { asyncHandler } from "../../shared/async-handler.js";
import { authenticate } from "../auth/middleware/auth.middleware.js";
import { requirePermission } from "../roles/index.js";
import {
  validateBody,
  updateSettingsSchema,
  createAnnouncementSchema,
  updateAnnouncementSchema,
  updateFeatureFlagSchema,
} from "./system-settings.validation.js";
import * as systemSettingsController from "./system-settings.controller.js";

const router = Router();

// Public route to get active announcements (e.g. for login page/guest view)
router.get(
  "/system/announcements/active",
  asyncHandler(systemSettingsController.listActiveAnnouncements)
);

// All other routes require authentication and the SYSTEM_ADMIN permission
router.use(authenticate);
router.use(requirePermission("SYSTEM_ADMIN"));

router.get(
  "/system/settings",
  asyncHandler(systemSettingsController.getSystemSettings)
);

router.patch(
  "/system/settings",
  validateBody(updateSettingsSchema),
  asyncHandler(systemSettingsController.updateSystemSettings)
);

router.get(
  "/system/feature-flags",
  asyncHandler(systemSettingsController.listFeatureFlags)
);

router.patch(
  "/system/feature-flags/:id",
  validateBody(updateFeatureFlagSchema),
  asyncHandler(systemSettingsController.updateFeatureFlag)
);

router.get(
  "/system/announcements",
  asyncHandler(systemSettingsController.listAnnouncements)
);

router.post(
  "/system/announcements",
  validateBody(createAnnouncementSchema),
  asyncHandler(systemSettingsController.createAnnouncement)
);

router.patch(
  "/system/announcements/:id",
  validateBody(updateAnnouncementSchema),
  asyncHandler(systemSettingsController.updateAnnouncement)
);

router.delete(
  "/system/announcements/:id",
  asyncHandler(systemSettingsController.deleteAnnouncement)
);

router.get(
  "/system/health",
  asyncHandler(systemSettingsController.getSystemHealth)
);

export { router as systemSettingsRouter };
export default router;
