import { Router } from "express";
import { asyncHandler } from "../../shared/async-handler.js";
import { authenticate } from "../auth/middleware/auth.middleware.js";
import { requirePermission } from "../roles/index.js";
import {
  validate,
  executeCheckSchema,
  manualSearchSchema,
  reviewDecisionSchema,
} from "./conflict-check.validation.js";
import * as conflictCheckController from "./conflict-check.controller.js";

const router = Router();

// Apply auth middleware to all routes
router.use(authenticate);

router.post(
  "/conflict-checks",
  requirePermission("CONFLICT_RUN"),
  validate(executeCheckSchema),
  asyncHandler(conflictCheckController.executeConflictCheck)
);

router.get(
  "/conflict-checks",
  requirePermission("CONFLICT_VIEW"),
  asyncHandler(conflictCheckController.listConflictChecks)
);

router.get(
  "/conflict-checks/:id",
  requirePermission("CONFLICT_VIEW"),
  asyncHandler(conflictCheckController.getConflictCheck)
);

router.patch(
  "/conflict-checks/:id/review",
  requirePermission("CONFLICT_REVIEW"),
  validate(reviewDecisionSchema),
  asyncHandler(conflictCheckController.recordDecision)
);

router.post(
  "/conflict-checks/manual-search",
  requirePermission("CONFLICT_RUN"),
  validate(manualSearchSchema),
  asyncHandler(conflictCheckController.manualConflictSearch)
);

export { router as conflictCheckRouter };
export default router;
