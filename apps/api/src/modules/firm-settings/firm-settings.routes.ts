import { Router } from "express";
import multer from "multer";
import { asyncHandler } from "../../shared/async-handler.js";
import { requirePermission } from "../roles/index.js";
import { validate, updateFirmSettingsSchema } from "./firm-settings.validation.js";
import * as controller from "./firm-settings.controller.js";

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB limit
});

router.get(
  "/firm-settings",
  requirePermission("FIRM_SETTINGS_VIEW"),
  asyncHandler(controller.getSettings)
);

router.patch(
  "/firm-settings",
  requirePermission("FIRM_SETTINGS_MANAGE"),
  validate(updateFirmSettingsSchema),
  asyncHandler(controller.updateSettings)
);

router.post(
  "/firm-settings/logo",
  requirePermission("FIRM_SETTINGS_MANAGE"),
  upload.single("logo"),
  asyncHandler(controller.uploadLogo)
);

export { router as firmSettingsRouter };
export default router;
