import { Router } from "express";
import { timeEntryController } from "./time-entry.controller.js";
import { authenticate as requireAuth } from "../auth/middleware/auth.middleware.js";
import { requirePermission } from "../roles/middleware/authorization.middleware.js";
import { validateRequest } from "../../shared/validate.js";
import {
  CreateTimeEntrySchema,
  UpdateTimeEntrySchema,
  StartTimerSchema,
  SearchTimeEntriesSchema,
} from "./validations/time-entry.validation.js";

const router = Router();

// Apply auth to all routes in this module
router.use(requireAuth);

// Manual Entries
router.post(
  "/",
  requirePermission("TIME_ENTRIES_CREATE"),
  validateRequest(CreateTimeEntrySchema),
  timeEntryController.createManualEntry
);

router.get(
  "/",
  requirePermission("TIME_ENTRIES_VIEW"),
  validateRequest(SearchTimeEntriesSchema),
  timeEntryController.search
);

router.get(
  "/:id",
  requirePermission("TIME_ENTRIES_VIEW"),
  timeEntryController.getEntryById
);

router.patch(
  "/:id",
  requirePermission("TIME_ENTRIES_MANAGE"), // Simplified permission check
  validateRequest(UpdateTimeEntrySchema),
  timeEntryController.updateEntry
);

router.delete(
  "/:id",
  requirePermission("TIME_ENTRIES_MANAGE"),
  timeEntryController.deleteEntry
);

// Timer endpoints
router.get(
  "/timer/active",
  requirePermission("TIME_ENTRIES_VIEW"),
  timeEntryController.getActiveTimer
);

router.post(
  "/timer/start",
  requirePermission("TIME_ENTRIES_CREATE"),
  validateRequest(StartTimerSchema),
  timeEntryController.startTimer
);

router.post(
  "/timer/pause",
  requirePermission("TIME_ENTRIES_CREATE"),
  timeEntryController.pauseTimer
);

router.post(
  "/timer/resume",
  requirePermission("TIME_ENTRIES_CREATE"),
  timeEntryController.resumeTimer
);

router.post(
  "/timer/stop",
  requirePermission("TIME_ENTRIES_CREATE"),
  timeEntryController.stopTimer
);

export const timeEntryRouter = router;
