import { Router } from "express";
import { asyncHandler } from "../../shared/async-handler.js";
import { requirePermission } from "../roles/index.js";
import { authenticate } from "../auth/middleware/auth.middleware.js";
import {
  validate,
  createEventSchema,
  updateEventSchema,
  completeEventSchema,
} from "./calendar.validation.js";
import * as calendarController from "./calendar.controller.js";

const router = Router();

router.get(
  "/calendar/events",
  authenticate,
  requirePermission("CALENDAR_VIEW"),
  asyncHandler(calendarController.listEvents)
);

router.get(
  "/calendar/events/:id",
  authenticate,
  requirePermission("CALENDAR_VIEW"),
  asyncHandler(calendarController.getEvent)
);

router.post(
  "/calendar/events",
  authenticate,
  requirePermission("CALENDAR_MANAGE"),
  validate(createEventSchema),
  asyncHandler(calendarController.createEvent)
);

router.patch(
  "/calendar/events/:id",
  authenticate,
  requirePermission("CALENDAR_MANAGE"),
  validate(updateEventSchema),
  asyncHandler(calendarController.updateEvent)
);

router.delete(
  "/calendar/events/:id",
  authenticate,
  requirePermission("CALENDAR_MANAGE"),
  asyncHandler(calendarController.deleteEvent)
);

router.patch(
  "/calendar/events/:id/complete",
  authenticate,
  requirePermission("CALENDAR_MANAGE"),
  validate(completeEventSchema),
  asyncHandler(calendarController.completeEvent)
);

export { router as calendarRouter };
