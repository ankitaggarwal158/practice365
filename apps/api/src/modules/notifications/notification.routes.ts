import { Router } from "express";
import { asyncHandler } from "../../shared/async-handler.js";
import { authenticate } from "../auth/middleware/auth.middleware.js";
import {
  validate,
  SearchNotificationsSchema,
  MarkReadSchema,
  DeleteNotificationSchema,
  UpdatePreferencesSchema,
} from "./notification.validation.js";
import * as notificationController from "./notification.controller.js";

export const notificationRouter = Router();

// Secure all notification endpoints
notificationRouter.use(authenticate);

// ─── User Notifications ───────────────────────────────────────

notificationRouter.get(
  "/notifications",
  validate(SearchNotificationsSchema),
  asyncHandler(notificationController.listNotifications)
);

notificationRouter.get(
  "/notifications/unread-count",
  asyncHandler(notificationController.getUnreadCount)
);

notificationRouter.patch(
  "/notifications/read-all",
  asyncHandler(notificationController.markAllNotificationsRead)
);

notificationRouter.patch(
  "/notifications/:id/read",
  validate(MarkReadSchema),
  asyncHandler(notificationController.markNotificationRead)
);

notificationRouter.delete(
  "/notifications/:id",
  validate(DeleteNotificationSchema),
  asyncHandler(notificationController.deleteNotification)
);

// ─── Notification Preferences ─────────────────────────────────

notificationRouter.get(
  "/notification-preferences",
  asyncHandler(notificationController.getPreferences)
);

notificationRouter.patch(
  "/notification-preferences",
  validate(UpdatePreferencesSchema),
  asyncHandler(notificationController.updatePreferences)
);

export default notificationRouter;
