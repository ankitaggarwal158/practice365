import { Router } from "express";
import { asyncHandler } from "../../shared/async-handler.js";
import { authenticate } from "../auth/middleware/auth.middleware.js";
import { requirePermission } from "../roles/index.js";
import {
  validate,
} from "../../shared/validate.js";
import {
  createPracticeAreaSchema,
  updatePracticeAreaSchema,
  updateStatusSchema,
  reorderPracticeAreasSchema,
} from "./practice-area.validation.js";
import * as practiceAreaController from "./practice-area.controller.js";

const router = Router();

router.use(authenticate);

router.get(
  "/practice-areas",
  requirePermission("PRACTICE_AREAS_VIEW"),
  asyncHandler(practiceAreaController.listPracticeAreas)
);

router.get(
  "/practice-areas/active",
  requirePermission("PRACTICE_AREAS_VIEW"),
  asyncHandler(practiceAreaController.listActivePracticeAreas)
);

router.post(
  "/practice-areas",
  requirePermission("PRACTICE_AREAS_MANAGE"),
  validate(createPracticeAreaSchema),
  asyncHandler(practiceAreaController.createPracticeArea)
);

router.patch(
  "/practice-areas/reorder",
  requirePermission("PRACTICE_AREAS_MANAGE"),
  validate(reorderPracticeAreasSchema),
  asyncHandler(practiceAreaController.reorderPracticeAreas)
);

router.get(
  "/practice-areas/:id",
  requirePermission("PRACTICE_AREAS_VIEW"),
  asyncHandler(practiceAreaController.getPracticeArea)
);

router.patch(
  "/practice-areas/:id",
  requirePermission("PRACTICE_AREAS_MANAGE"),
  validate(updatePracticeAreaSchema),
  asyncHandler(practiceAreaController.updatePracticeArea)
);

router.patch(
  "/practice-areas/:id/status",
  requirePermission("PRACTICE_AREAS_MANAGE"),
  validate(updateStatusSchema),
  asyncHandler(practiceAreaController.updateStatus)
);

router.delete(
  "/practice-areas/:id",
  requirePermission("PRACTICE_AREAS_MANAGE"),
  asyncHandler(practiceAreaController.deletePracticeArea)
);

export { router as practiceAreaRouter };
