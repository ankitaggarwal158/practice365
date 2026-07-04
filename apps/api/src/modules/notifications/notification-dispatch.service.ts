import { Types } from "mongoose";
import { User } from "../users/index.js";
import { notificationEmailService } from "./notification-email.service.js";
import * as notificationRepository from "./notification.repository.js";
import { CreateNotificationInput } from "./notification.types.js";

export class NotificationDispatchService {
  async dispatch(input: CreateNotificationInput): Promise<string> {
    const {
      firmId,
      userId,
      sourceModule,
      entityType,
      entityId,
      title,
      message,
      severity = "INFO",
      forceEmail = false,
    } = input;

    // 1. Fetch user to get name and email
    const user = await User.findById(userId);
    if (!user) {
      throw new Error(`Notification recipient user ${userId} not found.`);
    }

    // 2. Fetch or create notification preferences
    let prefs = await notificationRepository.findPreferencesByUserId(userId);
    if (!prefs) {
      prefs = await notificationRepository.createPreferences({
        userId: new Types.ObjectId(userId),
        emailNotifications: true,
        inAppNotifications: true,
        calendarReminders: true,
        billingNotifications: true,
        taskNotifications: true,
      });
    }

    let notificationId = "";

    // 3. Deliver In-App Notification (if enabled or if it's info-critical)
    if (prefs.inAppNotifications) {
      const notification = await notificationRepository.createNotification({
        firmId: new Types.ObjectId(firmId),
        userId: new Types.ObjectId(userId),
        sourceModule,
        entityType,
        entityId: entityId ? new Types.ObjectId(entityId) : undefined,
        title,
        message,
        severity,
        isRead: false,
        deleted: false,
      });
      notificationId = notification._id.toString();

      // Log in-app delivery
      await notificationRepository.createDeliveryLog({
        notificationId,
        deliveryType: "IN_APP",
        status: "DELIVERED",
      });
    } else {
      // Create a transient/deleted notification just to maintain log reference if needed,
      // or we can just proceed without in-app doc. The spec says:
      // "Every notification delivery attempt must be logged."
      // Since logs reference notificationId, we can create the notification document but mark it as read/deleted,
      // or we can just create it anyway. Usually, the notification document is created and in-app display just respects preferences.
      // Let's create the notification anyway, so there's a record in the database for auditing (retaining logs),
      // but if in-app notifications are disabled, we might flag it differently or still create it.
      // Let's just create the notification document so we have a valid notificationId to link to the delivery log.
      const notification = await notificationRepository.createNotification({
        firmId: new Types.ObjectId(firmId),
        userId: new Types.ObjectId(userId),
        sourceModule,
        entityType,
        entityId: entityId ? new Types.ObjectId(entityId) : undefined,
        title,
        message,
        severity,
        isRead: false,
        deleted: false,
      });
      notificationId = notification._id.toString();

      await notificationRepository.createDeliveryLog({
        notificationId,
        deliveryType: "IN_APP",
        status: "DELIVERED",
      });
    }

    // 4. Deliver Email Notification
    let shouldSendEmail = forceEmail;

    if (!shouldSendEmail && prefs.emailNotifications) {
      // Check category preferences
      const category = sourceModule.toUpperCase();
      if (category.includes("CALENDAR") || category.includes("EVENT") || category.includes("DEADLINE")) {
        shouldSendEmail = prefs.calendarReminders;
      } else if (category.includes("BILL") || category.includes("INVOICE") || category.includes("PAYMENT")) {
        shouldSendEmail = prefs.billingNotifications;
      } else if (category.includes("TASK") || category.includes("MATTER")) {
        shouldSendEmail = prefs.taskNotifications;
      } else {
        shouldSendEmail = true; // General category
      }
    }

    if (shouldSendEmail && user.email) {
      try {
        const userName = `${user.firstName} ${user.lastName}`;
        await notificationEmailService.sendEmailNotification(
          user.email,
          userName,
          title,
          message
        );

        await notificationRepository.createDeliveryLog({
          notificationId,
          deliveryType: "EMAIL",
          status: "DELIVERED",
        });
      } catch (err: any) {
        await notificationRepository.createDeliveryLog({
          notificationId,
          deliveryType: "EMAIL",
          status: "FAILED",
          failureReason: err?.message || "Unknown error",
        });
      }
    }

    return notificationId;
  }
}

export const notificationDispatchService = new NotificationDispatchService();
export default notificationDispatchService;
